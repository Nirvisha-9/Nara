"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/api/request";
import { memory } from "@eazo/sdk";

const EMOTIONAL_STATES = [
  { key: "okay", emoji: "💚", label: "I'm okay, managing well", color: "#8FAF8F" },
  { key: "tired", emoji: "💛", label: "Tired but holding on", color: "#FFD93D" },
  { key: "struggling", emoji: "🧡", label: "Really struggling today", color: "#E8836A" },
  { key: "overwhelmed", emoji: "❤️", label: "Overwhelmed and exhausted", color: "#E8836A" },
  { key: "notokay", emoji: "🖤", label: "I'm not okay", color: "#2C2C2C" },
];

const SELF_CARE = [
  "Step outside for 5 minutes. Fresh air does something nothing else can.",
  "Make yourself a warm drink and sit somewhere quiet for 5 minutes.",
  "Write down 3 things — small or large — that you did right this week.",
  "Text one person who makes you feel understood.",
  "Put your phone down for 10 minutes and just breathe.",
];

export function ForYouScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(null as any);
  const [naraResponse, setNaraResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const selfCare = SELF_CARE[Math.floor(Math.random() * SELF_CARE.length)];

  const handleSelect = async (state: typeof EMOTIONAL_STATES[0]) => {
    setSelected(state);
    setLoading(true);
    try {
      const res = await request("/api/parent-checkin", {
        method: "POST",
        body: JSON.stringify({ emotionalState: state.key }),
      });
      setNaraResponse(res.naraResponse);
      memory.reportAction({
        content: `Parent checked in feeling: "${state.label}"`,
        event_type: "create",
        page: "for-you",
        metadata: { type: "parent_checkin", emotional_state: state.key },
      }).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const isHeavy = selected?.key === "overwhelmed" || selected?.key === "notokay";

  return (
    <div className="min-h-svh bg-[#FAF7F2] flex flex-col">
      <header className="pt-14 pb-6 px-6 flex items-center gap-4 border-b border-[#EBE4D5]">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/60">
          <ChevronLeft size={20} className="text-[#2C2C2C]" />
        </button>
        <h1 className="font-[family:var(--font-playfair)] text-xl font-bold text-[#2C2C2C]">For You</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-[family:var(--font-playfair)] text-xl text-[#2C2C2C] mb-2">How are you doing today — honestly?</p>
              <p className="text-sm text-[#C3BDB0] mb-8">Nara is listening. There&apos;s no wrong answer.</p>
              <div className="space-y-3">
                {EMOTIONAL_STATES.map((state) => (
                  <motion.button
                    key={state.key}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelect(state)}
                    className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#EBE4D5] shadow-sm hover:border-[#E8836A] transition-colors text-left"
                  >
                    <span className="text-2xl">{state.emoji}</span>
                    <span className="text-sm text-[#2C2C2C]">{state.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="response" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Nara response */}
              <div className="bg-white rounded-3xl border border-[#EBE4D5] p-6 shadow-sm">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-xl shrink-0">N</div>
                  <p className="text-sm text-[#2C2C2C] leading-relaxed">
                    {loading ? "Nara is writing a message for you..." : naraResponse}
                  </p>
                </div>
              </div>

              {/* Self care for heavy days */}
              {isHeavy && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-[#E8836A]/5 rounded-2xl border border-[#EBE4D5] p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[#E8836A] mb-2">5-minute self care</p>
                  <p className="text-sm text-[#2C2C2C]">{selfCare}</p>
                </motion.div>
              )}

              {/* Resources for not okay */}
              {selected.key === "notokay" && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl border border-[#EBE4D5] p-4 shadow-sm"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C3BDB0] mb-3">Caregiver Support Resources</p>
                  <div className="space-y-2 text-sm text-[#E8836A]">
                    <p>• NAMI Helpline: 1-800-950-6264</p>
                    <p>• Crisis Text Line: Text HOME to 741741</p>
                    <p>• Parent Support groups through CHADD, ASA</p>
                  </div>
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelected(null); setNaraResponse(""); }}
                className="w-full py-3 text-sm text-[#C3BDB0] border border-[#EBE4D5] rounded-full"
              >
                Check in again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
