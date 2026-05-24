import { db } from "@/lib/db/client";
import { children, childDiagnoses } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  const rows = await db
    .select()
    .from(children)
    .where(eq(children.parentUserId, userId));

  const childrenWithDiagnoses = await Promise.all(
    rows.map(async (child) => {
      const diagnoses = await db
        .select()
        .from(childDiagnoses)
        .where(eq(childDiagnoses.childId, child.id));
      return { ...child, diagnoses: diagnoses.map((d) => d.diagnosis) };
    })
  );

  return NextResponse.json(childrenWithDiagnoses);
}

export async function POST(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  const body = await request.json();
  const { diagnoses, ...rawData } = body;

  // Map only the columns that exist in the children table schema
  const childData = {
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

  let child: any;
  try {
    const rows = await db
      .insert(children)
      .values({ ...childData, parentUserId: userId })
      .returning();
    child = rows[0];
  } catch (err: any) {
    console.error("[POST /api/children] DB insert error:", err?.message, err);
    return NextResponse.json({ error: "Failed to save child profile", detail: err?.message }, { status: 500 });
  }

  if (diagnoses && diagnoses.length > 0) {
    try {
      await db.insert(childDiagnoses).values(
        diagnoses.map((d: string) => ({ childId: child.id, diagnosis: d }))
      );
    } catch (err: any) {
      console.error("[POST /api/children] Diagnoses insert error:", err?.message);
    }
  }

  return NextResponse.json(child, { status: 201 });
}
