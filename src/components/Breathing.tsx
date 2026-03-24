"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function Breathing({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [cycle, setCycle] = useState(0);
  const [scale, setScale] = useState(1);
  const totalCycles = 3;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const runCycle = useCallback(async () => {
    // Inhale 4s
    setPhase("inhale");
    setScale(1.3);
    await new Promise(r => setTimeout(r, 4000));

    // Hold 4s
    setPhase("hold");
    await new Promise(r => setTimeout(r, 4000));

    // Exhale 4s
    setPhase("exhale");
    setScale(1);
    await new Promise(r => setTimeout(r, 4000));

    setCycle(c => c + 1);
  }, []);

  useEffect(() => {
    if (cycle >= totalCycles) {
      const timer = setTimeout(() => onCompleteRef.current(), 500);
      return () => clearTimeout(timer);
    }
    runCycle();
  }, [cycle, runCycle]);

  if (cycle >= totalCycles) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: "rgba(10,8,4,0.85)", backdropFilter: "blur(12px)", animation: "fadeIn 0.3s ease-out both" }}>
        <div className="text-center" style={{ animation: "fadeInUp 0.5s ease-out both" }}>
          <p className="font-serif text-2xl text-ivory/90 mb-2">You are ready</p>
          <p className="text-ivory/40 text-sm italic">Open His Word</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center" style={{ background: "rgba(10,8,4,0.9)", backdropFilter: "blur(12px)" }}>
      {/* Breathing circle */}
      <div
        className="w-40 h-40 rounded-full border-2 border-accent-gold/20 flex items-center justify-center mb-8"
        style={{
          transform: `scale(${scale})`,
          transition: "transform 4s ease-in-out",
          boxShadow: `0 0 ${scale > 1 ? 40 : 10}px rgba(196, 162, 101, ${scale > 1 ? 0.15 : 0.05})`,
        }}
      >
        <span className="font-serif text-ivory/80 text-lg">
          {phase === "inhale" ? "Breathe in" : phase === "hold" ? "Hold" : "Breathe out"}
        </span>
      </div>

      {/* Verse */}
      <p className="text-ivory/30 text-sm italic max-w-xs text-center mb-6">
        &ldquo;Be still, and know that I am God.&rdquo;
      </p>
      <p className="text-ivory/15 text-xs">Psalm 46:10</p>

      {/* Progress */}
      <div className="flex gap-2 mt-8">
        {Array.from({ length: totalCycles }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < cycle ? "bg-accent-gold" : i === cycle ? "bg-accent-gold/50" : "bg-ivory/10"}`} />
        ))}
      </div>

      {/* Skip */}
      <button onClick={onComplete} className="text-ivory/20 text-xs mt-6 hover:text-ivory/40 transition">
        Skip
      </button>
    </div>
  );
}
