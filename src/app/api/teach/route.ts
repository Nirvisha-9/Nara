import { db } from "@/lib/db/client";
import { teachingPlans } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { ai } from "@eazo/sdk";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  const body = await request.json();
  const { childId, skillArea, childProfile } = body;

  const childName = childProfile?.name || "your child";
  const interest = (childProfile?.interests || "their favorite things").split(",")[0]?.trim();

  const defaultPlan = {
    weeks: [
      {
        week: 1,
        activities: [
          {
            day: 1,
            title: `Introduction: ${skillArea}`,
            steps: [
              "Start with a 5-minute warm-up using a calm activity",
              `Tell ${childName}: "We're going to practice something new together"`,
              "Keep it short and celebrate any effort",
            ],
            phrases: [
              `"${childName}, let's try this together"`,
              `"You're doing great"`,
              `"One more time and then we're done"`,
            ],
            materials: ["None needed — just you and your child"],
            duration: "5-10 minutes",
            successLooks: `${childName} engages for at least 2 minutes without distress`,
          },
        ],
      },
    ],
  };

  let planData = defaultPlan;

  try {
    const prompt = `You are Nara, a specialized parenting coach. Create a personalized 3-week teaching plan.

Child: ${childName}
Skill area: ${skillArea}
Main interests: ${interest}
Communication style: ${childProfile?.communicationStyle || "verbal"}
Sensory sensitivities: ${childProfile?.sensoryOverwhelms?.join(", ") || "none specified"}
What calms them: ${childProfile?.sensoryCalms?.join(", ") || "various"}

Create a realistic 3-week plan with 3 activities per week (days 1, 3, 5). 
Use ${interest}-themed examples in EVERY activity.
Keep activities under 10 minutes each.

Return JSON:
{
  "weeks": [
    {
      "week": 1,
      "activities": [
        {
          "day": 1,
          "title": "Activity title (${interest} themed)",
          "steps": ["step 1", "step 2", "step 3"],
          "phrases": ["exact phrase to say", "another phrase"],
          "materials": ["material 1"],
          "duration": "5-10 minutes",
          "successLooks": "What success looks like today"
        }
      ]
    }
  ]
}`;

    const response = await ai.chat({
      model: "deepseek.v3.1",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      planData = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Use default plan
  }

  // Deactivate previous plans for this child/skill
  await db
    .update(teachingPlans)
    .set({ isActive: false })
    .where(and(eq(teachingPlans.childId, childId), eq(teachingPlans.skillArea, skillArea)));

  const [plan] = await db
    .insert(teachingPlans)
    .values({
      childId,
      parentUserId: userId,
      skillArea,
      planData,
      isActive: true,
    })
    .returning();

  return NextResponse.json(plan);
}

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId");

  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 });

  const plans = await db
    .select()
    .from(teachingPlans)
    .where(and(eq(teachingPlans.childId, childId), eq(teachingPlans.parentUserId, userId)));

  return NextResponse.json(plans);
}
