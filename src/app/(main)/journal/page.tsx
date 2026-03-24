"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getOrCreateUser, addRopeEntry, suggestBooks } from "@/lib/store";

const steps = [
  { letter: "R", word: "Revelation", placeholder: "" },
  { letter: "O", word: "Observation", placeholder: "What did you observe? Why did you stop here?" },
  { letter: "P", word: "Prayer", placeholder: "Write your prayer about this passage." },
  { letter: "E", word: "Execution", placeholder: "How will you live this out tomorrow?" },
];

// ─── AI Suggestion Helpers ──────────────────────────────────────────────────

function generatePrayerSuggestion(verseRef: string, observation: string): string {
  const ref = verseRef.trim() || "this passage";
  if (!observation.trim()) {
    return `Lord, speak to me through ${ref}. Help me hear Your voice and understand what You want me to learn today. Amen.`;
  }
  const theme = observation.trim().split(/[.!?]/)[0].trim().toLowerCase();
  const shortTheme = theme.length > 60 ? theme.slice(0, 60) + "..." : theme;
  return `Lord, as I reflect on ${ref}, I ask that You help me to understand that ${shortTheme}. Open my heart to what You're showing me through this passage. Help me to live this out in my daily walk. Amen.`;
}

function generateExecutionSuggestion(verseRef: string, observation: string): string {
  const ref = verseRef.trim() || "this passage";
  if (!observation.trim()) {
    return `Tomorrow, I will set aside time to reflect on ${ref} and look for ways to apply its truth in my interactions.`;
  }
  return `Tomorrow, I will intentionally look for a moment to apply the truth from ${ref}. When I face challenges, I will remember this passage and choose to respond with faith and obedience.`;
}

// ─── Voice Input Hook ────────────────────────────────────────────────────────

function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const startListening = useCallback(
    (onResult: (text: string) => void, onEnd: () => void) => {
      const w = window as unknown as Record<string, unknown>;
      const SpeechRecognition = (w.SpeechRecognition || w.webkitSpeechRecognition) as {
        new (): {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          onresult: ((e: { results: { item: (i: number) => { item: (i: number) => { transcript: string } }; length: number }; resultIndex: number }) => void) | null;
          onend: (() => void) | null;
          onerror: (() => void) | null;
          start: () => void;
          stop: () => void;
        };
      };

      if (!SpeechRecognition) return null;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (e) => {
        let transcript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results.item(i).item(0).transcript;
        }
        if (transcript.trim()) onResult(transcript.trim());
      };

      recognition.onend = onEnd;
      recognition.onerror = onEnd;

      recognition.start();
      return recognition;
    },
    []
  );

  return { supported, startListening };
}

// ─── Mic Button Component ────────────────────────────────────────────────────

