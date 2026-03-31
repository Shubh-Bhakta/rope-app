"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./server-db";
import { profiles, verseComments, commentVotes, forumPosts, forumReplies, prayers as prayersTable, postVotes, prayerAmens, publicHighlights } from "./schema";
import { eq, and, desc, sql as dSql, count } from "drizzle-orm";

// ─── Profile Sync ────────────────────────────────────────────────────────────

export async function syncProfile() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Anonymous";
  const imageUrl = user.imageUrl;

  const profile = {
    userId,
    displayName,
    imageUrl,
    updatedAt: new Date(),
  };

  await db.insert(profiles).values(profile).onConflictDoUpdate({
    target: profiles.userId,
    set: profile,
  });

  return profile;
}

export async function getProfile(userId: string) {
  return await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
}

// ─── Verse Comments ──────────────────────────────────────────────────────────

export async function getVerseComments(book: string, chapter: string, verse: string, sortBy: 'top' | 'recent' = 'recent') {
  const { userId } = await auth();

  const comments = await db.query.verseComments.findMany({
    where: and(
      eq(verseComments.book, book),
      eq(verseComments.chapter, chapter.toString()),
      eq(verseComments.verse, verse.toString())
    ),
    with: {
      // We can't do Direct "with" without relations defined in schema, 
      // but we can fetch them manually or define relations.
      // For now, let's keep it simple and just fetch comments.
    },
    orderBy: sortBy === 'recent' ? [desc(verseComments.createdAt)] : undefined,
  });

  // Fetch votes and profiles for these comments
  const enrichedComments = await Promise.all(comments.map(async (c) => {
    const profile = await getProfile(c.userId);
    
    // Calculate score
    const votes = await db.select({ 
      up: dSql<number>`count(*) filter (where vote_type = 'up')`,
      down: dSql<number>`count(*) filter (where vote_type = 'down')`
    }).from(commentVotes).where(eq(commentVotes.commentId, c.id));
    
    const score = Number(votes[0].up || 0) - Number(votes[0].down || 0);
    
    // Check user's own vote
    let userVote = null;
    if (userId) {
      const v = await db.query.commentVotes.findFirst({
        where: and(eq(commentVotes.commentId, c.id), eq(commentVotes.userId, userId))
      });
      userVote = v?.voteType || null;
    }

    return {
      ...c,
      profile,
      score,
      userVote,
    };
  }));

  if (sortBy === 'top') {
    return enrichedComments.sort((a, b) => b.score - a.score);
  }

  return enrichedComments;
}

export async function postVerseComment(book: string, chapter: string, verse: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await syncProfile();

  const id = crypto.randomUUID();
  await db.insert(verseComments).values({
    id,
    userId,
    book,
    chapter: chapter.toString(),
    verse: verse.toString(),
    content,
  });

  return id;
}

export async function voteComment(commentId: string, voteType: 'up' | 'down' | null) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (voteType === null) {
    await db.delete(commentVotes).where(and(eq(commentVotes.commentId, commentId), eq(commentVotes.userId, userId)));
  } else {
    const id = `${userId}_${commentId}`;
    await db.insert(commentVotes).values({
      id,
      userId,
      commentId,
      voteType,
    }).onConflictDoUpdate({
      target: commentVotes.id,
      set: { voteType },
    });
  }

  return true;
}

// ─── Public Prayers ──────────────────────────────────────────────────────────

export async function getPublicPrayers() {
  const { userId } = await auth();
  const results = await db.query.prayers.findMany({
    where: eq(prayersTable.isPublic, true),
    orderBy: [desc(prayersTable.publicAt)],
    limit: 50,
  });

  return await Promise.all(results.map(async (p) => {
    const profile = await getProfile(p.userId);
    
    // Get amen count
    const amenCountRes = await db.select({ count: dSql<number>`count(*)` }).from(prayerAmens).where(eq(prayerAmens.prayerId, p.id));
    const amenCount = Number(amenCountRes[0].count);
    
    // Check if current user said amen
    let userAmen = false;
    if (userId) {
      const a = await db.query.prayerAmens.findFirst({
        where: and(eq(prayerAmens.prayerId, p.id), eq(prayerAmens.userId, userId))
      });
      userAmen = !!a;
    }

    return { ...p, profile, amenCount, userAmen };
  }));
}

