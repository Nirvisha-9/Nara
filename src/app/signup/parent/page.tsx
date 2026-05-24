"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@eazo/sdk";
import { useEazo } from "@eazo/sdk/react";

// This route is no longer the primary parent signup path.
// The welcome screen handles auth.login() directly.
// This page is kept as a fallback redirect.
export default function ParentSignupRedirect() {
  const router = useRouter();
  const user = useEazo((s) => s.auth.user);
  const authLoading = useEazo((s) => s.auth.loading);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
      return;
    }
    if (!authLoading && !user) {
      // Trigger auth immediately
      auth.login().catch(() => {});
    }
  }, [user, authLoading, router]);

  return (
    <div className="h-svh bg-[#FAF7F2] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-3xl animate-pulse">
        N
      </div>
      <p className="text-sm text-[#C3BDB0]">Opening sign-in…</p>
    </div>
  );
}
