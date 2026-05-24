import { db } from "@/lib/db/client";
import { dailyLogs, crisisEvents, milestones } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { ai } from "@eazo/sdk";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId");

  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 });

  // Get last 30 days of data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [logs, crises, milestonesData] = await Promise.all([
    db.select().from(dailyLogs).where(and(eq(dailyLogs.childId, childId), eq(dailyLogs.parentUserId, userId))).orderBy(desc(dailyLogs.createdAt)).limit(30),
    db.select().from(crisisEvents).where(and(eq(crisisEvents.childId, childId), eq(crisisEvents.parentUserId, userId))).orderBy(desc(crisisEvents.createdAt)).limit(20),
    db.select().from(milestones).where(and(eq(milestones.childId, childId), eq(milestones.parentUserId, userId))).orderBy(desc(milestones.celebratedAt)),
  ]);

  let patterns: string[] = [];

  try {
    const prompt = `You are Nara analyzing patterns in a child's behavioral data.

Recent crisis events (${crises.length} total): ${crises.slice(0, 5).map(c => `${c.crisisType} (intensity ${c.intensity}) on ${c.createdAt?.toLocaleDateString("en-US") || "unknown"}`).join(", ")}

Daily log emotions: ${logs.slice(0, 10).map(l => l.emotion || "unknown").join(", ")}

Parent energy levels: ${logs.slice(0, 10).map(l => l.energyLevel).join(", ")}

Generate 2-3 insights about patterns you notice. Be specific and warm, not clinical.
Reference actual data. Return JSON array of strings:
["Pattern insight 1 (specific, warm)", "Pattern insight 2", "Pattern insight 3"]`;

    const response = await ai.chat({
      model: "deepseek.v3.1",
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.choices[0]?.message?.content || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) patterns = JSON.parse(jsonMatch[0]);
  } catch {
    if (crises.length > 0) {
      patterns = [`${crises.length} crisis events recorded this month. Keep logging to help Nara identify patterns.`];
    }
  }

  return NextResponse.json({ logs, crises, milestones: milestonesData, patterns });
}
