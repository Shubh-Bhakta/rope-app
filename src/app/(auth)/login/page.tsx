"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    loginUser(email);
    router.replace("/journal");
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-5xl font-bold text-brown tracking-wide mb-3">
            ROPE
          </h1>
          <p className="text-muted text-sm tracking-widest uppercase">
            Revelation. Observation. Prayer. Execution.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Your password"
              required
              className="w-full px-4 py-3 bg-cream border border-brown/20 rounded-xl text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brown/30 focus:border-brown/40 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-brown text-ivory font-semibold rounded-xl hover:bg-brown/90 active:scale-[0.98] transition-all mt-2"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brown font-medium underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </div>

      <p className="absolute bottom-8 text-muted/50 text-xs italic text-center px-6">
        Your word is a lamp to my feet &mdash; Psalm 119:105
      </p>
    </div>
  );
}
