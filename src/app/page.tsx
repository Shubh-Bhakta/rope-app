"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function MovedPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0804] text-[#f5efe3] selection:bg-[#c4a265]/30">
      {/* ─── Ambient Background Elements ─── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sacred light bloom from above */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 50% 35% at 50% 0%, rgba(196, 162, 101, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse 70% 45% at 50% 5%, rgba(245, 239, 227, 0.08) 0%, transparent 60%)
            `,
          }}
        />
        
        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      {/* ─── Main Content ─── */}
      <main className="relative z-10 flex flex-col items-center px-6 text-center max-w-2xl">
        {/* Small Cross Icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <svg
            width="24"
            height="36"
            viewBox="0 0 20 28"
            fill="none"
            className="mx-auto"
          >
            <rect x="8" y="0" width="4" height="28" rx="1" fill="rgba(196, 162, 101, 0.4)" />
            <rect x="0" y="6" width="20" height="4" rx="1" fill="rgba(196, 162, 101, 0.4)" />
          </svg>
        </motion.div>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tighter mb-4 text-[#c4a265]">
            ROPE
          </h1>
          <p className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-[#f5efe3]/90 mb-8">
            We&#39;ve moved to a new home.
          </p>
        </motion.div>

        {/* Decorative Divider */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "8rem" }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
          className="h-px bg-gradient-to-r from-transparent via-[#c4a265]/40 to-transparent mb-12"
        />

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-lg md:text-xl text-[#f5efe3]/60 leading-relaxed mb-12 font-light"
        >
          Thank you for being part of our journey. <br className="hidden md:block" />
          Continue your daily rhythm of Scripture and prayer at our new domain.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <a
            href="https://ropefaith.com"
            className="group relative inline-flex items-center px-12 py-5 font-serif text-xl font-medium rounded-full transition-all duration-500 hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(196, 162, 101, 0.9) 0%, rgba(166, 132, 71, 0.9) 100%)",
              color: "#0a0804",
              boxShadow: "0 10px 30px -10px rgba(196, 162, 101, 0.5)",
            }}
          >
            Visit ropefaith.com
            <motion.span
              className="ml-3"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </motion.span>
          </a>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="mt-24"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-[#f5efe3]/20 font-medium">
            Revelation &bull; Observation &bull; Prayer &bull; Execution
          </p>
        </motion.div>
      </main>

      {/* ─── Scrolling Scripture Quote (Subtle) ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2, delay: 2 }}
        className="absolute bottom-12 left-0 right-0 text-center px-6"
      >
        <p className="italic text-sm">
          &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo; &mdash; Psalm 119:105
        </p>
      </motion.div>
    </div>
  );
}
