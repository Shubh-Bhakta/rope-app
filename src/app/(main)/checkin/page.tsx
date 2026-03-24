"use client";

import { useState, useEffect } from "react";
import { getOrCreateUser, getYesterdayEntry, updateRopeEntry, type RopeEntry, type ExecutionStatus } from "@/lib/store";

export default function CheckinPage() {
  const [entry, setEntry] = useState<RopeEntry | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<ExecutionStatus>(null);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const user = getOrCreateUser();
    const yesterday = getYesterdayEntry(user.id);
    if (yesterday && yesterday.executionStatus === null) {
      setEntry(yesterday);
    }
    setLoaded(true);
  }, []);

  function handleSave() {
    if (!entry || !status) return;
    updateRopeEntry(entry.id, {
      executionStatus: status,
      executionReflection: reflection.trim(),
    });
    setSaved(true);
  }

  if (!loaded) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted font-serif">Loading...</p>
      </div>
    );
  }

  if (saved) {
    return (
      <div
        className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center"
        style={{ animation: "fadeIn 0.4s ease-out both" }}
      >
        <div className="w-16 h-16 bg-prayer/15 rounded-full flex items-center justify-center mb-5">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-prayer"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-brown mb-2">Check-in Saved</h2>
        <p className="text-muted text-sm max-w-xs">
          Thank you for reflecting honestly. God is at work in you.
        </p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div
        className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center"
        style={{ animation: "fadeIn 0.4s ease-out both" }}
      >
        <p className="text-4xl mb-5">&#x1F54A;</p>
        <h2 className="font-serif text-xl text-brown mb-2">
          You&apos;re all caught up!
        </h2>
        <p className="text-muted text-sm max-w-xs">
          Come back tomorrow after journaling to check in on your execution.
        </p>
        <p className="text-muted/40 text-xs italic mt-12">
          Be doers of the word &mdash; James 1:22
        </p>
      </div>
    );
  }

  const options: {
    value: ExecutionStatus;
    label: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "yes",
      label: "Yes",
      bg: "bg-prayer/10",
      border: "border-prayer/40",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-prayer">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      value: "partly",
      label: "Partly",
      bg: "bg-praise/10",
      border: "border-praise/40",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-praise">
          <path d="M12 2a10 10 0 1 0 0 20" />
          <path d="M12 2v20" />
        </svg>
      ),
    },
    {
      value: "not_yet",
      label: "Not Yet",
      bg: "bg-struggle/10",
      border: "border-struggle/40",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-struggle">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
  ];

  return (
    <div className="px-5 pt-6 pb-8" style={{ animation: "fadeIn 0.4s ease-out both" }}>
      <h1 className="font-serif text-2xl text-brown mb-1">Execution Check-in</h1>
      <p className="text-muted text-sm mb-6">Reflect on yesterday&apos;s commitment</p>

      <div className="bg-cream rounded-2xl p-5 shadow-sm mb-6">
        <p className="text-xs text-muted uppercase tracking-wide mb-2">
          Your commitment
        </p>
        <p className="text-dark leading-relaxed">{entry.execution}</p>
        <p className="text-muted text-xs mt-3">
          From {entry.revelationVerse}
        </p>
      </div>

      <p className="font-serif text-lg text-dark mb-3">Did you live it out?</p>

      {/* Desktop: row, Mobile: row (grid-cols-3 already) */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {options.map((opt, i) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`flex flex-col items-center gap-2 p-4 md:p-6 rounded-2xl border-2 transition-all ${
              status === opt.value
                ? `${opt.bg} ${opt.border} scale-[1.02]`
                : "bg-cream border-transparent"
            }`}
            style={{ animation: "fadeInUp 0.4s ease-out both", animationDelay: `${i * 0.1}s` }}
          >
            {opt.icon}
            <span
              className={`text-sm font-medium ${
                status === opt.value ? "text-dark" : "text-muted"
              }`}
            >
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {status === "not_yet" && (
        <p className="text-muted text-sm italic mb-4 px-1">
          That&apos;s okay. God&apos;s mercies are new every morning. Growth takes time.
        </p>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-dark mb-2">
          How did it go? What did you learn?
        </label>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Write your reflection..."
          rows={4}
          className="w-full px-4 py-3 bg-cream border border-brown/15 rounded-xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brown/20 text-sm leading-relaxed resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!status}
        className="w-full py-3.5 bg-brown text-ivory font-semibold rounded-xl hover:bg-brown/90 active:scale-[0.98] disabled:opacity-40 transition-all"
      >
        Save Check-in
      </button>

      <p className="text-muted/40 text-xs italic text-center mt-8">
        Be doers of the word &mdash; James 1:22
      </p>
    </div>
  );
}
