"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Camera, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/api/request";
import { memory } from "@eazo/sdk";

const EMOTIONS = [
  { emoji: "😊", label: "Great" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😟", label: "Worried" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "🤩", label: "Excited" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🤗", label: "Loved" },
];

export function DailyLogScreen() {
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null as any);
  const [emotion, setEmotion] = useState("");
  const [win, setWin] = useState("");
  const [hardMoment, setHardMoment] = useState("");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [naraResponse, setNaraResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    request("/api/children").then((res) => {
      setChildren(res);
      if (res.length > 0) setActiveChild(res[0]);
    });
  }, []);

  const handleSubmit = async () => {
    if (!activeChild) return;
    setLoading(true);
    try {
      const res = await request("/api/logs", {
        method: "POST",
        body: JSON.stringify({ childId: activeChild.id, emotion, win, hardMoment, energyLevel, notes }),
      });
      setNaraResponse(res.naraResponse);
      setSubmitted(true);
      memory.reportAction({
        content: `Parent logged day: win="${win?.substring(0, 50)}"`,
        event_type: "create",
        page: "daily-log",
        metadata: { type: "daily_log", emotion, energy_level: energyLevel },
      }).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-[#FAF7F2] flex flex-col">
      <header className="pt-14 pb-6 px-6 flex items-center gap-4 border-b border-[#EBE4D5]">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/60">
          <ChevronLeft size={20} className="text-[#2C2C2C]" />
        </button>
        <h1 className="font-[family:var(--font-playfair)] text-xl font-bold text-[#2C2C2C]">Daily Log</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              {/* Emotion */}
              <div>
                <p className="text-sm font-medium text-[#2C2C2C] mb-3">One word for today</p>
                <div className="grid grid-cols-5 gap-2">
                  {EMOTIONS.map((e) => (
                    <motion.button
                      key={e.label}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEmotion(e.label)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all ${
                        emotion === e.label ? "border-[#E8836A] bg-[#E8836A]/5" : "border-[#EBE4D5] bg-white"
                      }`}
                    >
                      <span className="text-2xl">{e.emoji}</span>
                      <span className="text-[9px] text-[#C3BDB0]">{e.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Win */}
              <div>
                <p className="text-sm font-medium text-[#2C2C2C] mb-1">One win today</p>
                <p className="text-xs text-[#C3BDB0] mb-2">Even tiny counts</p>
                <textarea
                  className="w-full px-4 py-3 text-sm bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none resize-none"
                  rows={3}
                  placeholder="Tell Nara about one good thing that happened..."
                  value={win}
                  onChange={(e) => setWin(e.target.value)}
                />
              </div>

              {/* Hard moment */}
              <div>
                <p className="text-sm font-medium text-[#2C2C2C] mb-1">One hard moment (optional)</p>
                <textarea
                  className="w-full px-4 py-3 text-sm bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none resize-none"
                  rows={2}
                  placeholder="What was difficult today?"
                  value={hardMoment}
                  onChange={(e) => setHardMoment(e.target.value)}
                />
              </div>

              {/* Parent energy */}
              <div>
                <p className="text-sm font-medium text-[#2C2C2C] mb-3">Your energy level today</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <motion.button
                      key={n}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEnergyLevel(n)}
                      className="flex-1 flex items-center justify-center"
                    >
                      <Star
                        size={28}
                        className="transition-colors"
                        fill={n <= energyLevel ? "#FFD93D" : "none"}
                        stroke={n <= energyLevel ? "#FFD93D" : "#EBE4D5"}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm font-medium text-[#2C2C2C] mb-2">Quick notes (optional)</p>
                <textarea
                  className="w-full px-4 py-3 text-sm bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none resize-none"
                  rows={2}
                  placeholder="Anything else you want to remember..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="response" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center gap-6 py-12">
              <div className="w-20 h-20 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-4xl">N</div>
              <p className="font-[family:var(--font-playfair)] text-xl text-[#2C2C2C] leading-relaxed max-w-xs">{naraResponse}</p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/dashboard")}
                className="px-8 py-4 bg-[#E8836A] text-white rounded-full font-medium"
              >
                Back to home
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!submitted && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#FAF7F2]/90 backdrop-blur-sm border-t border-[#EBE4D5] pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#E8836A] text-white font-medium text-base flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save today's log"}
          </motion.button>
        </div>
      )}
    </div>
  );
}
