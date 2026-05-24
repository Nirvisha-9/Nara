"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEazo } from "@eazo/sdk/react";
import { auth } from "@eazo/sdk";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const router = useRouter();
  const user = useEazo((s) => s.auth.user);
  const authLoading = useEazo((s) => s.auth.loading);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      setIsLoggingIn(false);
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleParentLogin = async () => {
    setIsLoggingIn(true);
    try {
      await auth.login();
      router.replace("/dashboard");
    } catch {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="h-svh w-full flex flex-col items-center justify-center px-8 bg-[#FAF7F2] relative overflow-hidden">
      {/* subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#2C2C2C 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-20 h-20 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-4xl shadow-md mb-6"
        >
          N
        </motion.div>

        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="font-[family:var(--font-playfair)] text-4xl font-semibold text-[#2C2C2C] mb-3"
        >
          Nara
        </motion.h1>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-sm text-[#C3BDB0] leading-relaxed mb-10 max-w-[240px]"
        >
          Every child is different. Now there&apos;s a guide for yours.
        </motion.p>

        <motion.button
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleParentLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-full bg-[#E8836A] text-white font-medium text-base shadow-sm hover:shadow-md transition-all disabled:opacity-70 mb-4"
        >
          {isLoggingIn ? (
            <><span className="animate-spin inline-block">⏳</span><span>Opening…</span></>
          ) : (
            <><span className="text-lg">🧡</span><span>Sign in / Create account</span></>
          )}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-xs text-[#C3BDB0]"
        >
          For parents, caregivers, teachers &amp; therapists
        </motion.p>
      </div>
    </div>
  );
}
