"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./server-db";
import { entries, prayers as prayersTable, gratitude as gratitudeTable, highlights as highlightsTable, readingPlans as plansTable, memoryVerses, userSettings, feedback as feedbackTable, errorLogs as errorLogsTable } from "./schema";
import { eq, and } from "drizzle-orm";
import { RopeEntry, PrayerItem, GratitudeItem, BibleHighlight, PlanProgress } from "./store";

// ─── Entry Actions ───────────────────────────────────────────────────────────

export async function getDbEntries() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const results = await db.query.entries.findMany({
    where: eq(entries.userId, userId),
    orderBy: (entries, { desc }) => [desc(entries.createdAt)],
  });

  return results.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  })) as RopeEntry[];
}

export async function saveDbEntry(entry: RopeEntry) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const entryToSave = {
    ...entry,
    userId,
    createdAt: new Date(entry.createdAt),
    executionStatus: entry.executionStatus as "yes" | "partly" | "not_yet" | null,
  };

  await db.insert(entries)
    .values(entryToSave)
    .onConflictDoUpdate({
      target: entries.id,
      set: entryToSave,
    });
    
  return true;
}

export async function deleteDbEntry(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(entries)
    .where(and(eq(entries.id, id), eq(entries.userId, userId)));
    
  return true;
}

export async function syncEntries(localEntries: RopeEntry[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (localEntries.length === 0) return true;

  for (const entry of localEntries) {
    const formatted = {
      ...entry,
      userId,
      createdAt: new Date(entry.createdAt),
      executionStatus: entry.executionStatus as "yes" | "partly" | "not_yet" | null,
    };
    await db.insert(entries).values(formatted).onConflictDoUpdate({ target: entries.id, set: formatted });
  }
  return true;
}

// ─── Prayer Actions ──────────────────────────────────────────────────────────

export async function getDbPrayers() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const results = await db.query.prayers.findMany({
    where: eq(prayersTable.userId, userId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  return results.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    answeredAt: r.answeredAt?.toISOString() || null,
    publicAt: r.publicAt?.toISOString() || null,
  })) as PrayerItem[];
}

export async function saveDbPrayer(prayer: PrayerItem) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const toSave = {
    id: prayer.id,
    userId,
    text: prayer.text,
    verse: prayer.verse,
    answeredNote: prayer.answeredNote,
    isPublic: prayer.isPublic,
    createdAt: new Date(prayer.createdAt),
    answeredAt: prayer.answeredAt ? new Date(prayer.answeredAt) : null,
    publicAt: prayer.publicAt ? new Date(prayer.publicAt) : null,
  };

  await db.insert(prayersTable).values(toSave).onConflictDoUpdate({ target: prayersTable.id, set: toSave });
  return true;
}

export async function deleteDbPrayer(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await db.delete(prayersTable).where(and(eq(prayersTable.id, id), eq(prayersTable.userId, userId)));
  return true;
}

export async function syncPrayers(local: PrayerItem[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  for (const item of local) {
    const toSave = { 
      id: item.id,
      userId,
      text: item.text,
      verse: item.verse,
      answeredNote: item.answeredNote,
      isPublic: item.isPublic,
      createdAt: new Date(item.createdAt), 
      answeredAt: item.answeredAt ? new Date(item.answeredAt) : null,
      publicAt: item.publicAt ? new Date(item.publicAt) : null,
    };
    await db.insert(prayersTable).values(toSave).onConflictDoUpdate({ target: prayersTable.id, set: toSave });
  }
  return true;
}

// ─── Highlight Actions ───────────────────────────────────────────────────────

export async function getDbHighlights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const results = await db.query.highlights.findMany({
    where: eq(highlightsTable.userId, userId),
  });

  return results.map(r => ({
    ...r,
    chapter: parseInt(r.chapter, 10),
    verse: parseInt(r.verse, 10),
    createdAt: r.createdAt.toISOString(),
  })) as BibleHighlight[];
}

export async function saveDbHighlight(h: BibleHighlight) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const toSave = {
    ...h,
    id: `${userId}_${h.book}_${h.chapter}_${h.verse}`, // unique id for conflict
    userId,
    chapter: h.chapter.toString(),
    verse: h.verse.toString(),
    createdAt: new Date(h.createdAt),
  };

  await db.insert(highlightsTable).values(toSave).onConflictDoUpdate({ target: highlightsTable.id, set: toSave });
  return true;
}

export async function deleteDbHighlight(book: string, chapter: number, verse: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await db.delete(highlightsTable).where(and(
    eq(highlightsTable.userId, userId),
    eq(highlightsTable.book, book),
    eq(highlightsTable.chapter, chapter.toString()),
    eq(highlightsTable.verse, verse.toString())
  ));
  return true;
}

export async function syncHighlights(local: BibleHighlight[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  for (const h of local) {
    const toSave = {
      ...h,
      id: `${userId}_${h.book}_${h.chapter}_${h.verse}`,
      userId,
      chapter: h.chapter.toString(),
      verse: h.verse.toString(),
      createdAt: new Date(h.createdAt),
    };
    await db.insert(highlightsTable).values(toSave).onConflictDoUpdate({ target: highlightsTable.id, set: toSave });
  }
  return true;
}

// ─── Gratitude Actions ───────────────────────────────────────────────────────

export async function getDbGratitude() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const results = await db.query.gratitude.findMany({ where: eq(gratitudeTable.userId, userId) });
  return results.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })) as GratitudeItem[];
}

export async function saveDbGratitude(item: GratitudeItem) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const toSave = { ...item, userId, createdAt: new Date(item.createdAt) };
  await db.insert(gratitudeTable).values(toSave).onConflictDoUpdate({ target: gratitudeTable.id, set: toSave });
  return true;
}

