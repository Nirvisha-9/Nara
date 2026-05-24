import { db } from "@/lib/db/client";
import { milestones } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId");

  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 });

  const rows = await db
    .select()
    .from(milestones)
    .where(and(eq(milestones.childId, childId), eq(milestones.parentUserId, userId)));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  const body = await request.json();
  const { childId, title, description } = body;

  const [milestone] = await db
    .insert(milestones)
    .values({ childId, parentUserId: userId, title, description })
    .returning();

  return NextResponse.json(milestone, { status: 201 });
}
