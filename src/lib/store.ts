// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  anonymousAlias: string;
}

export type ExecutionStatus = "yes" | "partly" | "not_yet" | null;

export interface RopeEntry {
  id: string;
  userId: string;
  createdAt: string;
  revelationVerse: string;
  revelationText: string;
  observation: string;
  prayer: string;
  execution: string;
  executionStatus: ExecutionStatus;
  executionReflection: string;
}

export type CircleTag = "struggle" | "prayer_request" | "praise";

export interface Reaction {
  userId: string;
  type: "prayed" | "encouraged";
}

export interface CirclePost {
  id: string;
  userId: string;
  userName: string;
  isAnonymous: boolean;
  tag: CircleTag;
  content: string;
  createdAt: string;
  reactions: Reaction[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function generateAliasNumber(): number {
  const existing = localStorage.getItem("rope_alias_counter");
  const next = existing ? parseInt(existing, 10) + 1 : Math.floor(Math.random() * 90) + 10;
  localStorage.setItem("rope_alias_counter", next.toString());
  return next;
}

// ─── User ────────────────────────────────────────────────────────────────────

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("rope_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setUser(name: string, email: string): User {
  const existing = getUser();
  if (existing && existing.email === email) return existing;

  const user: User = {
    id: generateId(),
    name,
    email,
    anonymousAlias: `Child of God #${generateAliasNumber()}`,
  };
  localStorage.setItem("rope_user", JSON.stringify(user));
  return user;
}

export function loginUser(email: string): User {
  const existing = getUser();
  if (existing && existing.email === email) return existing;

  const user: User = {
    id: generateId(),
    name: email.split("@")[0],
    email,
    anonymousAlias: `Child of God #${generateAliasNumber()}`,
  };
  localStorage.setItem("rope_user", JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem("rope_user");
}

// ─── ROPE Entries ────────────────────────────────────────────────────────────

export function getRopeEntries(userId?: string): RopeEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("rope_entries");
  if (!raw) return [];
  try {
    const entries = JSON.parse(raw) as RopeEntry[];
    if (userId) return entries.filter((e) => e.userId === userId);
    return entries;
  } catch {
    return [];
  }
}

export function addRopeEntry(
  entry: Omit<RopeEntry, "id" | "createdAt" | "executionStatus" | "executionReflection">
): RopeEntry {
  const newEntry: RopeEntry = {
    ...entry,
    id: generateId(),
    createdAt: new Date().toISOString(),
    executionStatus: null,
    executionReflection: "",
  };
  const entries = getRopeEntries();
  entries.unshift(newEntry);
  localStorage.setItem("rope_entries", JSON.stringify(entries));
  return newEntry;
}

export function updateRopeEntry(id: string, updates: Partial<RopeEntry>): RopeEntry | null {
  const entries = getRopeEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;
  entries[index] = { ...entries[index], ...updates };
  localStorage.setItem("rope_entries", JSON.stringify(entries));
  return entries[index];
}

export function getYesterdayEntry(userId: string): RopeEntry | null {
  const entries = getRopeEntries(userId);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split("T")[0];

  return (
    entries.find((e) => {
      const eDate = new Date(e.createdAt).toISOString().split("T")[0];
      return eDate === yStr;
    }) ?? null
  );
}

export function hasPendingCheckin(userId: string): boolean {
  const entry = getYesterdayEntry(userId);
  if (!entry) return false;
  return entry.executionStatus === null;
}

// ─── Circle Posts ────────────────────────────────────────────────────────────

export function getCirclePosts(): CirclePost[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("rope_circle");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CirclePost[];
  } catch {
    return [];
  }
}

export function addCirclePost(
  post: Omit<CirclePost, "id" | "createdAt" | "reactions">
): CirclePost {
  const newPost: CirclePost = {
    ...post,
    id: generateId(),
    createdAt: new Date().toISOString(),
    reactions: [],
  };
  const posts = getCirclePosts();
  posts.unshift(newPost);
  localStorage.setItem("rope_circle", JSON.stringify(posts));
  return newPost;
}

export function addReaction(postId: string, userId: string, type: "prayed" | "encouraged"): void {
  const posts = getCirclePosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  const existingIndex = post.reactions.findIndex(
    (r) => r.userId === userId && r.type === type
  );

  if (existingIndex >= 0) {
    post.reactions.splice(existingIndex, 1);
  } else {
    post.reactions.push({ userId, type });
  }

  localStorage.setItem("rope_circle", JSON.stringify(posts));
}
