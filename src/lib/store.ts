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

// ─── Reading Plans ──────────────────────────────────────────────────────────

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  days: number;
  verses: string[];
}

export const READING_PLANS: ReadingPlan[] = [
  {
    id: "faith-7",
    title: "7 Days on Faith",
    description: "Strengthen your foundation of belief",
    days: 7,
    verses: ["Hebrews 11:1", "Romans 10:17", "James 2:17", "Mark 11:22-24", "2 Corinthians 5:7", "Ephesians 2:8-9", "Hebrews 11:6"],
  },
  {
    id: "peace-21",
    title: "21 Days: Anxiety to Peace",
    description: "Replace worry with God's peace",
    days: 21,
    verses: [
      "Philippians 4:6-7", "Isaiah 41:10", "Psalm 23:1-4", "Matthew 6:25-27", "John 14:27",
      "Psalm 46:10", "Isaiah 26:3", "Romans 8:28", "1 Peter 5:7", "Psalm 55:22",
      "Matthew 11:28-30", "Psalm 94:19", "2 Timothy 1:7", "Psalm 27:1", "Isaiah 43:1-2",
      "Psalm 34:4", "Proverbs 3:5-6", "Jeremiah 29:11", "Romans 15:13", "Psalm 121:1-2",
      "Lamentations 3:22-23",
    ],
  },
  {
    id: "proverbs-30",
    title: "30 Days in Proverbs",
    description: "One chapter of wisdom per day",
    days: 30,
    verses: Array.from({ length: 30 }, (_, i) => `Proverbs ${i + 1}`),
  },
  {
    id: "john-14",
    title: "The Gospel of John in 14 Days",
    description: "Walk through Jesus' story",
    days: 14,
    verses: [
      "John 1:1-18", "John 2:1-25", "John 3:1-21", "John 4:1-42", "John 5:1-30",
      "John 6:1-40", "John 8:1-32", "John 9:1-41", "John 10:1-30", "John 11:1-44",
      "John 13:1-17", "John 14:1-27", "John 15:1-17", "John 17:1-26",
    ],
  },
];

export interface PlanProgress {
  planId: string;
  currentDay: number;
  startedAt: string;
  completedDays: number[];
  paused: boolean;
}

export function getActivePlan(): PlanProgress | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("rope_active_plan");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function startPlan(planId: string): PlanProgress {
  const progress: PlanProgress = {
    planId,
    currentDay: 0,
    startedAt: new Date().toISOString(),
    completedDays: [],
    paused: false,
  };
  localStorage.setItem("rope_active_plan", JSON.stringify(progress));
  return progress;
}

export function advancePlan(): PlanProgress | null {
  const progress = getActivePlan();
  if (!progress) return null;
  const plan = READING_PLANS.find(p => p.id === progress.planId);
  if (!plan) return null;
  if (!progress.completedDays.includes(progress.currentDay)) {
    progress.completedDays.push(progress.currentDay);
  }
  if (progress.currentDay < plan.days - 1) {
    progress.currentDay++;
  }
  localStorage.setItem("rope_active_plan", JSON.stringify(progress));
  return progress;
}

export function pausePlan(): void {
  const progress = getActivePlan();
  if (!progress) return;
  progress.paused = !progress.paused;
  localStorage.setItem("rope_active_plan", JSON.stringify(progress));
}

export function quitPlan(): void {
  localStorage.removeItem("rope_active_plan");
}

export function getPlanSuggestedVerse(): string | null {
  const progress = getActivePlan();
  if (!progress || progress.paused) return null;
  const plan = READING_PLANS.find(p => p.id === progress.planId);
  if (!plan) return null;
  return plan.verses[progress.currentDay] || null;
}

// ─── Milestones ─────────────────────────────────────────────────────────────

const MILESTONES = [
  { days: 3, title: "First Steps", verse: "The journey of faith begins with a single step.", ref: "Proverbs 4:12" },
  { days: 7, title: "One Week Strong", verse: "Be steadfast, immovable, always abounding in the work of the Lord.", ref: "1 Corinthians 15:58" },
  { days: 14, title: "Two Weeks of Faithfulness", verse: "His mercies are new every morning; great is your faithfulness.", ref: "Lamentations 3:23" },
  { days: 21, title: "Habit Formed", verse: "Let us not become weary in doing good, for at the proper time we will reap a harvest.", ref: "Galatians 6:9" },
  { days: 30, title: "One Month of Walking", verse: "Blessed is the one who perseveres under trial.", ref: "James 1:12" },
  { days: 60, title: "Two Months Deep", verse: "I press on toward the goal to win the prize.", ref: "Philippians 3:14" },
  { days: 100, title: "Century of Faith", verse: "Well done, good and faithful servant.", ref: "Matthew 25:21" },
];

