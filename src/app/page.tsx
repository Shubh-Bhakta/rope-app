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
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#3b2f1e] via-[#6b4e2e] to-[#a67c52] ${
        exiting ? "animate-zoom-in-fade" : ""
      }`}
    >
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center px-6">
        {/* ROPE Title */}
        <h1
          className="font-serif text-7xl md:text-8xl font-bold text-ivory/90 tracking-widest mb-12"
          style={{ animation: "fadeIn 0.8s ease-out both" }}
        >
          ROPE
        </h1>

        {/* Acronym Words */}
        <div className="space-y-4 mb-14">
          {words.map(({ letter, word }, i) => (
            <div
              key={letter}
              className="flex items-baseline gap-4"
              style={{
                animation: "fadeInUp 0.6s ease-out both",
                animationDelay: `${0.6 + i * 0.2}s`,
              }}
            >
              <span className="font-serif text-4xl md:text-5xl font-bold text-ivory/90 leading-none w-10 text-right">
                {letter}
              </span>
              <span className="text-ivory/55 text-lg md:text-xl tracking-wide font-light">
                {word}
              </span>
            </div>
          ))}
        </div>

        {/* Scripture Verse */}
        <p
          className="text-ivory/45 text-sm italic max-w-xs text-center leading-relaxed mb-14"
          style={{
            animation: "fadeIn 0.6s ease-out both",
            animationDelay: "1.6s",
          }}
        >
          &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
          <br />
          <span className="not-italic text-ivory/30">&mdash; Psalm 119:105</span>
        </p>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          disabled={exiting}
          className="px-10 py-3.5 text-ivory/90 font-medium text-lg rounded-2xl border border-ivory/20 bg-ivory/10 hover:bg-ivory/15 transition-all disabled:opacity-50 animate-breathe"
          style={{
            animation: "fadeInUp 0.6s ease-out both, breathe 3s ease-in-out 2.2s infinite",
            animationDelay: "1.8s",
          }}
        >
          Walk with the Lord
        </button>
      </div>
    </div>
  );
}
