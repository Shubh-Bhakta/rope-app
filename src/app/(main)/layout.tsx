"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getOrCreateUser } from "@/lib/store";
import BottomNav from "@/components/BottomNav";
import { OliveBranch } from "@/components/Accents";

const navItems = [
  {
    label: "Journal",
    href: "/journal",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "1.5" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        {!active && <line x1="8" y1="7" x2="16" y2="7" />}
        {!active && <line x1="8" y1="11" x2="14" y2="11" />}
      </svg>
    ),
  },
  {
    label: "Check-in",
    href: "/checkin",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.2" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    label: "Insights",
    href: "/insights",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.2" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Me",
    href: "/me",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "1.5" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const dailyVerses = [
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "Trust in the Lord with all your heart, and lean not on your own understanding.", ref: "Proverbs 3:5" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged.", ref: "Joshua 1:9" },
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you.", ref: "Jeremiah 29:11" },
  { text: "The Lord is my light and my salvation — whom shall I fear?", ref: "Psalm 27:1" },
  { text: "Come to me, all who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28" },
];

const reflectionPrompts = [
  "What is God teaching you this season?",
  "Where have you seen God at work this week?",
  "What truth is He pressing into your heart?",
  "How is God shaping your character right now?",
  "What promise of God are you standing on today?",
  "Where do you need to trust Him more deeply?",
  "How can you be a light to someone today?",
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getOrCreateUser();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-muted font-serif text-lg">Loading...</p>
      </div>
    );
  }

  const dayIndex = new Date().getDay();
  const todayVerse = dailyVerses[dayIndex];
  const todayPrompt = reflectionPrompts[dayIndex];

  return (
    <div className="min-h-screen bg-ivory">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex-col bg-sidebar border-r border-brown/8 z-40">
        {/* Brand area */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="26" viewBox="0 0 18 26" fill="none" className="text-brown/60 shrink-0">
              <rect x="7" y="0" width="4" height="26" rx="1" fill="currentColor" />
              <rect x="0" y="5.5" width="18" height="4" rx="1" fill="currentColor" />
            </svg>
            <h1 className="font-serif text-3xl font-bold text-brown tracking-wide">ROPE</h1>
          </div>
          <p className="text-muted text-[10px] mt-1.5 tracking-[0.2em] uppercase ml-[30px]">Bible Journaling</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative ${
                  isActive
                    ? "bg-cream-dark/60 text-brown"
                    : "text-muted hover:text-brown hover:bg-cream/50"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brown rounded-r-full" />
                )}
                <span className={isActive ? "text-brown" : "text-muted"}>{item.icon(isActive)}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section with olive branch and scripture */}
        <div className="px-6 py-6 space-y-3">
          <OliveBranch className="mx-auto opacity-60" />
          <p className="text-muted/40 text-xs italic leading-relaxed text-center">
            Your word is a lamp to my feet
            <br />
            &mdash; Psalm 119:105
          </p>
        </div>
      </aside>

      {/* Main content area */}
      <main className="pb-24 md:pb-8 md:ml-64 xl:mr-[280px]">
        <div className="max-w-lg mx-auto md:max-w-2xl md:px-4">{children}</div>
      </main>

      {/* Devotional side rail — xl+ only */}
      <aside className="hidden xl:flex xl:fixed xl:inset-y-0 xl:right-0 xl:w-[280px] xl:flex-col bg-cream-dark/50 border-l border-brown/6 z-40 px-6 py-10">
        <div className="flex-1 flex flex-col">
          {/* Daily Word */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium mb-4">Daily Word</p>
            <div className="border-l-2 border-accent-gold/25 pl-4 py-1">
              <p className="text-dark/70 text-sm italic leading-relaxed">
                &ldquo;{todayVerse.text}&rdquo;
              </p>
              <p className="text-muted text-xs mt-2">&mdash; {todayVerse.ref}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="section-divider mb-8" />

          {/* Reflection prompt */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium mb-4">Reflection</p>
            <p className="text-dark/60 text-sm leading-relaxed font-serif italic">
              {todayPrompt}
            </p>
          </div>

          {/* Olive branch accent at bottom */}
          <div className="mt-auto flex flex-col items-center gap-4">
            <OliveBranch className="opacity-40" />
            <p className="text-muted/30 text-[10px] tracking-[0.15em] uppercase">
              Walk in the light
            </p>
          </div>
        </div>
      </aside>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
