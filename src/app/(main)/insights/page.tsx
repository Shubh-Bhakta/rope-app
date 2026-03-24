"use client";

import { useState, useEffect } from "react";
import {
  getUser,
  getRopeEntries,
  getStreak,
  getBookFrequency,
  getExecutionRate,
  getMostCommonBook,
  type RopeEntry,
  type User,
} from "@/lib/store";

export default function InsightsPage() {
  const [user, setUserState] = useState<User | null>(null);
  const [entries, setEntries] = useState<RopeEntry[]>([]);
  const [streak, setStreakVal] = useState(0);
  const [bookFreq, setBookFreq] = useState<{ book: string; count: number }[]>([]);
  const [execRate, setExecRate] = useState(0);
  const [topBook, setTopBook] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) return;
    setUserState(u);
    setEntries(getRopeEntries(u.id));
    setStreakVal(getStreak(u.id));
    setBookFreq(getBookFrequency(u.id));
    setExecRate(getExecutionRate(u.id));
    setTopBook(getMostCommonBook(u.id));
  }, []);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted font-serif">Loading...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 bg-brown/10 rounded-full flex items-center justify-center mb-5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brown"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <h2 className="font-serif text-xl text-brown mb-2">Start Your Journey</h2>
        <p className="text-muted text-sm max-w-xs">
          Start journaling to see your spiritual growth patterns here.
        </p>
        <p className="text-muted/40 text-xs italic mt-12">
          For I know the plans I have for you &mdash; Jeremiah 29:11
        </p>
      </div>
    );
  }

  const top5Books = bookFreq.slice(0, 5);
  const maxCount = top5Books.length > 0 ? top5Books[0].count : 1;
  const recentEntries = entries.slice(0, 10);
  const hasExecData = entries.some((e) => e.executionStatus !== null);

  // Calculate circumference for the ring
  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (execRate / 100) * ringCircumference;

  return (
    <div className="px-5 pt-6 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-brown">Your ROPE Journey</h1>
        <p className="text-muted text-sm">Patterns in your spiritual growth</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-cream rounded-2xl p-4 text-center shadow-sm">
          <p className="font-serif text-2xl text-brown font-bold">{entries.length}</p>
          <p className="text-muted text-xs mt-1">Total Entries</p>
        </div>
        <div className="bg-cream rounded-2xl p-4 text-center shadow-sm">
          <p className="font-serif text-2xl text-brown font-bold">{streak}</p>
          <p className="text-muted text-xs mt-1">Day Streak</p>
        </div>
        <div className="bg-cream rounded-2xl p-4 text-center shadow-sm">
          <p className="font-serif text-2xl text-brown font-bold truncate text-lg">
            {topBook || "—"}
          </p>
          <p className="text-muted text-xs mt-1">Top Book</p>
        </div>
      </div>

      {/* Book Frequency Chart */}
      {top5Books.length > 0 && (
        <section className="bg-cream rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-serif text-lg text-dark mb-4">Most Read Books</h2>
          <div className="space-y-3">
            {top5Books.map(({ book, count }) => (
              <div key={book} className="flex items-center gap-3">
                <span className="text-sm text-dark w-28 truncate shrink-0">{book}</span>
                <div className="flex-1 bg-ivory rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-brown/70 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max((count / maxCount) * 100, 8)}%` }}
                  />
                </div>
                <span className="text-xs text-muted w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Execution Score */}
      <section className="bg-cream rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="font-serif text-lg text-dark mb-4">Execution Score</h2>
        {hasExecData ? (
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-ivory"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="text-brown transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-3xl text-brown font-bold">{execRate}%</span>
              </div>
            </div>
            <p className="text-muted text-xs mt-3 text-center">
              of your commitments fully lived out
            </p>
          </div>
        ) : (
          <p className="text-muted text-sm text-center py-4">
            Complete your first check-in to see your execution score. Keep going!
          </p>
        )}
      </section>

      {/* Theme Timeline */}
      <section className="bg-cream rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="font-serif text-lg text-dark mb-4">Recent Reflections</h2>
        <div className="space-y-0">
          {recentEntries.map((entry, i) => (
            <div key={entry.id} className="flex gap-3">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 bg-brown rounded-full shrink-0 mt-1" />
                {i < recentEntries.length - 1 && (
                  <div className="w-px flex-1 bg-brown/20 my-1" />
                )}
              </div>

              {/* Content */}
              <div className="pb-4 min-w-0">
                <p className="text-sm font-medium text-dark">{entry.revelationVerse}</p>
                <p className="text-xs text-muted mt-0.5 line-clamp-1">
                  {entry.observation}
                </p>
                <p className="text-xs text-muted/60 mt-0.5">
                  {new Date(entry.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reflection Prompt */}
      {topBook && (
        <section className="bg-cream rounded-2xl p-5 shadow-sm mb-4">
          <p className="text-dark text-sm leading-relaxed italic">
            &ldquo;Based on your entries, you&apos;ve been drawn to{" "}
            <span className="font-medium not-italic text-brown">{topBook}</span> lately.
            What do you think God is showing you through these passages?&rdquo;
          </p>
        </section>
      )}

      {/* Scripture Watermark */}
      <p className="text-muted/40 text-xs italic text-center mt-6">
        For I know the plans I have for you &mdash; Jeremiah 29:11
      </p>
    </div>
  );
}
