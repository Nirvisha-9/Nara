import { pgTable, text, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";

export const children = pgTable("children", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentUserId: text("parent_user_id").notNull(),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  photoUrl: text("photo_url"),
  avatarId: text("avatar_id"),
  favoriteColor: text("favorite_color"),
  // Communication
  communicationStyle: text("communication_style"),
  communicationTools: text("communication_tools"),
  helpfulPhrases: text("helpful_phrases"),
  harmfulPhrases: text("harmful_phrases"),
  // Sensory
  sensoryOverwhelms: json("sensory_overwhelms").$type<string[]>().default([]),
  sensoryCalms: json("sensory_calms").$type<string[]>().default([]),
  safeSpace: text("safe_space"),
  safeSpacePhotoUrl: text("safe_space_photo_url"),
  // Triggers
  meltdownTriggers: text("meltdown_triggers"),
  warningSignsEarly: text("warning_signs_early"),
  warningSignsWorse: text("warning_signs_worse"),
  whatHasHelped: text("what_has_helped"),
  // Interests
  interests: text("interests"),
  strengths: text("strengths"),
  whatLightsUp: text("what_lights_up"),
  longActivities: text("long_activities"),
  // Routine
  wakeTime: text("wake_time"),
  schoolSchedule: text("school_schedule"),
  hardestTimeOfDay: text("hardest_time_of_day"),
  transitionIssues: text("transition_issues"),
  bedtimeRoutine: text("bedtime_routine"),
  recentChanges: text("recent_changes"),
  // School
  attendsSchool: boolean("attends_school"),
  schoolType: text("school_type"),
  hasIep: boolean("has_iep"),
  therapies: json("therapies").$type<string[]>().default([]),
  schoolNotes: text("school_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const childDiagnoses = pgTable("child_diagnoses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  diagnosis: text("diagnosis").notNull(),
});
