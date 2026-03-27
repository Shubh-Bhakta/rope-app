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

/* Hard-coded light palette so dark-mode theme remapping can't wash it out */
const IVORY = "#f5efe3";
const GOLD = "#c4a265";
const BG = "#1e1c16";

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

  const skipBtn = (
    <button
      onClick={() => onCompleteRef.current()}
      className="absolute bottom-10 text-sm tracking-wide transition-opacity duration-300"
      style={{ color: IVORY, opacity: 0.5 }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
    >
      Skip
    </button>
  );

  /* ─── Stillness stage ─── */
  if (stage === "stillness") {
    const accumulated = STILLNESS_PHASES.slice(0, stillnessIdx + 1).map(p => p.text).join(" ");
    const currentPhase = STILLNESS_PHASES[Math.min(stillnessIdx, STILLNESS_PHASES.length - 1)];

    return (
      <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center" style={{ background: BG }}>
        {/* Small cross */}
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="mb-10" style={{ opacity: 0.7 }}>
          <rect x="6" y="0" width="4" height="24" rx="1" fill={GOLD} />
          <rect x="0" y="5" width="16" height="4" rx="1" fill={GOLD} />
        </svg>

        <p
          className="font-serif text-2xl md:text-3xl text-center max-w-md px-6 leading-relaxed transition-all duration-1000 ease-out"
          style={{ color: IVORY }}
        >
          {accumulated}
        </p>

        {currentPhase.subtext && (
          <p
            className="text-xs mt-4 tracking-[0.2em] uppercase transition-opacity duration-700"
            style={{ color: IVORY, opacity: stillnessIdx === 0 ? 0.5 : 0 }}
          >
            {currentPhase.subtext}
          </p>
        )}

        {/* Subtle pulse ring */}
        <div
          className="absolute w-64 h-64 rounded-full"
          style={{ border: `1px solid rgba(245, 239, 227, 0.1)`, animation: "pulse 4s ease-in-out infinite" }}
        />

        {skipBtn}
      </div>
    );
  }

  /* ─── Ready stage ─── */
  if (stage === "ready") {
    return (
      <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center" style={{ background: BG, animation: "fadeIn 0.5s ease-out both" }}>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="mb-6" style={{ opacity: 0.7 }}>
          <rect x="6" y="0" width="4" height="24" rx="1" fill={GOLD} />
          <rect x="0" y="5" width="16" height="4" rx="1" fill={GOLD} />
        </svg>
        <div className="text-center" style={{ animation: "fadeInUp 0.6s ease-out both" }}>
          <p className="font-serif text-2xl mb-3" style={{ color: IVORY }}>Your heart is ready</p>
          <p className="text-sm italic max-w-xs mx-auto leading-relaxed" style={{ color: IVORY, opacity: 0.6 }}>
            &ldquo;The LORD is in his holy temple; let all the earth be silent before him.&rdquo;
          </p>
          <p className="text-xs mt-2 tracking-[0.15em] uppercase" style={{ color: IVORY, opacity: 0.35 }}>Habakkuk 2:20</p>
        </div>

        {skipBtn}
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
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center" style={{ background: BG }}>
      {/* Breathing circle */}
      <div
        className="w-40 h-40 rounded-full flex items-center justify-center mb-8"
        style={{
          border: `2px solid rgba(196, 162, 101, 0.5)`,
          transform: `scale(${scale})`,
          transition: "transform 4s ease-in-out",
          boxShadow: `0 0 ${scale > 1 ? 50 : 15}px rgba(196, 162, 101, ${scale > 1 ? 0.25 : 0.1})`,
        }}
      >
        <span className="font-serif text-lg" style={{ color: IVORY }}>
          {phase === "inhale" ? "Breathe in" : phase === "hold" ? "Hold" : "Release"}
        </span>
      </div>

      {/* Rotating verse per cycle */}
      <p className="text-sm italic max-w-xs text-center mb-2 transition-opacity duration-500" style={{ color: IVORY, opacity: 0.5 }}>
        &ldquo;{currentVerse.text}&rdquo;
      </p>
      <p className="text-xs" style={{ color: IVORY, opacity: 0.3 }}>{currentVerse.ref}</p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {Array.from({ length: BREATHING_CYCLES }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: i < cycle ? GOLD : i === cycle ? `rgba(196, 162, 101, 0.5)` : `rgba(245, 239, 227, 0.15)`,
            }}
          />
        ))}
      </div>

      {skipBtn}
    </div>
  );
}
