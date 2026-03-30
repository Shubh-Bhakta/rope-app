import { SignIn } from "@clerk/nextjs";
import { OliveBranch } from "@/components/Accents";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-ivory p-6 pt-24 text-center">
      {/* Branding Header */}
      <div className="mb-10 w-full max-w-sm mx-auto">
        <Link href="/" className="inline-block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown/20 rounded-lg p-2">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brown tracking-tighter mb-2 transition-transform group-hover:scale-105">ROPE</h1>
          <div className="flex items-center justify-center gap-2 px-4">
            <div className="h-px flex-1 bg-brown/20" />
            <p className="text-muted text-[10px] uppercase tracking-[0.25em] font-medium whitespace-nowrap">Spiritual Journaling</p>
            <div className="h-px flex-1 bg-brown/20" />
          </div>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto flex justify-center">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border border-brown/10 rounded-2xl bg-ivory",
              headerTitle: "font-serif text-2xl text-brown",
              headerSubtitle: "text-muted",
              socialButtonsBlockButton: "border-brown/10 hover:bg-brown/5",
              formButtonPrimary: "bg-brown hover:bg-brown-light text-ivory transition-all",
              footerActionLink: "text-brown hover:text-brown-light font-medium"
            }
          }}
        />
      </div>

      {/* Decorative Footer */}
      <div className="mt-16 opacity-30">
        <OliveBranch />
      </div>
    </div>
  );
}
