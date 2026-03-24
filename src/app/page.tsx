"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ─── Data ─── */
const LETTERS = [
  { letter: "R", word: "Revelation", prompt: "What is God showing you today?" },
  { letter: "O", word: "Observation", prompt: "What stands out, and why?" },
  { letter: "P", word: "Prayer", prompt: "Turn insight into conversation." },
  { letter: "E", word: "Execution", prompt: "How will you live this tomorrow?" },
] as const;

/* ─── Scroll reveal hook ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Main Page ─── */
export default function SplashPage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0); // 0=dark, 1=bloom, 2=R, 3=O, 4=P, 5=E, 6=subtitle, 7=copy, 8=cta, 9=ready
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [exiting, setExiting] = useState(false);

  /* Orchestrated entrance sequence */
  useEffect(() => {
    const delays = [200, 600, 900, 1100, 1300, 1500, 1900, 2200, 2500, 2700];
    const timers = delays.map((d, i) => setTimeout(() => setPhase(i + 1), d));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEnter = useCallback(() => {
    setExiting(true);
    setTimeout(() => router.push("/journal"), 900);
  }, [router]);

  /* Scroll sections */
  const s1 = useScrollReveal(0.2);
  const s2 = useScrollReveal(0.2);
  const s3 = useScrollReveal(0.2);
  const s4 = useScrollReveal(0.2);
  const sCta = useScrollReveal(0.3);

  const scrollSections = [s1, s2, s3, s4];

  return (
    <div className="relative">
      {/* ═══════════════════════════════════════════
          HERO — Full viewport
          ═══════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#0d0906" }}
      >
        {/* ─── Light bloom from above (Threshold element) ─── */}
        <div
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-out pointer-events-none"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            background: `
              radial-gradient(ellipse 60% 40% at 50% 0%, rgba(196, 162, 101, 0.08) 0%, transparent 70%),
              radial-gradient(ellipse 80% 50% at 50% 10%, rgba(245, 239, 227, 0.04) 0%, transparent 60%)
            `,
          }}
        />

        {/* ─── Warm ambient center glow ─── */}
        <div
          className="absolute inset-0 transition-opacity duration-[2500ms] ease-out pointer-events-none"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            background: `radial-gradient(ellipse 50% 50% at 50% 45%, rgba(196, 162, 101, 0.03) 0%, transparent 70%)`,
          }}
        />

        {/* ─── Subtle grain texture ─── */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* ─── Exit overlay — expanding light ─── */}
        <div
          className="absolute inset-0 z-50 pointer-events-none transition-all ease-in-out"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, #f5efe3 0%, #f5efe3 40%, rgba(245,239,227,0.8) 70%, transparent 100%)`,
            opacity: exiting ? 1 : 0,
            transform: exiting ? "scale(3)" : "scale(0.3)",
            transitionDuration: exiting ? "900ms" : "0ms",
          }}
        />

        {/* ─── Content ─── */}
        <div className="relative z-10 flex flex-col items-center px-6 w-full">

          {/* ═══ ROPE — Giant typography hero ═══ */}
          <div className="flex items-center justify-center mb-6 md:mb-8 select-none">
            {LETTERS.map(({ letter, word, prompt }, i) => {
              const isRevealed = phase >= i + 2;
              const isHovered = hoveredIdx === i;
              const othersHovered = hoveredIdx !== null && hoveredIdx !== i;

              return (
                <div
                  key={letter}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
                >
                  {/* The letter itself */}
                  <span
                    className="font-serif font-bold inline-block transition-all duration-500 ease-out"
                    style={{
                      fontSize: "clamp(4.5rem, 18vw, 14rem)",
                      lineHeight: 0.85,
                      letterSpacing: "0.06em",
                      color: isRevealed
                        ? isHovered
                          ? "rgba(245, 239, 227, 1)"
                          : othersHovered
                            ? "rgba(245, 239, 227, 0.35)"
                            : "rgba(245, 239, 227, 0.88)"
                        : "transparent",
                      textShadow: isRevealed
                        ? isHovered
                          ? "0 0 40px rgba(196, 162, 101, 0.25), 0 0 80px rgba(196, 162, 101, 0.08)"
                          : "0 0 20px rgba(196, 162, 101, 0.06)"
                        : "none",
                      opacity: isRevealed ? 1 : 0,
                      transform: isRevealed
                        ? isHovered
                          ? "translateY(-4px)"
                          : "translateY(0)"
                        : "translateY(20px)",
                    }}
                  >
                    {letter}
                  </span>

                  {/* ─── Hover reveal: word + prompt ─── */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none whitespace-nowrap transition-all duration-300 ease-out"
                    style={{
                      top: "calc(100% + 12px)",
                      opacity: isHovered && isRevealed ? 1 : 0,
                      transform: isHovered && isRevealed
                        ? "translateY(0)"
                        : "translateY(6px)",
                    }}
                  >
                    <span className="font-serif text-sm md:text-base text-ivory/70 tracking-[0.2em] uppercase">
                      {word}
                    </span>
                    <span className="text-ivory/35 text-xs md:text-sm mt-1 italic font-light">
                      {prompt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ═══ Decorative line ═══ */}
          <div
            className="h-px mb-6 md:mb-8 transition-all duration-700 ease-out"
            style={{
              width: phase >= 6 ? "6rem" : "0rem",
              background: "linear-gradient(90deg, transparent, rgba(196, 162, 101, 0.3), transparent)",
            }}
          />

          {/* ═══ Subtitle ═══ */}
          <p
            className="font-serif text-ivory/45 text-sm md:text-base tracking-[0.3em] uppercase mb-8 md:mb-10 text-center transition-all duration-600 ease-out"
            style={{
              opacity: phase >= 6 ? 1 : 0,
              transform: phase >= 6 ? "translateY(0)" : "translateY(10px)",
            }}
          >
            Revelation &middot; Observation &middot; Prayer &middot; Execution
          </p>

          {/* ═══ Supporting copy ═══ */}
          <p
            className="text-ivory/30 text-sm md:text-base max-w-md text-center leading-relaxed mb-10 md:mb-12 transition-all duration-600 ease-out"
            style={{
              opacity: phase >= 7 ? 1 : 0,
              transform: phase >= 7 ? "translateY(0)" : "translateY(10px)",
            }}
          >
            A daily practice for reading Scripture with intention&mdash;one verse, four steps, a deeper walk.
          </p>

          {/* ═══ Primary CTA ═══ */}
          <button
            onClick={handleEnter}
            disabled={exiting || phase < 8}
            className="group relative px-10 py-4 text-ivory/90 font-medium text-base md:text-lg rounded-xl border border-ivory/12 bg-ivory/[0.04] backdrop-blur-sm transition-all duration-300 ease-out disabled:opacity-0 disabled:pointer-events-none hover:bg-ivory/[0.1] hover:border-ivory/25 hover:shadow-[0_0_30px_rgba(196,162,101,0.08)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/20"
            style={{
              opacity: phase >= 8 ? 1 : 0,
              transform: phase >= 8 ? "translateY(0)" : "translateY(12px)",
              transitionDuration: "600ms",
            }}
          >
            <span className="relative z-10 tracking-wide">Begin today&#39;s journal</span>
            {/* Subtle inner glow on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,rgba(196,162,101,0.06),transparent_70%)]" />
          </button>

          {/* ═══ Scripture — editorial credit placement ═══ */}
          <p
            className="text-ivory/18 text-xs italic mt-16 md:mt-20 text-center transition-all duration-600 ease-out tracking-wide"
            style={{
              opacity: phase >= 9 ? 1 : 0,
            }}
          >
            &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
            <span className="not-italic block mt-1 text-ivory/12 text-[10px] tracking-[0.2em] uppercase">
              Psalm 119:105
            </span>
          </p>
        </div>

        {/* ─── Scroll indicator ─── */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-600 ease-out"
          style={{ opacity: phase >= 9 && !exiting ? 0.25 : 0 }}
        >
          <div className="w-5 h-8 rounded-full border border-ivory/20 flex items-start justify-center pt-1.5">
            <div
              className="w-1 h-2 rounded-full bg-ivory/40"
              style={{ animation: phase >= 9 ? "scrollDot 2s ease-in-out infinite" : "none" }}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BELOW THE FOLD — The Practice
          ═══════════════════════════════════════════ */}
      <section
        className="relative py-24 md:py-32 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0d0906 0%, #13100a 50%, #0d0906 100%)" }}
      >
        {/* Subtle top light bleed */}
        <div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(196, 162, 101, 0.02) 0%, transparent 100%)",
          }}
        />

        {/* Section heading */}
        <div className="max-w-2xl mx-auto px-6 mb-16 md:mb-24 text-center">
          <p className="text-ivory/20 text-xs tracking-[0.4em] uppercase mb-4 font-medium">
            The Practice
          </p>
          <h2 className="font-serif text-ivory/70 text-2xl md:text-3xl font-semibold leading-snug">
            Four steps. One verse.<br />A daily rhythm of faith.
          </h2>
        </div>

        {/* Four steps */}
        <div className="max-w-3xl mx-auto px-6 space-y-16 md:space-y-20">
          {LETTERS.map(({ letter, word, prompt }, i) => {
            const section = scrollSections[i];
            return (
              <div
                key={letter}
                ref={section.ref}
                className="flex items-start gap-6 md:gap-8 transition-all duration-700 ease-out"
                style={{
                  opacity: section.visible ? 1 : 0,
                  transform: section.visible ? "translateY(0)" : "translateY(24px)",
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                {/* Letter badge */}
                <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full border border-ivory/10 flex items-center justify-center">
                  <span className="font-serif text-xl md:text-2xl font-bold text-ivory/60">
                    {letter}
                  </span>
                </div>

                {/* Content */}
                <div className="pt-1">
                  <h3 className="font-serif text-ivory/70 text-lg md:text-xl font-semibold mb-2 tracking-wide">
                    {word}
                  </h3>
                  <p className="text-ivory/30 text-sm md:text-base leading-relaxed max-w-md">
                    {prompt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing CTA */}
        <div
          ref={sCta.ref}
          className="flex flex-col items-center mt-20 md:mt-28 transition-all duration-700 ease-out"
          style={{
            opacity: sCta.visible ? 1 : 0,
            transform: sCta.visible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          {/* Decorative line */}
          <div
            className="w-12 h-px mb-10"
            style={{ background: "linear-gradient(90deg, transparent, rgba(196, 162, 101, 0.2), transparent)" }}
          />

          <button
            onClick={handleEnter}
            disabled={exiting}
            className="group relative px-10 py-4 text-ivory/80 font-medium text-base rounded-xl border border-ivory/10 bg-ivory/[0.03] backdrop-blur-sm transition-all duration-300 ease-out hover:bg-ivory/[0.08] hover:border-ivory/20 hover:shadow-[0_0_24px_rgba(196,162,101,0.06)] active:scale-[0.98] disabled:opacity-50"
          >
            <span className="tracking-wide">Enter today&#39;s ROPE</span>
          </button>

          <p className="text-ivory/12 text-xs mt-8 tracking-wide italic">
            Open source &middot; Free forever
          </p>
        </div>
      </section>
    </div>
  );
}
