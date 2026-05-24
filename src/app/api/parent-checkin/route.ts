import { db } from "@/lib/db/client";
import { parentCheckins } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { ai } from "@eazo/sdk";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

const RESPONSES: Record<string, string> = {
  okay: "You're showing up, and that matters deeply. Even on the steady days, carrying what you carry takes real strength.",
  tired: "Tired but holding on is more than enough. The fact that you're still here, still trying — that's not small. That's everything.",
  struggling: "Today feels heavy, and that's okay. You don't have to have it all together right now. You are doing something incredibly hard, every single day.",
  overwhelmed: "You are allowed to feel this. Caregiver exhaustion is real and it is heavy. Please know — the love behind the exhaustion is visible in every choice you make for your child.",
  notokay: "Thank you for being honest. You don't have to be okay right now. You matter too — not just as a caregiver, but as a person. Please reach out to someone you trust today.",
};

export async function POST(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  const body = await request.json();
  const { emotionalState, recentChildWin } = body;

  const today = new Date().toLocaleDateString("en-US");
  let naraResponse = RESPONSES[emotionalState] || RESPONSES.okay;

  try {
    const prompt = `You are Nara, a deeply empathetic parenting companion. A parent just checked in.
Their emotional state: ${emotionalState}
${recentChildWin ? `A recent win with their child: "${recentChildWin}"` : ""}

Write ONE warm paragraph (3-4 sentences max) that:
1. Validates their specific feeling without being dismissive
2. Acknowledges the weight of what they carry
3. Reminds them of their strength without toxic positivity
${recentChildWin ? `4. References "${recentChildWin}" as evidence of their impact` : ""}

Never say: "I understand", "That must be hard", "You've got this!", or anything generic.
Be specific, warm, human. Write in second person.`;

    const response = await ai.chat({
      model: "deepseek.v3.1",
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.choices[0]?.message?.content?.trim() || "";
    if (text) naraResponse = text;
  } catch {
    // Use default response
  }

  const [checkin] = await db
    .insert(parentCheckins)
    .values({ parentUserId: userId, emotionalState, naraResponse, date: today })
    .returning();

  return NextResponse.json({ checkin, naraResponse });
}

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  const checkins = await db
    .select()
    .from(parentCheckins)
    .where(eq(parentCheckins.parentUserId, userId))
    .orderBy(desc(parentCheckins.createdAt))
    .limit(14);

  return NextResponse.json(checkins);
}
