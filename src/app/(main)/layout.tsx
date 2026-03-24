"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/store";
import BottomNav from "@/components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-muted font-serif text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <main className="pb-24 max-w-lg mx-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
