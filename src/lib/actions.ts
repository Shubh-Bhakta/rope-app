"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./server-db";
import { entries } from "./schema";
import { eq, and } from "drizzle-orm";
import { RopeEntry } from "./store";

export async function getDbEntries() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const results = await db.query.entries.findMany({
    where: eq(entries.userId, userId),
    orderBy: (entries, { desc }) => [desc(entries.createdAt)],
  });

  // Map to frontend interface
  return results.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  })) as RopeEntry[];
}

export async function saveDbEntry(entry: RopeEntry) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Ensure entry userId matches authenticated userId
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

  // Batch insert/update
  const formatted = localEntries.map(e => ({
    ...e,
    userId,
    createdAt: new Date(e.createdAt),
    executionStatus: e.executionStatus as "yes" | "partly" | "not_yet" | null,
  }));

  // We'll do individual inserts to handle conflicts correctly or chunk them
  for (const entry of formatted) {
    await db.insert(entries)
      .values(entry)
      .onConflictDoUpdate({
        target: entries.id,
        set: entry,
      });
  }

  return true;
}