function MicButton({
  onTranscript,
  supported,
  startListening,
}: {
  onTranscript: (text: string) => void;
  supported: boolean;
  startListening: (
    onResult: (text: string) => void,
    onEnd: () => void
  ) => { stop: () => void } | null;
}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  if (!supported) return null;

  function toggle() {
    if (listening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setListening(false);
    } else {
      setListening(true);
      recognitionRef.current = startListening(
        (text) => onTranscript(text),
        () => {
          setListening(false);
          recognitionRef.current = null;
        }
      );
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        listening
          ? "bg-struggle text-white animate-pulse"
          : "bg-brown/10 text-brown hover:bg-brown/20"
      }`}
      title={listening ? "Stop listening" : "Voice input"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
}

// ─── Suggestion Card Component ───────────────────────────────────────────────

function SuggestionCard({
  suggestion,
  onUse,
  onDismiss,
}: {
  suggestion: string;
  onUse: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="mt-3 bg-cream border border-brown/15 rounded-xl p-4"
      style={{ animation: "fadeInUp 0.3s ease-out both" }}
    >
      <p className="text-dark text-sm leading-relaxed italic mb-3">{suggestion}</p>
      <div className="flex gap-2">
        <button
          onClick={onUse}
          className="px-3 py-1.5 bg-brown text-ivory text-xs font-medium rounded-lg hover:bg-brown/90 transition"
        >
          Use this
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 text-muted text-xs font-medium rounded-lg hover:bg-brown/5 transition"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Journal Page ────────────────────────────────────────────────────────────

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // AI suggestion state
  const [prayerSuggestion, setPrayerSuggestion] = useState<string | null>(null);
  const [executionSuggestion, setExecutionSuggestion] = useState<string | null>(null);

  const { supported: speechSupported, startListening } = useSpeechRecognition();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleVerseInput(value: string) {
    setVerseRef(value);
    setVerseLookedUp(false);
    setLookupError("");
    const results = suggestBooks(value);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  }

  function selectSuggestion(book: string) {
    setVerseRef(book + " ");
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  }

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
    const user = getOrCreateUser();
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
      <div
        className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center"
        style={{ animation: "fadeIn 0.4s ease-out both" }}
      >
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
            setPrayerSuggestion(null);
            setExecutionSuggestion(null);
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
        <section
          className="bg-cream rounded-2xl p-5 shadow-sm"
          style={{ animation: "fadeInUp 0.5s ease-out both", animationDelay: "0s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-brown text-ivory rounded-full flex items-center justify-center font-serif font-bold text-sm shrink-0">
              R
            </div>
            <h2 className="font-serif text-lg text-dark">Revelation</h2>
          </div>
          <div className="relative">
            <div className="flex gap-2 mb-3">
              <input
                ref={inputRef}
                type="text"
                value={verseRef}
                onChange={(e) => handleVerseInput(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
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

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-16 top-12 z-20 bg-cream border border-brown/15 rounded-xl shadow-lg overflow-hidden"
                style={{ animation: "fadeIn 0.15s ease-out both" }}
              >
                {suggestions.map((book) => (
                  <button
                    key={book}
                    onClick={() => selectSuggestion(book)}
                    className="w-full text-left px-4 py-2.5 text-sm text-brown hover:bg-ivory transition"
                  >
                    {book}
                  </button>
                ))}
              </div>
            )}
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
        <section
          className="bg-cream rounded-2xl p-5 shadow-sm"
          style={{ animation: "fadeInUp 0.5s ease-out both", animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-brown text-ivory rounded-full flex items-center justify-center font-serif font-bold text-sm shrink-0">
              O
            </div>
            <h2 className="font-serif text-lg text-dark">Observation</h2>
          </div>
          <div className="relative">
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder={steps[1].placeholder}
              rows={4}
              className="w-full px-4 py-3 bg-ivory border border-brown/15 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brown/20 text-sm leading-relaxed resize-none"
            />
            <MicButton
              supported={speechSupported}
              startListening={startListening}
              onTranscript={(text) =>
                setObservation((prev) => (prev ? prev + " " + text : text))
              }
            />
          </div>
        </section>

        {/* Step 3: Prayer */}
        <section
          className="bg-cream rounded-2xl p-5 shadow-sm"
          style={{ animation: "fadeInUp 0.5s ease-out both", animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-brown text-ivory rounded-full flex items-center justify-center font-serif font-bold text-sm shrink-0">
              P
            </div>
            <div className="flex items-center gap-2 flex-1">
              <h2 className="font-serif text-lg text-dark">Prayer</h2>
              <button
                onClick={() => {
                  const suggestion = generatePrayerSuggestion(verseRef, observation);
                  setPrayerSuggestion(suggestion);
                }}
                className="px-2.5 py-1 text-xs text-muted hover:text-brown bg-brown/5 hover:bg-brown/10 rounded-full transition flex items-center gap-1"
              >
                <span>&#10024;</span> Suggest
              </button>
            </div>
          </div>
          <div className="relative">
            <textarea
              value={prayer}
              onChange={(e) => setPrayer(e.target.value)}
              placeholder={steps[2].placeholder}
              rows={4}
              className="w-full px-4 py-3 bg-ivory border border-brown/15 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brown/20 text-sm leading-relaxed resize-none"
            />
            <MicButton
              supported={speechSupported}
              startListening={startListening}
              onTranscript={(text) =>
                setPrayer((prev) => (prev ? prev + " " + text : text))
              }
            />
          </div>
          {prayerSuggestion && (
            <SuggestionCard
              suggestion={prayerSuggestion}
              onUse={() => {
                setPrayer(prayerSuggestion);
                setPrayerSuggestion(null);
              }}
              onDismiss={() => setPrayerSuggestion(null)}
            />
          )}
        </section>

        {/* Step 4: Execution */}
        <section
          className="bg-cream rounded-2xl p-5 shadow-sm"
          style={{ animation: "fadeInUp 0.5s ease-out both", animationDelay: "0.3s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-brown text-ivory rounded-full flex items-center justify-center font-serif font-bold text-sm shrink-0">
              E
            </div>
            <div className="flex items-center gap-2 flex-1">
              <h2 className="font-serif text-lg text-dark">Execution</h2>
              <button
                onClick={() => {
                  const suggestion = generateExecutionSuggestion(verseRef, observation);
                  setExecutionSuggestion(suggestion);
                }}
                className="px-2.5 py-1 text-xs text-muted hover:text-brown bg-brown/5 hover:bg-brown/10 rounded-full transition flex items-center gap-1"
              >
                <span>&#10024;</span> Suggest
              </button>
            </div>
          </div>
          <div className="relative">
            <textarea
              value={execution}
              onChange={(e) => setExecution(e.target.value)}
              placeholder={steps[3].placeholder}
              rows={4}
              className="w-full px-4 py-3 bg-ivory border border-brown/15 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brown/20 text-sm leading-relaxed resize-none"
            />
            <MicButton
              supported={speechSupported}
              startListening={startListening}
              onTranscript={(text) =>
                setExecution((prev) => (prev ? prev + " " + text : text))
              }
            />
          </div>
          {executionSuggestion && (
            <SuggestionCard
              suggestion={executionSuggestion}
              onUse={() => {
                setExecution(executionSuggestion);
                setExecutionSuggestion(null);
              }}
              onDismiss={() => setExecutionSuggestion(null)}
            />
          )}
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
