"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle } from "lucide-react";
import { request } from "@/lib/api/request";
import { memory } from "@eazo/sdk";

const CRISIS_TYPES = [
  { emoji: "🌋", label: "Full Meltdown", key: "meltdown" },
  { emoji: "😤", label: "Aggressive Behavior", key: "aggressive" },
  { emoji: "🔇", label: "Silent Shutdown", key: "shutdown" },
  { emoji: "🔊", label: "Sensory Overload", key: "sensory" },
  { emoji: "🚫", label: "Refusing Transition", key: "transition" },
  { emoji: "😰", label: "Extreme Anxiety", key: "anxiety" },
  { emoji: "😴", label: "Bedtime Crisis", key: "bedtime" },
  { emoji: "🏫", label: "School Refusal", key: "school" },
  { emoji: "🍽️", label: "Mealtime Breakdown", key: "mealtime" },
  { emoji: "❓", label: "Something else", key: "other" },
];

const INTENSITY = [
  { value: 1, emoji: "😕", label: "Mild" },
  { value: 2, emoji: "😟", label: "Low" },
  { value: 3, emoji: "😰", label: "Moderate" },
  { value: 4, emoji: "😤", label: "High" },
  { value: 5, emoji: "🌋", label: "Severe" },
];

interface Props {
  childId: string;
  childProfile: any;
  onClose: () => void;
}

export function CrisisModePanel({ childId, childProfile, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [crisisType, setCrisisType] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [guidance, setGuidance] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGetGuidance = async () => {
    setLoading(true);
    setStep(3);
    try {
      const res = await request("/api/crisis", {
        method: "POST",
        body: JSON.stringify({ childId, crisisType, intensity, childProfile }),
      });
      setGuidance(res.guidance);
      memory.reportAction({
        content: `Parent used crisis mode for "${crisisType}" (intensity ${intensity})`,
        event_type: "create",
        page: "crisis-mode",
        metadata: { type: "crisis_event", crisis_type: crisisType, intensity },
      }).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-white rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden top-12"
    >
      {/* Handle */}
      <div className="w-full flex justify-center pt-3 pb-2">
        <div className="w-12 h-1.5 rounded-full bg-[#EBE4D5]" />
      </div>

      {/* Header */}
      <div className="w-full px-6 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8836A] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8836A]">Active Support Companion</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#C3BDB0]">
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <h2 className="font-[family:var(--font-playfair)] text-2xl font-bold text-[#2C2C2C] mb-4">
                What is {childProfile?.name || "your child"} experiencing?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {CRISIS_TYPES.map((c) => (
                  <motion.button
                    key={c.key}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setCrisisType(c.key); setStep(2); }}
                    className="p-3 border-2 border-[#EBE4D5] hover:border-[#E8836A] rounded-2xl flex flex-col items-start gap-2 text-left transition-colors"
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-[13px] font-semibold text-[#2C2C2C]">{c.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <h2 className="font-[family:var(--font-playfair)] text-2xl font-bold text-[#2C2C2C] mb-2">How intense is it?</h2>
              <p className="text-sm text-[#C3BDB0] mb-6">This helps Nara calibrate the right response.</p>
              <div className="flex gap-3 justify-between mb-8">
                {INTENSITY.map((i) => (
                  <motion.button
                    key={i.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIntensity(i.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 flex-1 transition-all ${
                      intensity === i.value ? "border-[#E8836A] bg-[#E8836A]/5" : "border-[#EBE4D5]"
                    }`}
                  >
                    <span className="text-2xl">{i.emoji}</span>
                    <span className="text-[10px] text-[#2C2C2C] font-medium">{i.label}</span>
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleGetGuidance}
                className="w-full py-4 bg-[#E8836A] text-white font-semibold rounded-full text-base"
              >
                Get Guidance Now
              </motion.button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              {loading ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="w-16 h-16 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-3xl animate-pulse">N</div>
                  <p className="text-[#2C2C2C] font-medium">Nara is preparing guidance...</p>
                </div>
              ) : guidance && (
                <div className="flex flex-col gap-6">
                  <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#EBE4D5]">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8FAF8F] flex items-center gap-1.5 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF8F]" />
                      Do this right now
                    </h3>
                    <ul className="space-y-3">
                      {guidance.doNow?.map((step: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[#2C2C2C]">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-[#8FAF8F]/20 text-[#8FAF8F] text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#EBE4D5]">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#E8836A] flex items-center gap-1.5 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E8836A]" />
                      What not to do right now
                    </h3>
                    <ul className="space-y-2">
                      {guidance.doNotDo?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#C3BDB0]">
                          <X size={14} className="text-[#E8836A] mt-1 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#EBE4D5]">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8FAF8F] flex items-center gap-1.5 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF8F]" />
                      After it passes
                    </h3>
                    <ul className="space-y-2">
                      {guidance.afterItPasses?.map((step: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#2C2C2C]">
                          <CheckCircle size={14} className="text-[#8FAF8F] mt-1 shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full py-4 bg-[#2C2C2C] text-white text-[13px] font-semibold rounded-2xl"
                  >
                    Log this episode
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
