import { db } from "@/lib/db/client";
import { crisisEvents } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { ai } from "@eazo/sdk";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  const body = await request.json();
  const { childId, crisisType, intensity, childProfile } = body;

  const childName = childProfile?.name || "your child";
  const calmSpace = childProfile?.safeSpace || "a quiet space";
  const interests = childProfile?.interests || "their interests";

  let guidance = {
    doNow: [
      `Stay calm — your calm directly regulates ${childName}`,
      `Reduce stimulation: dim lights, lower sounds`,
      `Move to ${calmSpace} if possible`,
      `Use simple words only — no full sentences right now`,
      `Offer ${interests.split(",")[0]?.trim() || "a comfort item"} without speaking`,
    ],
    doNotDo: [
      "Don't raise your voice or try to reason right now",
      "Don't demand eye contact",
      "Don't ask 'why are you upset'",
      "Don't give choices — keep it simple",
    ],
    afterItPasses: [
      "Wait at least 20 minutes before talking about it",
      `Reconnect with ${childName}'s favorite activity first`,
      "Acknowledge their feelings in simple words",
      "Keep the rest of the day calm and predictable",
    ],
  };

  try {
    const prompt = `You are Nara, a compassionate parenting companion. A parent needs immediate crisis guidance.

Child name: ${childName}
Crisis type: ${crisisType}
Intensity level: ${intensity}/5
${childProfile?.meltdownTriggers ? `Known triggers: ${childProfile.meltdownTriggers}` : ""}
${childProfile?.warningSignsEarly ? `Early warning signs: ${childProfile.warningSignsEarly}` : ""}
${childProfile?.whatHasHelped ? `What has helped before: ${childProfile.whatHasHelped}` : ""}
${childProfile?.communicationStyle ? `Communication style: ${childProfile.communicationStyle}` : ""}
${childProfile?.sensoryOverwhelms?.length ? `Sensory overwhelms: ${childProfile.sensoryOverwhelms.join(", ")}` : ""}
${childProfile?.sensoryCalms?.length ? `What calms them: ${childProfile.sensoryCalms.join(", ")}` : ""}
Calm space: ${calmSpace}
Interests: ${interests}

Generate immediate personalized crisis guidance. Return JSON with exactly this structure:
{
  "doNow": ["step 1 (use child's name, reference actual profile data)", "step 2", "step 3", "step 4", "step 5"],
  "doNotDo": ["specific thing to avoid for THIS child", "another thing"],
  "afterItPasses": ["recovery step 1", "recovery step 2", "recovery step 3"]
}

Be specific, warm, and actionable. Use ${childName}'s name. Reference their actual profile.`;

    const response = await ai.chat({
      model: "deepseek.r1-v1",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      guidance = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Use default guidance if AI fails
  }

  const [event] = await db
    .insert(crisisEvents)
    .values({
      childId,
      parentUserId: userId,
      crisisType,
      intensity,
      guidanceGenerated: guidance,
    })
    .returning();

  return NextResponse.json({ event, guidance });
}

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId");

  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 });

  const events = await db
    .select()
    .from(crisisEvents)
    .where(eq(crisisEvents.childId, childId));

  return NextResponse.json(events);
}
