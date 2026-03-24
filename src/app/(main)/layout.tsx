"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getOrCreateUser } from "@/lib/store";
import BottomNav from "@/components/BottomNav";

const navItems = [
  {
    label: "Journal",
    href: "/journal",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },
  {
    label: "Check-in",
    href: "/checkin",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    label: "Insights",
    href: "/insights",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Me",
    href: "/me",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Auto-create user if none exists
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

  return (
    <div className="min-h-screen bg-ivory">
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex-col bg-sidebar border-r border-brown/10 z-40">
        {/* Logo area */}
        <div className="px-6 py-8">
          <h1 className="font-serif text-3xl font-bold text-brown tracking-wide">ROPE</h1>
          <p className="text-muted text-xs mt-1 tracking-widest uppercase">Bible Journaling</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cream text-brown shadow-sm"
                    : "text-muted hover:text-brown hover:bg-cream/50"
                }`}
              >
                <span className={isActive ? "text-brown" : "text-muted"}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom scripture */}
        <div className="px-6 py-6">
          <p className="text-muted/40 text-xs italic leading-relaxed">
            Your word is a lamp to my feet
            <br />
            &mdash; Psalm 119:105
          </p>
        </div>
      </aside>

      {/* Main content area */}
      <main className="pb-24 md:pb-8 md:ml-64">
        <div className="max-w-lg mx-auto md:max-w-2xl md:px-4">{children}</div>
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
