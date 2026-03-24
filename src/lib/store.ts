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
  revelationReflection: string;
  observation: string;
  prayer: string;
  execution: string;
  executionStatus: ExecutionStatus;
  executionReflection: string;
}

// ─── Bible Books ─────────────────────────────────────────────────────────────

export const BIBLE_BOOKS = [
  { name: "Genesis", abbrevs: ["gen", "ge", "gn"] },
  { name: "Exodus", abbrevs: ["exod", "exo", "ex"] },
  { name: "Leviticus", abbrevs: ["lev", "le", "lv"] },
  { name: "Numbers", abbrevs: ["num", "nu", "nm"] },
  { name: "Deuteronomy", abbrevs: ["deut", "de", "dt"] },
  { name: "Joshua", abbrevs: ["josh", "jos", "jsh"] },
  { name: "Judges", abbrevs: ["judg", "jdg", "jg"] },
  { name: "Ruth", abbrevs: ["ruth", "ru", "rth"] },
  { name: "1 Samuel", abbrevs: ["1sam", "1sa", "1 sam"] },
  { name: "2 Samuel", abbrevs: ["2sam", "2sa", "2 sam"] },
  { name: "1 Kings", abbrevs: ["1kgs", "1ki", "1 kings"] },
  { name: "2 Kings", abbrevs: ["2kgs", "2ki", "2 kings"] },
  { name: "1 Chronicles", abbrevs: ["1chr", "1ch", "1 chron"] },
  { name: "2 Chronicles", abbrevs: ["2chr", "2ch", "2 chron"] },
  { name: "Ezra", abbrevs: ["ezra", "ezr"] },
  { name: "Nehemiah", abbrevs: ["neh", "ne"] },
  { name: "Esther", abbrevs: ["esth", "est", "es"] },
  { name: "Job", abbrevs: ["job", "jb"] },
  { name: "Psalms", abbrevs: ["ps", "psa", "psalm"] },
  { name: "Proverbs", abbrevs: ["prov", "pro", "pr"] },
  { name: "Ecclesiastes", abbrevs: ["eccl", "ecc", "ec"] },
  { name: "Song of Solomon", abbrevs: ["song", "sos", "sg"] },
  { name: "Isaiah", abbrevs: ["isa", "is"] },
  { name: "Jeremiah", abbrevs: ["jer", "je"] },
  { name: "Lamentations", abbrevs: ["lam", "la"] },
  { name: "Ezekiel", abbrevs: ["ezek", "eze", "ezk"] },
  { name: "Daniel", abbrevs: ["dan", "da", "dn"] },
  { name: "Hosea", abbrevs: ["hos", "ho"] },
  { name: "Joel", abbrevs: ["joel", "jl"] },
  { name: "Amos", abbrevs: ["amos", "am"] },
  { name: "Obadiah", abbrevs: ["obad", "ob"] },
  { name: "Jonah", abbrevs: ["jonah", "jon"] },
  { name: "Micah", abbrevs: ["mic", "mc"] },
  { name: "Nahum", abbrevs: ["nah", "na"] },
  { name: "Habakkuk", abbrevs: ["hab"] },
  { name: "Zephaniah", abbrevs: ["zeph", "zep"] },
  { name: "Haggai", abbrevs: ["hag", "hg"] },
  { name: "Zechariah", abbrevs: ["zech", "zec"] },
  { name: "Malachi", abbrevs: ["mal", "ml"] },
  { name: "Matthew", abbrevs: ["matt", "mat", "mt"] },
  { name: "Mark", abbrevs: ["mark", "mrk", "mk"] },
  { name: "Luke", abbrevs: ["luke", "luk", "lk"] },
  { name: "John", abbrevs: ["john", "jhn", "jn"] },
  { name: "Acts", abbrevs: ["acts", "act", "ac"] },
  { name: "Romans", abbrevs: ["rom", "ro", "rm"] },
  { name: "1 Corinthians", abbrevs: ["1cor", "1co", "1 cor"] },
  { name: "2 Corinthians", abbrevs: ["2cor", "2co", "2 cor"] },
  { name: "Galatians", abbrevs: ["gal", "ga"] },
  { name: "Ephesians", abbrevs: ["eph", "ep"] },
  { name: "Philippians", abbrevs: ["phil", "php"] },
  { name: "Colossians", abbrevs: ["col", "co"] },
  { name: "1 Thessalonians", abbrevs: ["1thess", "1th", "1 thes"] },
  { name: "2 Thessalonians", abbrevs: ["2thess", "2th", "2 thes"] },
  { name: "1 Timothy", abbrevs: ["1tim", "1ti", "1 tim"] },
  { name: "2 Timothy", abbrevs: ["2tim", "2ti", "2 tim"] },
  { name: "Titus", abbrevs: ["titus", "tit"] },
  { name: "Philemon", abbrevs: ["phlm", "phm"] },
  { name: "Hebrews", abbrevs: ["heb"] },
  { name: "James", abbrevs: ["jas", "jm"] },
  { name: "1 Peter", abbrevs: ["1pet", "1pe", "1 pet"] },
  { name: "2 Peter", abbrevs: ["2pet", "2pe", "2 pet"] },
  { name: "1 John", abbrevs: ["1john", "1jn", "1 john"] },
  { name: "2 John", abbrevs: ["2john", "2jn", "2 john"] },
  { name: "3 John", abbrevs: ["3john", "3jn", "3 john"] },
  { name: "Jude", abbrevs: ["jude", "jud"] },
  { name: "Revelation", abbrevs: ["rev", "re"] },
];

