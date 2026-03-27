"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/*
 * Biblical Stillness Gate
 *
 * Psalm 46:10 — "Be still, and know that I am God"
 * The practice of centering before Scripture is rooted throughout the Bible:
 *   - Habakkuk 2:20: "The LORD is in his holy temple; let all the earth be silent before him."
 *   - 1 Kings 19:12: God spoke in "a still small voice"
 *   - Psalm 37:7: "Be still before the LORD and wait patiently for him"
 *   - Lamentations 3:25-26: "The LORD is good to those who wait for him... it is good to wait quietly"
 *
 * This exercise uses progressive stillness — breathing slows the body,
 * Scripture phrases focus the mind, and silence prepares the heart to hear God.
 */

const STILLNESS_PHASES = [
  { text: "Be still", subtext: "Psalm 46:10", duration: 5000 },
  { text: "and know", subtext: "", duration: 4000 },
  { text: "that I am God", subtext: "", duration: 5000 },
] as const;

const BREATHING_CYCLES = 3;

export default function Breathing({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<"stillness" | "breathing" | "ready">("stillness");
  const [stillnessIdx, setStillnessIdx] = useState(0);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [cycle, setCycle] = useState(0);
  const [scale, setScale] = useState(1);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  /* Stage 1: Progressive Psalm 46:10 stillness */
  useEffect(() => {
    if (stage !== "stillness") return;
    if (stillnessIdx >= STILLNESS_PHASES.length) {
      setStage("breathing");
      return;
    }
    const timer = setTimeout(() => {
      setStillnessIdx(i => i + 1);
    }, STILLNESS_PHASES[stillnessIdx].duration);
    return () => clearTimeout(timer);
  }, [stage, stillnessIdx]);

  /* Stage 2: Breathing cycles */
  const runCycle = useCallback(async () => {
    setPhase("inhale");
    setScale(1.3);
    await new Promise(r => setTimeout(r, 4000));

    setPhase("hold");
    await new Promise(r => setTimeout(r, 4000));

    setPhase("exhale");
    setScale(1);
    await new Promise(r => setTimeout(r, 4000));

    setCycle(c => c + 1);
  }, []);

  useEffect(() => {
    if (stage !== "breathing") return;
    if (cycle >= BREATHING_CYCLES) {
      setStage("ready");
      return;
    }
    runCycle();
  }, [stage, cycle, runCycle]);

  /* Stage 3: Ready — auto-dismiss */
  useEffect(() => {
    if (stage !== "ready") return;
    const timer = setTimeout(() => onCompleteRef.current(), 2000);
    return () => clearTimeout(timer);
  }, [stage]);

  /* ─── Stillness stage ─── */
  if (stage === "stillness") {
    // Build the cumulative text: "Be still" → "Be still and know" → "Be still and know that I am God"
    const accumulated = STILLNESS_PHASES.slice(0, stillnessIdx + 1).map(p => p.text).join(" ");
    const currentPhase = STILLNESS_PHASES[Math.min(stillnessIdx, STILLNESS_PHASES.length - 1)];

    return (
      <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center" style={{ background: "rgba(30,28,22,0.78)", backdropFilter: "blur(16px)" }}>
        {/* Small cross */}
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="mb-10 opacity-50">
          <rect x="6" y="0" width="4" height="24" rx="1" fill="rgba(196, 162, 101, 1)" />
          <rect x="0" y="5" width="16" height="4" rx="1" fill="rgba(196, 162, 101, 1)" />
        </svg>

        <p
          className="font-serif text-ivory text-2xl md:text-3xl text-center max-w-md px-6 leading-relaxed transition-all duration-1000 ease-out"
          style={{ opacity: 1 }}
        >
          {accumulated}
        </p>

        {currentPhase.subtext && (
          <p className="text-ivory/60 text-xs mt-4 tracking-[0.2em] uppercase transition-opacity duration-700" style={{ opacity: stillnessIdx === 0 ? 1 : 0 }}>
            {currentPhase.subtext}
          </p>
        )}

        {/* Subtle pulse ring */}
        <div
          className="absolute w-64 h-64 rounded-full border border-ivory/[0.1]"
          style={{ animation: "pulse 4s ease-in-out infinite" }}
        />

        {/* Skip */}
        <button onClick={() => onCompleteRef.current()} className="absolute bottom-10 text-ivory/40 hover:text-ivory/70 text-sm tracking-wide transition-colors duration-300">
          Skip
        </button>
      </div>
    );
  }

  /* ─── Ready stage ─── */
  if (stage === "ready") {
    return (
      <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center" style={{ background: "rgba(30,28,22,0.75)", backdropFilter: "blur(12px)", animation: "fadeIn 0.5s ease-out both" }}>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="mb-6 opacity-50">
          <rect x="6" y="0" width="4" height="24" rx="1" fill="rgba(196, 162, 101, 1)" />
          <rect x="0" y="5" width="16" height="4" rx="1" fill="rgba(196, 162, 101, 1)" />
        </svg>
        <div className="text-center" style={{ animation: "fadeInUp 0.6s ease-out both" }}>
          <p className="font-serif text-2xl text-ivory mb-3">Your heart is ready</p>
          <p className="text-ivory/70 text-sm italic max-w-xs mx-auto leading-relaxed">
            &ldquo;The LORD is in his holy temple; let all the earth be silent before him.&rdquo;
          </p>
          <p className="text-ivory/40 text-xs mt-2 tracking-[0.15em] uppercase">Habakkuk 2:20</p>
        </div>

        {/* Skip */}
        <button onClick={() => onCompleteRef.current()} className="absolute bottom-10 text-ivory/40 hover:text-ivory/70 text-sm tracking-wide transition-colors duration-300">
          Skip
        </button>
      </div>
    );
  }

  /* ─── Breathing stage ─── */
  const breathingVerses = [
    { text: "Wait for the LORD; be strong and take heart and wait for the LORD.", ref: "Psalm 27:14" },
    { text: "In quietness and trust is your strength.", ref: "Isaiah 30:15" },
    { text: "The LORD is good to those who wait for him, to the soul who seeks him.", ref: "Lamentations 3:25" },
  ];
  const currentVerse = breathingVerses[Math.min(cycle, breathingVerses.length - 1)];

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center" style={{ background: "rgba(30,28,22,0.78)", backdropFilter: "blur(14px)" }}>
      {/* Breathing circle */}
      <div
        className="w-40 h-40 rounded-full border-2 border-accent-gold/40 flex items-center justify-center mb-8"
        style={{
          transform: `scale(${scale})`,
          transition: "transform 4s ease-in-out",
          boxShadow: `0 0 ${scale > 1 ? 50 : 15}px rgba(196, 162, 101, ${scale > 1 ? 0.25 : 0.1})`,
        }}
      >
        <span className="font-serif text-ivory text-lg">
          {phase === "inhale" ? "Breathe in" : phase === "hold" ? "Hold" : "Release"}
        </span>
      </div>

      {/* Rotating verse per cycle */}
      <p className="text-ivory/60 text-sm italic max-w-xs text-center mb-2 transition-opacity duration-500">
        &ldquo;{currentVerse.text}&rdquo;
      </p>
      <p className="text-ivory/35 text-xs">{currentVerse.ref}</p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {Array.from({ length: BREATHING_CYCLES }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-colors duration-300 ${i < cycle ? "bg-accent-gold" : i === cycle ? "bg-accent-gold/50" : "bg-ivory/10"}`} />
        ))}
      </div>

      {/* Skip */}
      <button onClick={() => onCompleteRef.current()} className="absolute bottom-10 text-ivory/40 hover:text-ivory/70 text-sm tracking-wide transition-colors duration-300">
        Skip
      </button>
    </div>
  );
}
