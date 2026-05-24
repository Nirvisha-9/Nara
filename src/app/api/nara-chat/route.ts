import { requireAuth } from "@/lib/auth";
import { ai, memory } from "@eazo/sdk";
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { children } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(request: any) {
  // Try auth — required for parent mode, optional for child mode
  const authResult = requireAuth(request);
  const body = await request.json();
  const { messages, mode, childId, childProfile: profileFromClient } = body;

  // For parent mode, enforce auth
  if (mode === "parent" && !authResult.ok) return authResult.response;

  const userId = authResult.ok ? authResult.user.id : null;
  // mode: "parent" | "child"

  // Fetch child profile from DB if we have an ID and a logged-in user
  let childProfile = profileFromClient;
  if (childId && !childProfile && userId) {
    const [child] = await db.select().from(children).where(eq(children.id, childId));
    if (child) childProfile = child;
  }

  const childName = childProfile?.name || "your child";
  const rawInterests = childProfile?.interests;
  const interests = Array.isArray(rawInterests)
    ? rawInterests.join(", ")
    : (rawInterests || "various things");
  const rawDiagnoses = childProfile?.diagnoses;
  const diagnoses = Array.isArray(rawDiagnoses)
    ? rawDiagnoses.join(", ")
    : (rawDiagnoses || "challenges");
  const rawCalms = childProfile?.sensoryCalms;
  const calms = Array.isArray(rawCalms)
    ? rawCalms.join(", ")
    : (rawCalms || "calming activities");
  const safeSpace = childProfile?.safeSpace || "a quiet place";
  const communicationStyle = childProfile?.communicationStyle || "verbal";
  const triggers = childProfile?.meltdownTriggers || "various triggers";

  // Build system prompt based on mode
  const systemPrompt = mode === "parent"
    ? `You are Nara, a warm, deeply empathetic AI parenting companion. Always respond in English only. You support parents and caregivers of children with autism, ADHD, anxiety, sensory processing disorder, dyslexia, speech delays, behavioral issues, emotional dysregulation, Down syndrome, and all other challenges.

Child profile:
- Name: ${childName}
- Diagnoses/challenges: ${diagnoses}
- Interests: ${interests}
- Communication style: ${communicationStyle}
- Known triggers: ${triggers}
- What calms them: ${calms}
- Safe space: ${safeSpace}

Your role:
- Provide warm, specific, actionable guidance based on this child's ACTUAL profile
- When parents share photos or videos, describe what you observe and give tailored advice
- Remember context from this conversation — reference what the parent has shared
- Never be clinical or generic — always speak to THIS parent about THIS child
- Validate the parent's feelings before giving advice
- If they describe a crisis, give immediate step-by-step guidance
- Tone: warm friend who happens to be an expert, never a textbook

Always use ${childName}'s name. Reference their interests (${interests}) in suggestions.`

    : `You are Nara, a fun, encouraging AI friend for a child named ${childName} who is ${childProfile?.age || "young"} years old. Always respond in English only.

About ${childName}:
- Loves: ${interests}
- Age: ${childProfile?.age || "young"}
- Superpowers: ${childProfile?.superpowers?.join(", ") || "being amazing"}

Your role as a child's AI friend:
- Be playful, encouraging, and age-appropriate
- Use their interests in EVERY response (if they love dinosaurs, relate everything to dinosaurs!)
- If they share a photo or drawing, celebrate it enthusiastically and ask questions about it
- Short sentences. Big emojis. Lots of encouragement.
- If they say they feel sad, angry, or scared — validate gently and suggest a calming activity
- Never scary, never clinical, always safe and joyful
- Make learning feel like playing
- Call them by name (${childName}) often

Keep responses SHORT (2-4 sentences max for the child). Use fun emojis. Be their biggest cheerleader!`;

  // Detect if any message has images — use vision model if so
  const hasImages = messages.some((m: any) => m.images?.length > 0);

  // Build messages array with multimodal support
  const aiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m: any) => {
      const hasImg = m.images?.length > 0;
      if (!hasImg) {
        return {
          role: m.role as "user" | "assistant",
          content: m.text || m.content || "",
        };
      }
      // Vision message — use OpenAI image_url format (supported by claude via Bedrock)
      return {
        role: m.role as "user" | "assistant",
        content: [
          ...(m.text ? [{ type: "text" as const, text: m.text }] : [{ type: "text" as const, text: "I've shared an image. Please look at it and respond helpfully." }]),
          ...(m.images || []).map((url: string) => {
            // Extract base64 data and media type from data URL
            const match = url.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              return {
                type: "image_url" as const,
                image_url: { url },
              };
            }
            return {
              type: "image_url" as const,
              image_url: { url },
            };
          }),
        ],
      };
    }),
  ];

  // Use vision-capable model when images are present. Use a supported vision model.
  // deepseek.v3.1 for text-only; qwen.qwen3-vl-235b-a22b-instruct for multimodal (vision)
  const model = hasImages ? "qwen.qwen3-vl-235b-a22b-instruct" : "deepseek.v3.1";

  // Stream the response
  const stream = await ai.chat({
    model,
    messages: aiMessages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        let fullText = "";
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullText += delta;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, full: fullText })}\n\n`));

        // Save to memory after completion
        const lastUserMsg = messages.filter((m: any) => m.role === "user").pop();
        if (lastUserMsg) {
          memory.reportAction({
            content: `${mode === "parent" ? "Parent" : childName} talked to Nara: "${(lastUserMsg.text || "").substring(0, 80)}"`,
            event_type: "create",
            page: `nara-chat-${mode}`,
            metadata: {
              type: "nara_chat",
              mode,
              child_name: childName,
              had_image: !!(lastUserMsg.images?.length),
            },
          }).catch(() => {});
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Failed" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
