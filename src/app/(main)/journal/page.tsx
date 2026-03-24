"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getOrCreateUser, addRopeEntry, suggestBooks, getStreak, getTranslation, setTranslation, getGatewayVersion, TRANSLATIONS } from "@/lib/store";
import { OliveBranch } from "@/components/Accents";

const steps = [
  { letter: "R", word: "Revelation", placeholder: "" },
  { letter: "O", word: "Observation", placeholder: "What did you observe? Why did you stop here?" },
  { letter: "P", word: "Prayer", placeholder: "Write your prayer about this passage." },
  { letter: "E", word: "Execution", placeholder: "How will you live this out tomorrow?" },
];

// ─── Daily Verse ──────────────────────────────────────────────────────────────

const DAILY_VERSES = [
  "John 3:16", "Romans 8:28", "Philippians 4:13", "Jeremiah 29:11", "Proverbs 3:5-6",
  "Isaiah 41:10", "Psalm 23:1-3", "Matthew 11:28-30", "Romans 12:2", "2 Timothy 1:7",
  "Joshua 1:9", "Psalm 46:10", "Galatians 5:22-23", "Ephesians 2:8-9", "1 Corinthians 13:4-7",
  "Psalm 119:105", "Hebrews 11:1", "James 1:2-4", "Micah 6:8", "Colossians 3:23-24",
  "Matthew 6:33", "Romans 5:8", "Psalm 27:1", "Isaiah 40:31", "Philippians 4:6-7",
  "Lamentations 3:22-23", "Proverbs 16:3", "2 Corinthians 5:17", "Psalm 37:4", "Romans 15:13",
];

