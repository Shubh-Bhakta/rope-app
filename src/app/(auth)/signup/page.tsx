"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setUser } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    setUser(name, email);
    router.replace("/journal");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — visible on md+ */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#3b2f1e] via-[#6b4e2e] to-[#a67c52] flex-col items-center justify-center px-12">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_60%)]" />

        {/* ROPE Acronym */}
        <div className="relative z-10 space-y-6 mb-16">
          {[
            { letter: "R", word: "Revelation" },
            { letter: "O", word: "Observation" },
            { letter: "P", word: "Prayer" },
            { letter: "E", word: "Execution" },
          ].map(({ letter, word }) => (
            <div key={letter} className="flex items-baseline gap-5">
              <span className="font-serif text-6xl font-bold text-ivory/90 leading-none">
                {letter}
              </span>
              <span className="text-ivory/60 text-xl tracking-wide font-light">
                {word}
              </span>
            </div>
          ))}
        </div>

        {/* Scripture */}
        <p className="relative z-10 text-ivory/50 text-sm italic max-w-xs text-center leading-relaxed">
          &ldquo;For I know the plans I have for you, declares the Lord.&rdquo;
          <br />
          <span className="not-italic text-ivory/35">&mdash; Jeremiah 29:11</span>
        </p>
      </div>

      {/* Right Panel — Signup Form */}
      <div className="flex-1 bg-ivory flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="font-serif text-5xl font-bold text-brown tracking-wide mb-3">
              ROPE
            </h1>
            <p className="text-muted text-sm tracking-widest uppercase">
              Begin your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark mb-1.5">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-4 py-3 bg-cream border border-brown/20 rounded-xl text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brown/30 focus:border-brown/40 transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-cream border border-brown/20 rounded-xl text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brown/30 focus:border-brown/40 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                required
                className="w-full px-4 py-3 bg-cream border border-brown/20 rounded-xl text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brown/30 focus:border-brown/40 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brown text-ivory font-semibold rounded-xl hover:bg-brown/90 active:scale-[0.98] transition-all mt-2"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-brown font-medium underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>

        <p className="absolute bottom-8 text-muted/50 text-xs italic text-center px-6 md:static md:mt-12">
          Your word is a lamp to my feet &mdash; Psalm 119:105
        </p>
      </div>
    </div>
  );
}
