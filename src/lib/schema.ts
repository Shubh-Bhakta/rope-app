import { pgTable, text, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";

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
