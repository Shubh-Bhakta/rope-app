"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, hasPendingCheckin } from "@/lib/store";

const tabs = [
  {
    label: "Journal",
    href: "/journal",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? "1.5" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-brown" : "text-muted"}
      >
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
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? "2.2" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-brown" : "text-muted"}
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    label: "Prayers",
    href: "/prayers",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? "2.2" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-brown" : "text-muted"}
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Insights",
    href: "/insights",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? "2.2" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-brown" : "text-muted"}
      >
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
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? "1.5" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-brown" : "text-muted"}
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [showDot, setShowDot] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) {
      setShowDot(hasPendingCheckin(user.id));
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-brown/8 bg-cream/90 backdrop-blur-md">
      <div className="flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 relative pt-1"
            >
              <div className="relative">
                {tab.icon(isActive)}
                {tab.label === "Check-in" && showDot && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-brown rounded-full" />
                )}
              </div>
              <span
                className={`text-[10px] leading-tight ${
                  isActive
                    ? "text-brown font-semibold"
                    : "text-muted"
                }`}
              >
                {tab.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -bottom-0.5 w-1 h-1 bg-brown rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
