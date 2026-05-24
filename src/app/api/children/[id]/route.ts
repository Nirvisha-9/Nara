import { db } from "@/lib/db/client";
import { children, childDiagnoses } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;
  const { id } = await params;

  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, id), eq(children.parentUserId, userId)));

  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const diagRows = await db.select().from(childDiagnoses).where(eq(childDiagnoses.childId, id));

  return NextResponse.json({ ...child, diagnoses: diagRows.map((d) => d.diagnosis) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;
  const { id } = await params;

  // Ensure this child belongs to the authenticated user
  const [existing] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, id), eq(children.parentUserId, userId)));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { diagnoses, ...rawData } = body;

  // Explicit column mapping — no unknown fields passed to Drizzle
  const updates = {
    name: rawData.name,
    dateOfBirth: rawData.dateOfBirth || null,
    gender: rawData.gender || null,
    photoUrl: rawData.photoUrl || null,
    avatarId: rawData.avatarId || null,
    favoriteColor: rawData.favoriteColor || null,
    communicationStyle: rawData.communicationStyle || null,
    communicationTools: rawData.communicationTools || null,
    helpfulPhrases: rawData.helpfulPhrases || null,
    harmfulPhrases: rawData.harmfulPhrases || null,
    sensoryOverwhelms: rawData.sensoryOverwhelms || null,
    sensoryCalms: rawData.sensoryCalms || null,
    safeSpace: rawData.safeSpace || null,
    meltdownTriggers: rawData.meltdownTriggers || null,
    warningSignsEarly: rawData.warningSignsEarly || null,
    warningSignsWorse: rawData.warningSignsWorse || null,
    whatHasHelped: rawData.whatHasHelped || null,
    interests: rawData.interests || null,
    strengths: rawData.strengths || null,
    whatLightsUp: rawData.whatLightsUp || null,
    longActivities: rawData.longActivities || null,
    wakeTime: rawData.wakeTime || null,
    hardestTimeOfDay: rawData.hardestTimeOfDay || null,
    transitionIssues: rawData.transitionIssues || null,
    bedtimeRoutine: rawData.bedtimeRoutine || null,
    recentChanges: rawData.recentChanges || null,
    attendsSchool: rawData.attendsSchool,
    schoolType: rawData.schoolType || null,
    hasIep: rawData.hasIep,
    therapies: rawData.therapies || null,
    schoolNotes: rawData.schoolNotes || null,
  };

  const [updated] = await db
    .update(children)
    .set(updates)
    .where(and(eq(children.id, id), eq(children.parentUserId, userId)))
    .returning();

  if (diagnoses !== undefined) {
    await db.delete(childDiagnoses).where(eq(childDiagnoses.childId, id));
    if (diagnoses.length > 0) {
      await db.insert(childDiagnoses).values(
        diagnoses.map((d: string) => ({ childId: id, diagnosis: d }))
      );
    }
  }

  return NextResponse.json(updated);
}
