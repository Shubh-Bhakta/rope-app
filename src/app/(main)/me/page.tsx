"use client";

import { useState, useEffect } from "react";
import { getOrCreateUser, getRopeEntries, type User, type RopeEntry } from "@/lib/store";
import { LampIcon, OliveBranch } from "@/components/Accents";

export default function MePage() {
  const [user, setUserState] = useState<User | null>(null);
  const [entries, setEntries] = useState<RopeEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const u = getOrCreateUser();
    setUserState(u);
    setEntries(getRopeEntries(u.id));
  }, []);

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted font-serif">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-8" style={{ animation: "fadeIn 0.4s ease-out both" }}>
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-brown/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-brown/10 ring-offset-2 ring-offset-ivory">
          <span className="font-serif text-2xl text-brown font-bold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className="font-serif text-2xl text-dark">{user.name}</h1>
        {user.email && <p className="text-muted text-sm">{user.email}</p>}
        <p className="text-muted/60 text-xs mt-1">{user.anonymousAlias}</p>
      </div>

      <div className="mb-8">
        <h2 className="font-serif text-lg text-brown mb-3">Your ROPE Entries</h2>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <LampIcon className="w-10 h-[52px] mb-4" />
            <p className="text-muted text-sm text-center max-w-xs">
              No entries yet. Start your first ROPE journal entry today and begin tracking your spiritual growth.
            </p>
          </div>
        ) : (
          <div className="space-y-2 md:grid md:grid-cols-1 md:gap-3 md:space-y-0">
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className="card-surface rounded-2xl overflow-hidden"
                style={{ animation: "fadeInUp 0.4s ease-out both", animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}
              >
                <button
                  onClick={() =>
                    setExpandedId(expandedId === entry.id ? null : entry.id)
                  }
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div>
                    <p className="text-dark text-sm font-medium">
                      {entry.revelationVerse}
                    </p>
                    <p className="text-muted text-xs">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-muted transition-transform duration-200 ${
                      expandedId === entry.id ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedId === entry.id ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-brown/8 pt-3">
                    {entry.revelationText && (
                      <div>
                        <p className="text-xs text-muted uppercase tracking-wide mb-1">
                          Revelation
                        </p>
                        <p className="text-dark text-sm italic leading-relaxed">
                          &ldquo;{entry.revelationText}&rdquo;
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide mb-1">
                        Observation
                      </p>
                      <p className="text-dark text-sm leading-relaxed">
                        {entry.observation}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide mb-1">
                        Prayer
                      </p>
                      <p className="text-dark text-sm leading-relaxed">
                        {entry.prayer}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide mb-1">
                        Execution
                      </p>
                      <p className="text-dark text-sm leading-relaxed">
                        {entry.execution}
                      </p>
                    </div>
                    {entry.executionStatus && (
                      <div>
                        <p className="text-xs text-muted uppercase tracking-wide mb-1">
                          Check-in
                        </p>
                        <p className="text-dark text-sm">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${
                              entry.executionStatus === "yes"
                                ? "bg-prayer/15 text-prayer"
                                : entry.executionStatus === "partly"
                                ? "bg-praise/15 text-praise"
                                : "bg-struggle/15 text-struggle"
                            }`}
                          >
                            {entry.executionStatus === "yes"
                              ? "Yes"
                              : entry.executionStatus === "partly"
                              ? "Partly"
                              : "Not Yet"}
                          </span>
                        </p>
                        {entry.executionReflection && (
                          <p className="text-dark text-sm leading-relaxed mt-1">
                            {entry.executionReflection}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <OliveBranch className="opacity-30" />
      </div>
    </div>
  );
}
