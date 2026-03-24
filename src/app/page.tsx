"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const words = [
  { letter: "R", word: "Revelation" },
  { letter: "O", word: "Observation" },
  { letter: "P", word: "Prayer" },
  { letter: "E", word: "Execution" },
];

export default function SplashPage() {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);

  function handleEnter() {
    setExiting(true);
    setTimeout(() => {
      router.push("/journal");
    }, 800);
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${
        exiting ? "animate-zoom-in-fade" : ""
      }`}
    >
      {/* Background image - hands reaching toward light */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      {/* Dark warm overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f12]/80 via-[#3b2f1e]/75 to-[#2a1f12]/85" />
      {/* Warm vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(20,14,6,0.5)_100%)]" />

      <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-md mx-auto">
        {/* Cross + ROPE Title */}
        <div
          className="flex items-center gap-3 mb-10"
          style={{ animation: "fadeIn 0.8s ease-out both" }}
        >
          {/* Cross icon */}
          <svg
            width="28"
            height="38"
            viewBox="0 0 28 38"
            fill="none"
            className="text-ivory/70 shrink-0"
          >
            <rect x="11" y="0" width="6" height="38" rx="1.5" fill="currentColor" />
            <rect x="0" y="8" width="28" height="6" rx="1.5" fill="currentColor" />
          </svg>
          <h1 className="font-serif text-6xl md:text-7xl font-bold text-ivory/90 tracking-widest">
            ROPE
          </h1>
        </div>

        {/* Acronym Words — compact horizontal layout */}
        <div className="space-y-2.5 mb-10 w-full flex flex-col items-center">
          {words.map(({ letter, word }, i) => (
            <div
              key={letter}
              className="flex items-baseline gap-3"
              style={{
                animation: "fadeInUp 0.6s ease-out both",
                animationDelay: `${0.5 + i * 0.15}s`,
              }}
            >
              <span className="font-serif text-2xl md:text-3xl font-bold text-ivory/85 leading-none w-7 text-right">
                {letter}
              </span>
              <span className="text-ivory/45 text-sm md:text-base tracking-widest uppercase font-light">
                {word}
              </span>
            </div>
          ))}
        </div>

        {/* Scripture Verse */}
        <p
          className="text-ivory/40 text-sm italic max-w-xs text-center leading-relaxed mb-12"
          style={{
            animation: "fadeIn 0.6s ease-out both",
            animationDelay: "1.2s",
          }}
        >
          &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
          <br />
          <span className="not-italic text-ivory/25 text-xs">&mdash; Psalm 119:105</span>
        </p>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          disabled={exiting}
          className="px-10 py-3.5 text-ivory/90 font-medium text-base rounded-2xl border border-ivory/20 bg-ivory/10 backdrop-blur-sm hover:bg-ivory/20 transition-all disabled:opacity-50"
          style={{
            animation: "fadeInUp 0.6s ease-out both, breathe 3s ease-in-out 1.8s infinite",
            animationDelay: "1.4s",
          }}
        >
          Walk with the Lord
        </button>
      </div>
    </div>
  );
}
