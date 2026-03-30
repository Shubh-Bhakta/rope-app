import { pgTable, text, timestamp, varchar, pgEnum, boolean } from "drizzle-orm/pg-core";

export const executionStatusEnum = pgEnum("execution_status", ["yes", "partly", "not_yet"]);

export const entries = pgTable("entries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revelationVerse: text("revelation_verse").notNull(),
  revelationText: text("revelation_text").default("").notNull(),
  revelationReflection: text("revelation_reflection").default("").notNull(),
  observation: text("observation").default("").notNull(),
  prayer: text("prayer").default("").notNull(),
  execution: text("execution").default("").notNull(),
  executionStatus: executionStatusEnum("execution_status"),
  executionReflection: text("execution_reflection").default("").notNull(),
});

export const prayers = pgTable("prayers", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  text: text("text").notNull(),
  verse: text("verse").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  answeredAt: timestamp("answered_at"),
  answeredNote: text("answered_note").default("").notNull(),
});

export const gratitude = pgTable("gratitude", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  text: text("text").notNull(),
  verse: text("verse").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const highlights = pgTable("highlights", {
  id: varchar("id", { length: 255 }).primaryKey(), // composite id usually but id is simpler for sync
  userId: varchar("user_id", { length: 255 }).notNull(),
  book: varchar("book", { length: 100 }).notNull(),
  chapter: text("chapter").notNull(), // text to handle edge cases or lead zeros
  verse: text("verse").notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  note: text("note").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const readingPlans = pgTable("reading_plans", {
  userId: varchar("user_id", { length: 255 }).primaryKey(), // One active plan per user stored in DB
  planId: varchar("plan_id", { length: 255 }).notNull(),
  currentDay: text("current_day").notNull(),
  completedDays: text("completed_days").notNull(), // JSON string
  paused: text("paused").default("false").notNull(),
  startAt: timestamp("start_at").defaultNow().notNull(),
});

export const memoryVerses = pgTable("memory_verses", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  verse: text("verse").notNull(),
  text: text("text").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  userId: varchar("user_id", { length: 255 }).primaryKey(),
  darkMode: boolean("dark_mode").default(false).notNull(),
  translation: varchar("translation", { length: 16 }).default("kjv").notNull(),
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  lastRead: text("last_read").default("[]").notNull(), // JSON history array
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
