"use client";

import { useState } from "react";
import { getUser, addRopeEntry } from "@/lib/store";

const steps = [
  { letter: "R", word: "Revelation", placeholder: "" },
  { letter: "O", word: "Observation", placeholder: "What did you observe? Why did you stop here?" },
  { letter: "P", word: "Prayer", placeholder: "Write your prayer about this passage." },
  { letter: "E", word: "Execution", placeholder: "How will you live this out tomorrow?" },
];

export default function JournalPage() {
  const [verseRef, setVerseRef] = useState("");
  const [verseText, setVerseText] = useState("");
  const [verseLookedUp, setVerseLookedUp] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [observation, setObservation] = useState("");
  const [prayer, setPrayer] = useState("");
  const [execution, setExecution] = useState("");
  const [saved, setSaved] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function lookupVerse() {
    if (!verseRef.trim()) return;
    setLookingUp(true);
    setLookupError("");
    setVerseText("");
    try {
      const res = await fetch(
        `https://bible-api.com/${encodeURIComponent(verseRef.trim())}`
      );
      if (!res.ok) throw new Error("Verse not found");
      const data = await res.json();
      if (data.text) {
        setVerseText(data.text.trim());
        setVerseLookedUp(true);
      } else {
        throw new Error("No text returned");
      }
    } catch {
      setLookupError("Could not find that verse. Try a format like 'John 3:16' or 'Romans 8:28'.");
    } finally {
      setLookingUp(false);
    }
  }

  function handleSave() {
    const user = getUser();
    if (!user) return;
    if (!verseRef.trim() || !observation.trim() || !prayer.trim() || !execution.trim()) return;

    addRopeEntry({
      userId: user.id,
      revelationVerse: verseRef.trim(),
      revelationText: verseText,
      observation: observation.trim(),
      prayer: prayer.trim(),
      execution: execution.trim(),
    });

    setSaved(true);
  }

  if (saved) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 bg-brown/10 rounded-full flex items-center justify-center mb-5">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brown"
          >
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-brown mb-2">Entry Saved</h2>
        <p className="text-muted text-sm max-w-xs">
          Your ROPE entry has been saved. Come back tomorrow to check in on your execution.
        </p>
        <button
          onClick={() => {
            setSaved(false);
            setVerseRef("");
            setVerseText("");
            setVerseLookedUp(false);
            setObservation("");
            setPrayer("");
            setExecution("");
          }}
          className="mt-8 px-6 py-2.5 text-brown border border-brown/30 rounded-xl text-sm font-medium hover:bg-brown/5 transition"
        >
          Write Another Entry
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-8">
      <p className="text-muted text-sm mb-1">{today}</p>
      <h1 className="font-serif text-2xl text-brown mb-6">Daily ROPE</h1>

      <div className="space-y-6">
        {/* Step 1: Revelation */}
        <section className="bg-cream rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-brown text-ivory rounded-full flex items-center justify-center font-serif font-bold text-sm shrink-0">
              R
            </div>
            <h2 className="font-serif text-lg text-dark">Revelation</h2>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={verseRef}
              onChange={(e) => {
                setVerseRef(e.target.value);
                setVerseLookedUp(false);
                setLookupError("");
              }}
              placeholder="e.g. Romans 8:28"
              className="flex-1 px-4 py-2.5 bg-ivory border border-brown/15 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brown/20 text-sm"
            />
            <button
              onClick={lookupVerse}
              disabled={lookingUp || !verseRef.trim()}
              className="px-4 py-2.5 bg-brown text-ivory rounded-xl text-sm font-medium hover:bg-brown/90 disabled:opacity-40 transition shrink-0"
            >
              {lookingUp ? "..." : "Look up"}
            </button>
          </div>
          {lookupError && (
            <p className="text-struggle text-xs">{lookupError}</p>
          )}
          {verseLookedUp && verseText && (
            <div className="bg-ivory/70 rounded-xl p-4 border border-brown/10">
              <p className="text-dark text-sm leading-relaxed italic">
                &ldquo;{verseText}&rdquo;
              </p>
              <p className="text-muted text-xs mt-2">&mdash; {verseRef}</p>
            </div>
          )}
        </section>

        {/* Step 2: Observation */}
        <section className="bg-cream rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-brown text-ivory rounded-full flex items-center justify-center font-serif font-bold text-sm shrink-0">
              O
            </div>
            <h2 className="font-serif text-lg text-dark">Observation</h2>
          </div>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder={steps[1].placeholder}
            rows={4}
            className="w-full px-4 py-3 bg-ivory border border-brown/15 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brown/20 text-sm leading-relaxed resize-none"
          />
        </section>

        {/* Step 3: Prayer */}
        <section className="bg-cream rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-brown text-ivory rounded-full flex items-center justify-center font-serif font-bold text-sm shrink-0">
              P
            </div>
            <h2 className="font-serif text-lg text-dark">Prayer</h2>
          </div>
          <textarea
            value={prayer}
            onChange={(e) => setPrayer(e.target.value)}
            placeholder={steps[2].placeholder}
            rows={4}
            className="w-full px-4 py-3 bg-ivory border border-brown/15 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brown/20 text-sm leading-relaxed resize-none"
          />
        </section>

        {/* Step 4: Execution */}
        <section className="bg-cream rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-brown text-ivory rounded-full flex items-center justify-center font-serif font-bold text-sm shrink-0">
              E
            </div>
            <h2 className="font-serif text-lg text-dark">Execution</h2>
          </div>
          <textarea
            value={execution}
            onChange={(e) => setExecution(e.target.value)}
            placeholder={steps[3].placeholder}
            rows={4}
            className="w-full px-4 py-3 bg-ivory border border-brown/15 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brown/20 text-sm leading-relaxed resize-none"
          />
        </section>
      </div>

      <button
        onClick={handleSave}
        disabled={
          !verseRef.trim() ||
          !observation.trim() ||
          !prayer.trim() ||
          !execution.trim()
        }
        className="w-full mt-6 py-3.5 bg-brown text-ivory font-semibold rounded-xl hover:bg-brown/90 active:scale-[0.98] disabled:opacity-40 transition-all"
      >
        Save Entry
      </button>
    </div>
  );
}