export async function amenPrayer(prayerId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await db.query.prayerAmens.findFirst({
    where: and(eq(prayerAmens.prayerId, prayerId), eq(prayerAmens.userId, userId))
  });

  if (existing) {
    await db.delete(prayerAmens).where(and(eq(prayerAmens.prayerId, prayerId), eq(prayerAmens.userId, userId)));
    return { status: 'un-amened' };
  } else {
    const id = `${userId}_${prayerId}`;
    await db.insert(prayerAmens).values({ id, userId, prayerId });
    return { status: 'amened' };
  }
}

export async function togglePrayerPublic(prayerId: string, isPublic: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await syncProfile();

  await db.update(prayersTable)
    .set({ isPublic, publicAt: isPublic ? new Date() : null })
    .where(and(eq(prayersTable.id, prayerId), eq(prayersTable.userId, userId)));

  return true;
}

// ─── Forum ───────────────────────────────────────────────────────────────────

export async function getForumPosts(category: string = "General") {
  const { userId } = await auth();
  const posts = await db.query.forumPosts.findMany({
    where: eq(forumPosts.category, category),
    orderBy: [desc(forumPosts.createdAt)],
  });

  return await Promise.all(posts.map(async (p) => {
    const profile = await getProfile(p.userId);
    const replyCount = await db.select({ count: dSql<number>`count(*)` }).from(forumReplies).where(eq(forumReplies.postId, p.id));
    
    // Get like count
    const likeCountRes = await db.select({ count: dSql<number>`count(*)` }).from(postVotes).where(eq(postVotes.postId, p.id));
    const likeCount = Number(likeCountRes[0].count);

    // Check if current user liked
    let userLiked = false;
    if (userId) {
      const v = await db.query.postVotes.findFirst({
        where: and(eq(postVotes.postId, p.id), eq(postVotes.userId, userId))
      });
      userLiked = !!v;
    }

    return { 
      ...p, 
      profile, 
      replyCount: Number(replyCount[0].count),
      likeCount,
      userLiked
    };
  }));
}

export async function votePost(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await db.query.postVotes.findFirst({
    where: and(eq(postVotes.postId, postId), eq(postVotes.userId, userId))
  });

  if (existing) {
    await db.delete(postVotes).where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)));
    return { status: 'un-liked' };
  } else {
    const id = `${userId}_${postId}`;
    await db.insert(postVotes).values({ id, userId, postId, voteType: 'up' });
    return { status: 'liked' };
  }
}

export async function createForumPost(title: string, content: string, category: string = "General") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await syncProfile();

  const id = crypto.randomUUID();
  await db.insert(forumPosts).values({
    id,
    userId,
    title,
    content,
    category,
  });

  return id;
}

export async function getForumPostWithReplies(postId: string) {
  const post = await db.query.forumPosts.findFirst({
    where: eq(forumPosts.id, postId),
  });

  if (!post) return null;

  const profile = await getProfile(post.userId);
  const replies = await db.query.forumReplies.findMany({
    where: eq(forumReplies.postId, postId),
    orderBy: [forumReplies.createdAt],
  });

  const enrichedReplies = await Promise.all(replies.map(async (r) => {
    const rp = await getProfile(r.userId);
    return { ...r, profile: rp };
  }));

  return { ...post, profile, replies: enrichedReplies };
}

export async function postReply(postId: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await syncProfile();

  const id = crypto.randomUUID();
  await db.insert(forumReplies).values({
    id,
    postId,
    userId,
    content,
  });

  return id;
}

// ─── Public Highlights ───────────────────────────────────────────────────────

export async function getPublicHighlights(book: string, chapter: string) {
  return await db.query.publicHighlights.findMany({
    where: and(
      eq(publicHighlights.book, book),
      eq(publicHighlights.chapter, chapter.toString())
    ),
    orderBy: [desc(publicHighlights.createdAt)],
  });
}

export async function addPublicHighlight(book: string, chapter: string, verse: string, color: string, note: string = "") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await syncProfile();

  const id = crypto.randomUUID();
  await db.insert(publicHighlights).values({
    id,
    userId,
    book,
    chapter: chapter.toString(),
    verse: verse.toString(),
    color,
    note,
  });

  return id;
}
