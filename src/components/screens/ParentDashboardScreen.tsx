"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEazo } from "@eazo/sdk/react";
import { request } from "@/lib/api/request";
import { AlertTriangle, Book, ChevronRight, Heart, MessageCircle } from "lucide-react";
import { NaraChat } from "@/components/chat/NaraChat";
import { MoodButton } from "./mood-button";

export function ParentDashboardScreen() {
  const router = useRouter();
  const user = useEazo((s: any) => s.auth.user);
  const authLoading = useEazo((s: any) => s.auth.loading);
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null as any);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null as string | null);

  useEffect(() => {
    // Redirect unauthenticated users to welcome
    if (!authLoading && !user) {
      router.replace("/");
      return;
    }
    
    // Still loading auth state
    if (authLoading || !user) {
      setLoading(true);
      return;
    }

    // Authenticated — fetch children
    setLoading(true);
    request("/api/children")
      .then((res) => {
        const kids = res;
        setChildren(kids);
        if (kids.length > 0) setActiveChild(kids[0]);
        else router.push("/profile/new");
      })
      .catch((err) => {
        console.error("Failed to fetch children:", err);
        // If there's an auth error, redirect to welcome
        if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
          router.replace("/");
        }
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  // Loading state — skeleton
  if (authLoading || loading) {
    return (
      <div className="min-h-svh bg-[#FAF7F2] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-3xl animate-pulse">N</div>
        <p className="text-sm text-[#C3BDB0]">Getting your home ready…</p>
      </div>
    );
  }

  if (!user || !activeChild) return null;

  const firstName = (user.name ?? user.email ?? "there").split("@")[0];

  return (
    <div className="min-h-svh w-full bg-[#FAF7F2] flex flex-col relative overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-12">
        {/* Header */}
        <header className="pt-14 pb-6 px-6 flex justify-between items-center border-b border-[#EBE4D5]">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => router.push(`/profile/edit/${activeChild.id}`)}
              className="relative group"
              title="Edit child profile"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#EBE4D5] group-hover:border-[#E8836A] flex items-center justify-center bg-white shadow-sm transition-colors">
                <span className="text-2xl">{activeChild.avatarId || "🦒"}</span>
              </div>
              {/* edit pencil badge */}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#E8836A] border-2 border-[#FAF7F2] flex items-center justify-center">
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </motion.button>
            <div className="flex flex-col">
              <h2 className="font-[family:var(--font-playfair)] text-xl font-bold tracking-tight text-[#2C2C2C]">Good morning, {firstName}</h2>
              <p className="text-xs text-[#8FAF8F] font-medium">{activeChild.name} is currently calm</p>
            </div>
          </div>
          {/* Removed stray chevron button in top-right as requested */}
        </header>

        <main className="px-6 py-6 flex flex-col gap-6">
          {/* CRISIS MODE */}
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push("/crisis")}
            className="w-full text-left bg-white border border-[#EBE4D5] rounded-3xl p-5 shadow-sm relative overflow-hidden group hover:border-[#E8836A] transition-colors"
          >
            <div className="absolute -right-6 -bottom-6 text-8xl opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">🌋</div>
            <div className="flex items-start gap-4 position-relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#E8836A]/10 flex items-center justify-center text-[#E8836A] shrink-0 mt-0.5">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-[family:var(--font-playfair)] text-lg text-[#2C2C2C] font-semibold mb-1">Having a hard moment right now?</h3>
                <p className="text-xs text-[#C3BDB0] leading-relaxed">Instant, step-by-step guidance designed specifically for {activeChild.name}&apos;s patterns.</p>
              </div>
            </div>
          </motion.button>

          {/* Quick Mood */}
          <section>
            <h4 className="text-[10px] font-bold tracking-wider uppercase text-[#C3BDB0] mb-3">How is {activeChild.name}&apos;s day going?</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: "😊", label: "Good", color: "#8FAF8F" },
                { emoji: "😐", label: "Mixed", color: "#FFD93D" },
                { emoji: "😟", label: "Hard", color: "#E8836A" },
              ].map((m) => (
                <React.Fragment key={m.label}>
                  <MoodButton
                    m={m}
                    activeChild={activeChild}
                    selectedMood={selectedMood}
                    setSelectedMood={setSelectedMood}
                  />
                </React.Fragment>
              ))}
            </div>
            {selectedMood && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[#8FAF8F] text-center mt-2 font-medium"
              >
                {selectedMood === "Good" && `Glad ${activeChild.name} is having a good day 😊`}
                {selectedMood === "Mixed" && `Mixed days happen — you're paying attention 💛`}
                {selectedMood === "Hard" && `Hard days are hard. You're not alone in this 🧡`}
              </motion.p>
            )}
          </section>

          {/* Teach Me */}
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push("/teach")}
            className="w-full text-left bg-white border border-[#EBE4D5] rounded-3xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-[family:var(--font-playfair)] text-base font-semibold flex items-center gap-2">
                <Book size={16} className="text-[#E8836A]" />
                Teach Me
              </h4>
              <span className="text-[9px] uppercase tracking-wider bg-[#FAF7F2] text-[#8FAF8F] px-2 py-1 rounded-full font-bold">Week 1</span>
            </div>
            <p className="text-[13px] text-[#C3BDB0] leading-relaxed mb-4">Start building skills with {activeChild.name} using their interests.</p>
            <div className="w-full py-3 bg-[#FAF7F2] rounded-xl border border-[#EBE4D5] text-xs font-semibold text-[#2C2C2C] flex justify-between items-center px-4">
              <span>Explore teaching plans</span>
              <ChevronRight size={14} />
            </div>
          </motion.button>

          {/* Daily Log */}
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push("/log")}
            className="w-full text-left bg-white border border-[#EBE4D5] rounded-3xl p-5 shadow-sm"
          >
            <h4 className="font-[family:var(--font-playfair)] text-base font-semibold mb-1">Daily Log</h4>
            <p className="text-xs text-[#C3BDB0]">Track today&apos;s moments and wins</p>
          </motion.button>

          {/* For You */}
          <section className="bg-[#E8836A]/5 border border-[#EBE4D5] rounded-3xl p-5">
            <h4 className="font-[family:var(--font-playfair)] text-base font-semibold mb-1 text-[#E8836A] flex items-center gap-2">
              <Heart size={16} fill="currentColor" />
              For You
            </h4>
            <p className="text-xs text-[#8FAF8F] mb-4">How are you feeling today — honestly?</p>
            <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar">
              {["Okay", "Tired", "Struggling"].map((s) => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/for-you")}
                  className="px-4 py-2 shrink-0 bg-white rounded-full border border-[#EBE4D5] text-[11px] font-medium text-[#2C2C2C] shadow-sm"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* Floating Nara Chat button */}
      <AnimatePresence>
        {!showChat && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChat(true)}
            className="fixed bottom-8 right-6 z-40 w-16 h-16 rounded-full bg-[#E8836A] text-white shadow-lg flex items-center justify-center"
            style={{ boxShadow: "0 4px 20px rgba(232,131,106,0.5)" }}
          >
            <MessageCircle size={26} fill="white" stroke="none" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Nara Chat panel */}
      <AnimatePresence>
        {showChat && (
          <NaraChat
            childProfile={activeChild}
            mode="parent"
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