export async function deleteDbGratitude(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await db.delete(gratitudeTable).where(and(eq(gratitudeTable.id, id), eq(gratitudeTable.userId, userId)));
  return true;
}

export async function syncGratitude(local: GratitudeItem[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  for (const item of local) {
    const toSave = { ...item, userId, createdAt: new Date(item.createdAt) };
    await db.insert(gratitudeTable).values(toSave).onConflictDoUpdate({ target: gratitudeTable.id, set: toSave });
  }
  return true;
}

// ─── Plan Actions ────────────────────────────────────────────────────────────

export async function getDbPlanProgress() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const result = await db.query.readingPlans.findFirst({ where: eq(plansTable.userId, userId) });
  if (!result) return null;
  return {
    ...result,
    currentDay: parseInt(result.currentDay, 10),
    completedDays: JSON.parse(result.completedDays),
    paused: result.paused === "true",
    startedAt: result.startAt.toISOString(),
  } as PlanProgress;
}

export async function saveDbPlanProgress(p: PlanProgress) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const toSave = {
    userId,
    planId: p.planId,
    currentDay: p.currentDay.toString(),
    completedDays: JSON.stringify(p.completedDays),
    paused: p.paused ? "true" : "false",
    startAt: new Date(p.startedAt),
  };
  await db.insert(plansTable).values(toSave).onConflictDoUpdate({ target: plansTable.userId, set: toSave });
  return true;
}

// ─── Memory Verse Actions ──────────────────────────────────────────────────

export async function getDbMemoryVerses() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const results = await db.query.memoryVerses.findMany({ where: eq(memoryVerses.userId, userId) });
  return results.map(r => ({ verse: r.verse, text: r.text, addedAt: r.addedAt.toISOString() }));
}

export async function saveDbMemoryVerse(mv: { verse: string; text: string; addedAt: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const id = `${userId}_${mv.verse.replace(/\s+/g, "_")}`;
  const toSave = { ...mv, id, userId, addedAt: new Date(mv.addedAt) };
  await db.insert(memoryVerses).values(toSave).onConflictDoUpdate({ target: memoryVerses.id, set: toSave });
  return true;
}

export async function deleteDbMemoryVerse(verse: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const id = `${userId}_${verse.replace(/\s+/g, "_")}`;
  await db.delete(memoryVerses).where(and(eq(memoryVerses.id, id), eq(memoryVerses.userId, userId)));
  return true;
}

export async function syncMemoryVerses(local: { verse: string; text: string; addedAt: string }[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  for (const mv of local) {
    const id = `${userId}_${mv.verse.replace(/\s+/g, "_")}`;
    const toSave = { ...mv, id, userId, addedAt: new Date(mv.addedAt) };
    await db.insert(memoryVerses).values(toSave).onConflictDoUpdate({ target: memoryVerses.id, set: toSave });
  }
  return true;
}

// ─── Settings Actions ──────────────────────────────────────────────────────

export async function getDbSettings() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const result = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, userId) });
  if (!result) return null;
  return {
    ...result,
    lastRead: JSON.parse(result.lastRead) as any[]
  };
}

export async function saveDbSettings(s: { darkMode: boolean; translation: string; onboardingComplete: boolean; lastRead: any[] }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const toSave = {
    userId,
    darkMode: s.darkMode,
    translation: s.translation,
    onboardingComplete: s.onboardingComplete,
    lastRead: JSON.stringify(s.lastRead),
    updatedAt: new Date()
  };
  await db.insert(userSettings).values(toSave).onConflictDoUpdate({ target: userSettings.userId, set: toSave });
  return true;
}

export async function clearAllDbData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.transaction(async (tx) => {
    await tx.delete(entries).where(eq(entries.userId, userId));
    await tx.delete(prayersTable).where(eq(prayersTable.userId, userId));
    await tx.delete(gratitudeTable).where(eq(gratitudeTable.userId, userId));
    await tx.delete(highlightsTable).where(eq(highlightsTable.userId, userId));
    await tx.delete(plansTable).where(eq(plansTable.userId, userId));
    await tx.delete(memoryVerses).where(eq(memoryVerses.userId, userId));
    await tx.delete(userSettings).where(eq(userSettings.userId, userId));
  });

  return true;
}

export async function submitFeedback(data: { type: string; title: string; description: string }) {
  const { userId } = await auth();
  const id = Math.random().toString(36).substring(2, 11);
  const toSave = {
    id,
    userId: userId || null,
    type: data.type,
    title: data.title,
    description: data.description,
    status: "pending",
    createdAt: new Date(),
  };

  await db.insert(feedbackTable).values(toSave);

  // Webhook notification
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: `New ${data.type.toUpperCase()}: ${data.title}`,
            description: data.description,
            color: data.type === "bug" ? 0xff0000 : 0x00ff00,
            fields: [
              { name: "User ID", value: userId || "Anonymous", inline: true },
              { name: "Type", value: data.type, inline: true }
            ],
            footer: { text: "ROPE App Feedback" },
            timestamp: new Date().toISOString(),
          }]
        }),
      });
    } catch (e) {
      console.error("Failed to send webhook", e);
    }
  }

  return true;
}

export async function logErrorAction(error: { message: string; stack?: string; pathname?: string; context?: any }) {
  try {
    const { userId } = await auth();
    const id = Math.random().toString(36).substring(2, 11);
    const toSave = {
      id,
      userId: userId || null,
      message: error.message,
      stack: error.stack || null,
      pathname: error.pathname || null,
      context: error.context ? JSON.stringify(error.context) : null,
      createdAt: new Date(),
    };

    await db.insert(errorLogsTable).values(toSave);
  } catch (e) {
    console.error("Failed to log error to DB:", e);
  }
  return true;
}
