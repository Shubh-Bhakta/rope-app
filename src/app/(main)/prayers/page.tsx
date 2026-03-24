"use client";

import { useState, useEffect } from "react";
import { getOrCreateUser, getRopeEntries, getPrayers, addPrayer, markPrayerAnswered, type PrayerItem } from "@/lib/store";
import { LampIcon, OliveBranch } from "@/components/Accents";

export default function PrayersPage() {
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  const [journalPrayers, setJournalPrayers] = useState<{ text: string; verse: string; date: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"active" | "answered">("active");
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerNote, setAnswerNote] = useState("");

  useEffect(() => {
    const u = getOrCreateUser();
    setPrayers(getPrayers());
    // Extract prayers from journal entries
    const entries = getRopeEntries(u.id);
    setJournalPrayers(entries.map(e => ({
      text: e.prayer,
      verse: e.revelationVerse,
      date: e.createdAt,
    })));
    setLoaded(true);
  }, []);

  function handleMarkAnswered(id: string) {
    if (answeringId === id) {
      markPrayerAnswered(id, answerNote.trim());
      setPrayers(getPrayers());
      setAnsweringId(null);
      setAnswerNote("");
    } else {
      setAnsweringId(id);
      setAnswerNote("");
    }
  }

  function handleJournalPrayerAnswered(text: string, verse: string, note: string) {
    const prayer = addPrayer(text, verse);
    markPrayerAnswered(prayer.id, note);
    setPrayers(getPrayers());
  }

  if (!loaded) return <div className="min-h-[80vh] flex items-center justify-center"><p className="text-muted font-serif">Loading...</p></div>;

  const answeredPrayers = prayers.filter(p => p.answeredAt);

  return (
    <div className="px-5 pt-6 pb-8" style={{ animation: "fadeIn 0.4s ease-out both" }}>
      <h1 className="font-serif text-2xl text-brown mb-1">Prayer Wall</h1>
      <p className="text-muted text-sm mb-6">Your conversations with God</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-brown/[0.03] rounded-xl p-1">
        <button onClick={() => setTab("active")} className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${tab === "active" ? "bg-ivory text-brown shadow-sm" : "text-muted"}`}>
          Active ({journalPrayers.length})
        </button>
        <button onClick={() => setTab("answered")} className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${tab === "answered" ? "bg-ivory text-brown shadow-sm" : "text-muted"}`}>
          Answered ({answeredPrayers.length})
        </button>
      </div>

      {tab === "active" && (
        <div className="space-y-3">
          {journalPrayers.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <LampIcon className="w-10 h-[52px] mb-4" />
              <p className="text-muted text-sm text-center max-w-xs">Your prayers from journal entries will appear here.</p>
            </div>
          ) : (
            journalPrayers.map((p, i) => (
              <div key={i} className="card-surface rounded-2xl p-4" style={{ animation: "fadeInUp 0.3s ease-out both", animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
                <p className="text-dark text-sm leading-relaxed italic">{p.text.length > 200 ? p.text.slice(0, 200) + "..." : p.text}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-muted text-xs">{p.verse} &middot; {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  <button
                    onClick={() => setAnsweringId(`journal-${i}`)}
                    className="text-[10px] text-prayer hover:text-prayer/80 transition"
                  >
                    Mark answered
                  </button>
                </div>
                {answeringId === `journal-${i}` && (
                  <div className="mt-3 pt-3 border-t border-brown/6">
                    <textarea
                      value={answerNote}
                      onChange={(e) => setAnswerNote(e.target.value)}
                      placeholder="How did God answer this prayer?"
                      rows={2}
                      className="w-full px-3 py-2 bg-ivory border border-brown/10 rounded-xl text-dark text-sm resize-none focus:outline-none mb-2"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setAnsweringId(null); setAnswerNote(""); }} className="text-xs text-muted">Cancel</button>
                      <button
                        onClick={() => { handleJournalPrayerAnswered(p.text, p.verse, answerNote); setAnsweringId(null); setAnswerNote(""); }}
                        className="text-xs bg-prayer/10 text-prayer px-3 py-1 rounded-lg font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "answered" && (
        <div className="space-y-3">
          {answeredPrayers.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <p className="text-muted text-sm text-center max-w-xs">When God answers, mark your prayers here. Build a testimony of His faithfulness.</p>
            </div>
          ) : (
            answeredPrayers.map((p) => (
              <div key={p.id} className="card-surface rounded-2xl p-4 border-l-2 border-l-prayer/30">
                <p className="text-dark text-sm leading-relaxed">{p.text}</p>
                {(p.answeredNote || "") && (
                  <p className="text-dark/70 text-sm mt-2 italic border-l-2 border-accent-gold/20 pl-3">
                    {p.answeredNote}
                  </p>
                )}
                <p className="text-prayer text-xs mt-2">Answered {new Date(p.answeredAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <OliveBranch className="opacity-30" />
      </div>
    </div>
  );
}
