"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const words = [
  { letter: "R", word: "evelation" },
  { letter: "O", word: "bservation" },
  { letter: "P", word: "rayer" },
  { letter: "E", word: "xecution" },
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
      style={{ background: "#1a1209" }}
    >
      {/* Background image - reaching hands */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/1615776/pexels-photo-1615776.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
        }}
      />
      {/* Dark overlay — heavier for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a06]/70 via-[#1a1209]/60 to-[#0d0a06]/80" />
      {/* Center spotlight effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(10,7,3,0.6)_70%)]" />

      <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-lg mx-auto">
        {/* Cross + ROPE Title */}
        <div
          className="flex items-center gap-4 mb-4"
          style={{ animation: "fadeIn 1s ease-out both" }}
        >
          {/* Cross icon with glow */}
          <svg
            width="32"
            height="44"
            viewBox="0 0 32 44"
            fill="none"
            className="shrink-0"
            style={{ animation: "floatUp 4s ease-in-out 2s infinite" }}
          >
            <rect x="12.5" y="0" width="7" height="44" rx="1.5" fill="rgba(246,240,228,0.7)" />
            <rect x="0" y="9" width="32" height="7" rx="1.5" fill="rgba(246,240,228,0.7)" />
          </svg>
          <h1
            className="font-serif text-7xl md:text-8xl font-bold text-ivory/95 tracking-[0.2em]"
            style={{ animation: "glowPulse 4s ease-in-out 1.5s infinite" }}
          >
            ROPE
          </h1>
        </div>

        {/* Decorative line */}
        <div
          className="w-24 h-px bg-ivory/20 mb-10"
          style={{
            animation: "lineGrow 0.8s ease-out both",
            animationDelay: "0.8s",
            transformOrigin: "center",
          }}
        />

        {/* Acronym Words — clean grid alignment */}
        <div className="mb-12 w-full max-w-xs mx-auto">
          {words.map(({ letter, word }, i) => (
            <div
              key={letter}
              className="flex items-baseline mb-3 last:mb-0"
              style={{
                animation: "slideInLeft 0.5s ease-out both",
                animationDelay: `${0.8 + i * 0.2}s`,
              }}
            >
              <span
                className="font-serif text-3xl md:text-4xl font-bold text-ivory/90 leading-none"
                style={{ width: "2.2rem", textAlign: "right", marginRight: "0.15rem" }}
              >
                {letter}
              </span>
              <span
                className="text-ivory/40 text-base md:text-lg tracking-wider font-light"
                style={{
                  animation: "slideInRight 0.5s ease-out both",
                  animationDelay: `${1.0 + i * 0.2}s`,
                }}
              >
                {word}
              </span>
            </div>
          ))}
        </div>

        {/* Scripture Verse */}
        <p
          className="text-ivory/35 text-sm italic max-w-xs text-center leading-relaxed mb-12"
          style={{
            animation: "fadeIn 0.8s ease-out both",
            animationDelay: "2s",
          }}
        >
          &ldquo;Your word is a lamp to my feet
          <br />
          and a light to my path.&rdquo;
          <br />
          <span className="not-italic text-ivory/20 text-xs mt-1 inline-block">
            Psalm 119:105
          </span>
        </p>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          disabled={exiting}
          className="group relative px-12 py-4 text-ivory/90 font-medium text-lg rounded-2xl border border-ivory/15 bg-ivory/5 backdrop-blur-md hover:bg-ivory/15 hover:border-ivory/30 transition-all duration-500 disabled:opacity-50"
          style={{
            animation: "fadeInUp 0.8s ease-out both",
            animationDelay: "2.3s",
          }}
        >
          <span
            className="relative z-10"
            style={{ animation: "glowPulse 3s ease-in-out 3s infinite" }}
          >
            Walk with the Lord
          </span>
          {/* Button glow effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,rgba(246,240,228,0.08),transparent_70%)]" />
        </button>
      </div>
    </div>
  );
}