export { MILESTONES };

export function getNextMilestone(streak: number): typeof MILESTONES[0] | null {
  return MILESTONES.find(m => m.days > streak) || null;
}

export function getReachedMilestone(streak: number): typeof MILESTONES[0] | null {
  return MILESTONES.filter(m => m.days === streak)[0] || null;
}

export function getAllReachedMilestones(streak: number): typeof MILESTONES {
  return MILESTONES.filter(m => m.days <= streak);
}

// ─── Prayer Wall ────────────────────────────────────────────────────────────

export interface PrayerItem {
  id: string;
  text: string;
  verse: string;
  createdAt: string;
  answeredAt: string | null;
}

export function getPrayers(): PrayerItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("rope_prayers");
  if (!raw) return [];
  try { return JSON.parse(raw) as PrayerItem[]; } catch { return []; }
}

export function addPrayer(text: string, verse: string): PrayerItem {
  const prayer: PrayerItem = { id: generateId(), text, verse, createdAt: new Date().toISOString(), answeredAt: null };
  const prayers = getPrayers();
  prayers.unshift(prayer);
  localStorage.setItem("rope_prayers", JSON.stringify(prayers));
  return prayer;
}

export function markPrayerAnswered(id: string): void {
  const prayers = getPrayers();
  const idx = prayers.findIndex(p => p.id === id);
  if (idx !== -1) {
    prayers[idx].answeredAt = new Date().toISOString();
    localStorage.setItem("rope_prayers", JSON.stringify(prayers));
  }
}

export function deletePrayer(id: string): void {
  const prayers = getPrayers().filter(p => p.id !== id);
  localStorage.setItem("rope_prayers", JSON.stringify(prayers));
}

// ─── Memory Verses ──────────────────────────────────────────────────────────

export function getMemoryVerses(): { verse: string; text: string; addedAt: string }[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("rope_memory_verses");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function addMemoryVerse(verse: string, text: string): void {
  const verses = getMemoryVerses();
  if (verses.some(v => v.verse === verse)) return;
  verses.unshift({ verse, text, addedAt: new Date().toISOString() });
  localStorage.setItem("rope_memory_verses", JSON.stringify(verses));
}

export function removeMemoryVerse(verse: string): void {
  const verses = getMemoryVerses().filter(v => v.verse !== verse);
  localStorage.setItem("rope_memory_verses", JSON.stringify(verses));
}

// ─── Verse Recommendations ──────────────────────────────────────────────────

const THEME_VERSES: Record<string, string[]> = {
  "Trust": ["Proverbs 3:5-6", "Isaiah 26:3", "Psalm 37:5", "Jeremiah 17:7", "Nahum 1:7"],
  "Peace": ["John 14:27", "Isaiah 26:3", "Philippians 4:6-7", "Psalm 29:11", "Romans 15:13"],
  "Love": ["1 John 4:19", "Romans 5:8", "1 Corinthians 13:4-7", "Ephesians 3:17-19", "John 15:12"],
  "Obedience": ["John 14:15", "Deuteronomy 5:33", "1 Samuel 15:22", "James 1:22", "Luke 11:28"],
  "Courage": ["Deuteronomy 31:6", "Isaiah 41:10", "Joshua 1:9", "2 Timothy 1:7", "Psalm 31:24"],
  "Gratitude": ["1 Thessalonians 5:18", "Psalm 100:4", "Colossians 3:17", "Psalm 107:1", "James 1:17"],
  "Patience": ["James 5:7-8", "Romans 12:12", "Psalm 27:14", "Isaiah 40:31", "Hebrews 10:36"],
  "Forgiveness": ["Colossians 3:13", "Ephesians 4:32", "Matthew 6:14", "Mark 11:25", "Luke 6:37"],
  "Purpose": ["Jeremiah 29:11", "Romans 8:28", "Proverbs 19:21", "Ephesians 2:10", "Psalm 138:8"],
  "Growth": ["2 Peter 3:18", "Philippians 1:6", "Colossians 1:10", "Hebrews 6:1", "Ephesians 4:15"],
};

export function getRecommendedVerses(userId: string): { theme: string; verses: string[] }[] {
  const themes = getThemes(userId);
  if (themes.length === 0) return [];
  return themes.slice(0, 3).map(theme => ({
    theme,
    verses: (THEME_VERSES[theme] || []).slice(0, 3),
  }));
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