export function suggestBooks(input: string): string[] {
  if (!input.trim()) return [];
  const lower = input.trim().toLowerCase();

  // If input contains a space, the user has already selected a book — don't suggest
  if (lower.includes(" ")) return [];

  // If input has a digit not at start (like "1" for "1 Samuel"), keep suggesting
  const withoutLeadingNum = lower.replace(/^[123]\s*/, "");
  if (/\d/.test(withoutLeadingNum)) return [];

  const matches: string[] = [];

  for (const book of BIBLE_BOOKS) {
    if (matches.length >= 5) break;
    const nameLower = book.name.toLowerCase();
    if (nameLower.startsWith(lower) || nameLower.replace(/\s/g, "").startsWith(lower)) {
      matches.push(book.name);
      continue;
    }
    for (const abbr of book.abbrevs) {
      if (abbr.startsWith(lower) || lower.startsWith(abbr)) {
        matches.push(book.name);
        break;
      }
    }
  }

  return matches;
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

/** Get existing user or auto-create a default one */
export function getOrCreateUser(): User {
  const existing = getUser();
  if (existing) return existing;

  const user: User = {
    id: generateId(),
    name: "Journaler",
    email: "",
    anonymousAlias: `Child of God #${generateAliasNumber()}`,
  };
  localStorage.setItem("rope_user", JSON.stringify(user));
  return user;
}

export function setUser(name: string, email: string): User {
  const existing = getUser();
  if (existing && existing.email === email && email !== "") return existing;

  const user: User = {
    id: existing?.id || generateId(),
    name,
    email,
    anonymousAlias: existing?.anonymousAlias || `Child of God #${generateAliasNumber()}`,
  };
  localStorage.setItem("rope_user", JSON.stringify(user));
  return user;
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
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  return (
    entries.find((e) => {
      const d = new Date(e.createdAt);
      const eStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return eStr === yStr;
    }) ?? null
  );
}

export function deleteRopeEntry(id: string): boolean {
  const entries = getRopeEntries();
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length === entries.length) return false;
  localStorage.setItem("rope_entries", JSON.stringify(filtered));
  return true;
}

export function hasPendingCheckin(userId: string): boolean {
  const entry = getYesterdayEntry(userId);
  if (!entry) return false;
  return entry.executionStatus === null;
}

// ─── Analytics Helpers ───────────────────────────────────────────────────────