function getTodaysVerse(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

// ─── Motivational Verses ──────────────────────────────────────────────────────

const motivationalVerses = [
  { text: "Well done, good and faithful servant.", ref: "Matthew 25:21" },
  { text: "Let us not become weary in doing good.", ref: "Galatians 6:9" },
  { text: "Your labor in the Lord is not in vain.", ref: "1 Corinthians 15:58" },
  { text: "He who began a good work in you will carry it on to completion.", ref: "Philippians 1:6" },
];

// ─── AI Suggestion Helpers ──────────────────────────────────────────────────

function generatePrayerSuggestion(verseRef: string, verseText: string, observation: string): string {
  const ref = verseRef.trim() || "this passage";
  const verseSnippet = verseText ? verseText.split(/[.!?]/)[0].trim() : "";

  if (!observation.trim() && !verseSnippet) {
    return `Lord, speak to me through ${ref}. Open my eyes to see what You want me to learn. Help me to be still and listen for Your voice. Amen.`;
  }

  if (verseSnippet && !observation.trim()) {
    return `Father, as I read "${verseSnippet}..." from ${ref}, I ask that You would illuminate the truth in these words. Reveal what You want me to carry from this passage into my life. I surrender my understanding to Yours. Amen.`;
  }

  const theme = observation.trim().split(/[.!?]/)[0].trim();
  const shortTheme = theme.length > 80 ? theme.slice(0, 80) + "..." : theme;
  return `Lord, as I meditate on ${ref}, I've noticed that ${shortTheme.toLowerCase()}. I ask You to deepen this revelation in my heart. Show me how this truth applies to my life right now, and give me the courage to live it out. Transform my thinking through Your word. Amen.`;
}

function generateExecutionSuggestion(verseRef: string, verseText: string, observation: string): string {
  const ref = verseRef.trim() || "this passage";
  void verseText; // used for future context

  if (!observation.trim()) {
    return `Tomorrow, I will set aside 5 minutes to re-read ${ref} and identify one specific way I can apply its truth in my interactions with others.`;
  }

  const theme = observation.trim().split(/[.!?]/)[0].trim().toLowerCase();
  if (theme.includes("trust") || theme.includes("faith")) {
    return `Tomorrow, when I face a moment of uncertainty, I will pause and remember ${ref}. Instead of relying on my own understanding, I will choose to trust God's plan and take one step of faith.`;
  }
  if (theme.includes("love") || theme.includes("kind") || theme.includes("compassion")) {
    return `Tomorrow, I will intentionally show love to someone in my life — through a kind word, an act of service, or simply being fully present — as a reflection of what ${ref} teaches.`;
  }
  if (theme.includes("fear") || theme.includes("anxiety") || theme.includes("worry")) {
    return `Tomorrow, when anxiety rises, I will stop and recall ${ref}. I will take a deep breath, release my worry to God, and choose peace over fear in that moment.`;
  }

  return `Tomorrow, I will carry the truth of ${ref} into my day. I will look for one specific moment to put this passage into practice — whether in my words, my choices, or my attitude toward others.`;
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
      className={`absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
        listening
          ? "bg-struggle text-white animate-pulse"
          : "bg-brown/8 text-brown hover:bg-brown/15"
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
      className="mt-3 card-surface rounded-xl p-4 border-l-3 border-l-accent-gold/30"
      style={{ animation: "fadeInUp 0.3s ease-out both" }}
    >
      <p className="text-dark text-sm leading-relaxed italic mb-3">{suggestion}</p>
      <div className="flex gap-2">
        <button
          onClick={onUse}
          className="px-3 py-1.5 bg-brown text-ivory text-xs font-medium rounded-lg hover:bg-brown-light transition"
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
  const [revelationReflection, setRevelationReflection] = useState("");
  const [observation, setObservation] = useState("");
  const [prayer, setPrayer] = useState("");
  const [execution, setExecution] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [translation, setTranslationState] = useState("kjv");

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

  // Refs for keyboard navigation
  const observationRef = useRef<HTMLTextAreaElement>(null);
  const prayerRef = useRef<HTMLTextAreaElement>(null);
  const executionRef = useRef<HTMLTextAreaElement>(null);

  // Load translation on mount
  useEffect(() => {
    setTranslationState(getTranslation());
  }, []);

  // Keyboard shortcuts: Cmd+Enter to save, Cmd+L to focus verse lookup
  const canSave = !!(verseRef.trim() && observation.trim() && prayer.trim() && execution.trim());
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        const btn = document.querySelector("[data-save-btn]") as HTMLButtonElement;
        if (btn && !btn.disabled) btn.click();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canSave]);

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
        `https://bible-api.com/${encodeURIComponent(verseRef.trim())}?translation=${translation}`
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
      revelationReflection: revelationReflection.trim(),
      observation: observation.trim(),
      prayer: prayer.trim(),
      execution: execution.trim(),
    });

    setSavedCount((c) => c + 1);
    setSaved(true);
  }

  const allFilled = !!(verseRef.trim() && observation.trim() && prayer.trim() && execution.trim());

  if (saved) {
    const currentStreak = getStreak(getOrCreateUser().id);
    const saveVerse = motivationalVerses[(savedCount - 1) % motivationalVerses.length];

    return (
      <div
        className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center"
        style={{ animation: "fadeIn 0.4s ease-out both" }}
      >
        <div
          className="w-16 h-16 bg-brown/10 rounded-full flex items-center justify-center mb-5"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(196,162,101,0.1), rgba(92,67,39,0.1))",
            animation: "shimmer 2s ease-in-out infinite",
            backgroundSize: "200% auto",
          }}
        >
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
        {currentStreak > 0 && (
          <p className="text-accent-gold text-sm font-medium mb-4">
            &#x2728; {currentStreak} day streak
          </p>
        )}
        <p className="text-dark text-sm italic max-w-xs mb-1">
          &ldquo;{saveVerse.text}&rdquo;
        </p>
        <p className="text-muted text-xs mb-4">&mdash; {saveVerse.ref}</p>
        <p className="text-muted text-sm max-w-xs">
          Come back tomorrow to check in on your execution.
        </p>
        <button
          onClick={() => {
            setSaved(false);
            setVerseRef("");
            setVerseText("");
            setVerseLookedUp(false);
            setRevelationReflection("");
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
      {/* Date + Title with olive branch */}
      <p className="text-muted text-sm mb-1">{today}</p>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-serif text-2xl text-brown">Daily ROPE</h1>
      </div>
      <div className="flex justify-start mb-5">
        <OliveBranch className="opacity-50" />
      </div>

      {/* ROPE Progress */}
      <div className="flex items-center gap-1.5 mb-6">
        {["R", "O", "P", "E"].map((letter, i) => {
          const filled =
            (i === 0 && (verseLookedUp || verseRef.trim())) ||
            (i === 1 && observation.trim()) ||
            (i === 2 && prayer.trim()) ||
            (i === 3 && execution.trim());
          return (
            <div key={letter} className="flex items-center gap-1.5 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif font-bold transition-all duration-300 ${
                filled
                  ? "bg-brown text-ivory shadow-sm scale-100"
                  : "bg-brown/8 text-brown/40 scale-95"
              }`}>
                {letter}
              </div>
              {i < 3 && (
                <div className="flex-1 h-0.5 rounded-full transition-all duration-500" style={{
                  background: filled ? "var(--color-brown)" : "rgba(92,67,39,0.08)"
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Section divider */}
      <div className="section-divider mb-5" />

      <div className="space-y-5">
        {/* Step 1: Revelation */}
        <section
          className={`card-surface rounded-2xl p-5 border-l-2 ${verseLookedUp ? "border-l-brown/30" : "border-l-transparent"}`}
          style={{ animation: "fadeInUp 0.5s ease-out both", animationDelay: "0s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="step-badge">R</div>
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
                className="flex-1 px-4 py-2.5 bg-ivory border border-brown/10 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none text-sm"
              />
              <select
                value={translation}
                onChange={(e) => { setTranslationState(e.target.value); setTranslation(e.target.value); }}
                className="px-2 py-2.5 bg-ivory border border-brown/10 rounded-xl text-dark text-xs focus:outline-none shrink-0"
              >
                {TRANSLATIONS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <button
                onClick={lookupVerse}
                disabled={lookingUp || !verseRef.trim()}
                className="px-4 py-2.5 bg-brown text-ivory rounded-xl text-sm font-medium hover:bg-brown-light disabled:opacity-40 transition shrink-0"
              >
                {lookingUp ? "..." : "Look up"}
              </button>
              <button
                onClick={() => {
                  const verse = getTodaysVerse();
                  setVerseRef(verse);
                  setShowSuggestions(false);
                }}
                className="px-3 py-2.5 text-accent-olive text-xs font-medium border border-accent-olive/20 rounded-xl hover:bg-accent-olive/5 transition shrink-0 whitespace-nowrap"
                title="Get today's suggested verse"
              >
                Today&apos;s verse
              </button>
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-16 top-12 z-20 bg-ivory border border-brown/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                style={{ animation: "fadeIn 0.15s ease-out both", boxShadow: "var(--shadow-elevated)" }}
              >
                {suggestions.map((book) => (
                  <button
                    key={book}
                    onClick={() => selectSuggestion(book)}
                    className="w-full text-left px-4 py-2.5 text-sm text-brown hover:bg-cream transition"
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
            <div className="mt-3 rounded-xl overflow-hidden" style={{ animation: "fadeInUp 0.3s ease-out both" }}>
              {/* Passage card */}
              <div className="bg-ivory/80 p-4 border-l-2 border-accent-gold/30">
                <p className="text-dark text-sm leading-relaxed italic">
                  &ldquo;{verseText}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-muted text-xs">&mdash; {verseRef}</p>
                  <a
                    href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(verseRef.trim())}&version=${getGatewayVersion(translation)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-accent-olive/60 uppercase tracking-wider hover:text-accent-olive transition-colors"
                  >
                    Read full chapter &rarr;
                  </a>
                </div>
              </div>
              {/* Revelation reflection */}
              <div className="px-4 py-3 bg-brown/[0.03] border-t border-brown/5">
                <textarea
                  value={revelationReflection}
                  onChange={(e) => setRevelationReflection(e.target.value)}
                  placeholder="What is God highlighting for you in this verse?"
                  rows={2}
                  className="w-full bg-transparent text-dark text-sm placeholder:text-muted/40 focus:outline-none resize-none leading-relaxed italic"
                />
              </div>
            </div>
          )}
        </section>

        {/* Step 2: Observation */}
        <section
          className={`card-surface rounded-2xl p-5 border-l-2 ${observation.trim() ? "border-l-brown/30" : "border-l-transparent"}`}
          style={{ animation: "fadeInUp 0.5s ease-out both", animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="step-badge">O</div>
            <h2 className="font-serif text-lg text-dark">Observation</h2>
          </div>
          <div className="relative">
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder={steps[1].placeholder}
              rows={4}
              className="w-full px-4 py-3 bg-ivory border border-brown/10 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none text-sm leading-relaxed resize-none min-h-[120px]"
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
          className={`card-surface rounded-2xl p-5 border-l-2 ${prayer.trim() ? "border-l-brown/30" : "border-l-transparent"}`}
          style={{ animation: "fadeInUp 0.5s ease-out both", animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="step-badge">P</div>
            <div className="flex items-center gap-2 flex-1">
              <h2 className="font-serif text-lg text-dark">Prayer</h2>
              <button
                onClick={() => {
                  const suggestion = generatePrayerSuggestion(verseRef, verseText, observation);
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
              className="w-full px-4 py-3 bg-ivory border border-brown/10 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none text-sm leading-relaxed resize-none min-h-[120px]"
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
          className={`card-surface rounded-2xl p-5 border-l-2 ${execution.trim() ? "border-l-brown/30" : "border-l-transparent"}`}
          style={{ animation: "fadeInUp 0.5s ease-out both", animationDelay: "0.3s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="step-badge">E</div>
            <div className="flex items-center gap-2 flex-1">
              <h2 className="font-serif text-lg text-dark">Execution</h2>
              <button
                onClick={() => {
                  const suggestion = generateExecutionSuggestion(verseRef, verseText, observation);
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
              className="w-full px-4 py-3 bg-ivory border border-brown/10 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none text-sm leading-relaxed resize-none min-h-[120px]"
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

      {/* Save area */}
      <div className="mt-8 pt-6 border-t border-brown/8">
        <button
          data-save-btn
          onClick={handleSave}
          disabled={!allFilled}
          className={`w-full py-3.5 btn-primary text-center text-base ${allFilled ? "animate-breathe" : ""}`}
        >
          Save Entry
        </button>
        <p className="text-center text-muted/40 text-xs mt-3 italic">
          Your words are kept safely on this device
        </p>
      </div>
    </div>
  );
}
