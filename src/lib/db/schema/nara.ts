import { pgTable, text, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { children } from "./children";

export const dailyLogs = pgTable("daily_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  parentUserId: text("parent_user_id").notNull(),
  date: text("date").notNull(),
  emotion: text("emotion"),
  win: text("win"),
  hardMoment: text("hard_moment"),
  energyLevel: integer("energy_level"),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  naraResponse: text("nara_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crisisEvents = pgTable("crisis_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  parentUserId: text("parent_user_id").notNull(),
  crisisType: text("crisis_type").notNull(),
  intensity: integer("intensity").notNull(),
  guidanceGenerated: json("guidance_generated").$type<{
    doNow: string[];
    doNotDo: string[];
    afterItPasses: string[];
  }>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  parentUserId: text("parent_user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  celebratedAt: timestamp("celebrated_at").defaultNow().notNull(),
});

export const teachingPlans = pgTable("teaching_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  parentUserId: text("parent_user_id").notNull(),
  skillArea: text("skill_area").notNull(),
  planData: json("plan_data").$type<{
    weeks: Array<{
      week: number;
      activities: Array<{
        day: number;
        title: string;
        steps: string[];
        phrases: string[];
        materials: string[];
        duration: string;
        successLooks: string;
      }>;
    }>;
  }>(),
  currentWeek: integer("current_week").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parentCheckins = pgTable("parent_checkins", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentUserId: text("parent_user_id").notNull(),
  emotionalState: text("emotional_state").notNull(),
  naraResponse: text("nara_response"),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