export function getStreak(userId: string): number {
  const entries = getRopeEntries(userId);
  if (entries.length === 0) return 0;

  // Get unique LOCAL dates (sorted descending)
  const dates = Array.from(
    new Set(entries.map((e) => {
      const d = new Date(e.createdAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))
  ).sort((a, b) => b.localeCompare(a));

  let streak = 0;
  const now = new Date();
  let checkYear = now.getFullYear();
  let checkMonth = now.getMonth();
  let checkDay = now.getDate();

  for (const dateStr of dates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const checkDateObj = new Date(checkYear, checkMonth, checkDay);
    const entryDateObj = new Date(y, m - 1, d);
    const diffDays = Math.round((checkDateObj.getTime() - entryDateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      streak++;
      // Move check date to yesterday
      const prev = new Date(checkYear, checkMonth, checkDay - 1);
      checkYear = prev.getFullYear();
      checkMonth = prev.getMonth();
      checkDay = prev.getDate();
    } else if (diffDays === 1 && streak === 0) {
      // No entry today, but yesterday has one - start streak from yesterday
      streak = 1;
      const prev = new Date(y, m - 1, d - 1);
      checkYear = prev.getFullYear();
      checkMonth = prev.getMonth();
      checkDay = prev.getDate();
    } else {
      break;
    }
  }

  return streak;
}

export function getBookFrequency(userId: string): { book: string; count: number }[] {
  const entries = getRopeEntries(userId);
  const freq: Record<string, number> = {};

  for (const entry of entries) {
    const verse = entry.revelationVerse.trim();
    // Extract book name: everything before the first digit that follows a space
    const match = verse.match(/^(.+?)\s*\d/);
    const book = match ? match[1].trim() : verse;
    if (book) {
      freq[book] = (freq[book] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .map(([book, count]) => ({ book, count }))
    .sort((a, b) => b.count - a.count);
}

export function getExecutionRate(userId: string): number {
  const entries = getRopeEntries(userId);
  const withStatus = entries.filter((e) => e.executionStatus !== null);
  if (withStatus.length === 0) return 0;
  const yesCount = withStatus.filter((e) => e.executionStatus === "yes").length;
  return Math.round((yesCount / withStatus.length) * 100);
}

export function getMostCommonBook(userId: string): string | null {
  const freq = getBookFrequency(userId);
  return freq.length > 0 ? freq[0].book : null;
}

// ─── Extended Analytics ─────────────────────────────────────────────────────

/** Get ROPE balance — how much the user writes in each section */
export function getRopeBalance(userId: string): { r: number; o: number; p: number; e: number } {
  const entries = getRopeEntries(userId);
  if (entries.length === 0) return { r: 0, o: 0, p: 0, e: 0 };
  let rTotal = 0, oTotal = 0, pTotal = 0, eTotal = 0;
  for (const entry of entries) {
    rTotal += (entry.revelationText || entry.revelationVerse).split(/\s+/).length;
    oTotal += entry.observation.split(/\s+/).length;
    pTotal += entry.prayer.split(/\s+/).length;
    eTotal += entry.execution.split(/\s+/).length;
  }
  const sum = rTotal + oTotal + pTotal + eTotal || 1;
  return {
    r: Math.round((rTotal / sum) * 100),
    o: Math.round((oTotal / sum) * 100),
    p: Math.round((pTotal / sum) * 100),
    e: Math.round((eTotal / sum) * 100),
  };
}

/** Get the most recent verse reference */
export function getLastVerse(userId: string): string | null {
  const entries = getRopeEntries(userId);
  return entries.length > 0 ? entries[0].revelationVerse : null;
}

/** Get total unique books studied */
export function getUniqueBooksCount(userId: string): number {
  const freq = getBookFrequency(userId);
  return freq.length;
}

// ─── Bible Translations ─────────────────────────────────────────────────────

const TRANSLATIONS = [
  { id: "kjv", label: "KJV", gateway: "KJV" },
  { id: "web", label: "WEB", gateway: "WEB" },
  { id: "bbe", label: "BBE", gateway: "BBE" },
];

export function getTranslation(): string {
  if (typeof window === "undefined") return "kjv";
  const saved = localStorage.getItem("rope_translation") || "kjv";
  // Migrate old invalid translations to KJV
  if (!TRANSLATIONS.some(t => t.id === saved)) return "kjv";
  return saved;
}

export function getGatewayVersion(translationId: string): string {
  const t = TRANSLATIONS.find(t => t.id === translationId);
  return t?.gateway || "KJV";
}

export function setTranslation(t: string): void {
  localStorage.setItem("rope_translation", t);
}

export { TRANSLATIONS };

// ─── Dark Mode ──────────────────────────────────────────────────────────────

export function getDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("rope_dark_mode");
  if (saved !== null) return saved === "true";
  // Auto-detect system preference
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function setDarkMode(dark: boolean): void {
  localStorage.setItem("rope_dark_mode", dark ? "true" : "false");
}

// ─── Onboarding ─────────────────────────────────────────────────────────────

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("rope_onboarding_done") === "true";
}

export function completeOnboarding(): void {
  localStorage.setItem("rope_onboarding_done", "true");
}

export function resetOnboarding(): void {
  localStorage.removeItem("rope_onboarding_done");
}

/** Extract common spiritual themes from observations */
export function getThemes(userId: string): string[] {
  const entries = getRopeEntries(userId);
  const themeKeywords: Record<string, string[]> = {
    "Trust": ["trust", "faith", "believe", "rely", "depend"],
    "Obedience": ["obey", "obedience", "follow", "submit", "listen"],
    "Peace": ["peace", "calm", "rest", "still", "quiet"],
    "Love": ["love", "compassion", "mercy", "kindness", "grace"],
    "Courage": ["courage", "brave", "strong", "bold", "fear not"],
    "Gratitude": ["thank", "grateful", "praise", "blessing", "thankful"],
    "Patience": ["patience", "wait", "endure", "persevere", "long-suffering"],
    "Forgiveness": ["forgive", "forgiveness", "pardon", "mercy", "reconcile"],
    "Purpose": ["purpose", "calling", "plan", "mission", "destiny"],
    "Growth": ["grow", "growth", "mature", "transform", "renew"],
  };

  const counts: Record<string, number> = {};
  const allText = entries.map(e => `${e.observation} ${e.prayer} ${e.execution}`).join(" ").toLowerCase();

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    let count = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}`, "gi");
      const matches = allText.match(regex);
      if (matches) count += matches.length;
    }
    if (count > 0) counts[theme] = count;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);
}
