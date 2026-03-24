"use client";

import { useState } from "react";
import { completeOnboarding } from "@/lib/store";

const STEPS = [
  {
    letter: "R",
    title: "Revelation",
    description: "Open your Bible and just read. Don't set a goal. Silence your mind, and let God's Word speak. Wherever you feel Him stop you \u2014 that's your revelation. Write down that verse.",
    icon: "\ud83d\udcd6",
  },
  {
    letter: "O",
    title: "Observation",
    description: "Why did God stop you there? What stood out? Write down what you noticed \u2014 a pattern, a command, a promise, a truth that hit differently today.",
    icon: "\ud83d\udc41\ufe0f",
  },
  {
    letter: "P",
    title: "Prayer",
    description: "Talk to God about what you just read. Be honest. This isn't a formula \u2014 it's a conversation. Tell Him what you're feeling, what you need, what you're grateful for.",
    icon: "\ud83d\ude4f",
  },
  {
    letter: "E",
    title: "Execution",
    description: "Write one specific thing you'll do differently tomorrow because of this verse. Not vague \u2014 specific. Something you can check in on. This is where faith becomes action.",
    icon: "\u26a1",
  },
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      onComplete();
    }
  }

  function handleSkip() {
    completeOnboarding();
    onComplete();
  }

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{
        background: "rgba(10, 8, 4, 0.92)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.3s ease-out both",
      }}
    >
      <div className="max-w-md w-full text-center" style={{ animation: "fadeInUp 0.4s ease-out both" }}>
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === step ? "bg-accent-gold w-6" : i < step ? "bg-accent-gold/50" : "bg-ivory/20"
              }`}
            />
          ))}
        </div>

        {/* Step letter */}
        <div className="w-16 h-16 rounded-full border-2 border-accent-gold/30 flex items-center justify-center mx-auto mb-6">
          <span className="font-serif text-3xl font-bold text-ivory/90">{current.letter}</span>
        </div>

        {/* Title */}
        <h2 className="font-serif text-2xl text-ivory/90 mb-4">{current.title}</h2>

        {/* Description */}
        <p className="text-ivory/50 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
          {current.description}
        </p>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-accent-gold/90 text-[#1a1714] font-medium rounded-xl text-sm hover:bg-accent-gold transition-colors"
          >
            {step < STEPS.length - 1 ? "Next" : "Start Journaling"}
          </button>
          <button
            onClick={handleSkip}
            className="text-ivory/30 text-xs hover:text-ivory/50 transition-colors"
          >
            Skip walkthrough
          </button>
        </div>

        {/* Step counter */}
        <p className="text-ivory/15 text-xs mt-8">
          {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}
