"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/api/request";
import { memory } from "@eazo/sdk";

const SKILL_AREAS = [
  { emoji: "😤", label: "Emotional Regulation", key: "emotional_regulation" },
  { emoji: "🗣️", label: "Communication", key: "communication" },
  { emoji: "👥", label: "Social Skills", key: "social_skills" },
  { emoji: "🔄", label: "Transitions", key: "transitions" },
  { emoji: "🎯", label: "Daily Life Skills", key: "daily_life_skills" },
  { emoji: "😴", label: "Sleep & Bedtime", key: "sleep" },
  { emoji: "🍽️", label: "Eating & Mealtimes", key: "eating" },
  { emoji: "💪", label: "Confidence", key: "confidence" },
  { emoji: "🏫", label: "School Readiness", key: "school_readiness" },
  { emoji: "😌", label: "Anxiety Management", key: "anxiety_management" },
];

export function TeachMeScreen() {
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null as any);
  const [selectedSkill, setSelectedSkill] = useState(null as any);
  const [plan, setPlan] = useState(null as any);
  const [loading, setLoading] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(0);

  useEffect(() => {
    request("/api/children").then((res) => {
      setChildren(res);
      if (res.length > 0) setActiveChild(res[0]);
    });
  }, []);

  const handleGeneratePlan = async (skill: typeof SKILL_AREAS[0]) => {
    setSelectedSkill(skill);
    setLoading(true);
    try {
      const res = await request("/api/teach", {
        method: "POST",
        body: JSON.stringify({ childId: activeChild.id, skillArea: skill.key, childProfile: activeChild }),
      });
      setPlan(res);
      memory.reportAction({
        content: `Parent started teaching plan for "${skill.label}"`,
        event_type: "create",
        page: "teach-me",
        metadata: { type: "create_teaching_plan", skill_area: skill.key },
      }).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const activities = plan?.planData?.weeks?.flatMap((w: any) => w.activities) || [];
  const activity = activities[currentActivity];

  if (!activeChild) {
    return (
      <div className="min-h-svh bg-[#FAF7F2] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#E8836A]" />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#FAF7F2] flex flex-col">
      {/* Header */}
      <header className="pt-14 pb-6 px-6 flex items-center gap-4 border-b border-[#EBE4D5]">
        <button onClick={plan ? () => { setPlan(null); setSelectedSkill(null); } : () => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/60">
          <ChevronLeft size={20} className="text-[#2C2C2C]" />
        </button>
        <h1 className="font-[family:var(--font-playfair)] text-xl font-bold text-[#2C2C2C]">
          {plan ? selectedSkill?.label : "Teach Me"}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        <AnimatePresence mode="wait">
          {!selectedSkill && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm text-[#C3BDB0] mb-6">Choose a skill area to build with {activeChild.name}</p>
              <div className="grid grid-cols-2 gap-3">
                {SKILL_AREAS.map((skill) => (
                  <motion.button
                    key={skill.key}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleGeneratePlan(skill)}
                    className="p-4 bg-white rounded-2xl border border-[#EBE4D5] flex flex-col items-start gap-2 text-left shadow-sm hover:border-[#E8836A] transition-colors"
                  >
                    <span className="text-2xl">{skill.emoji}</span>
                    <span className="text-sm font-medium text-[#2C2C2C]">{skill.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedSkill && loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-20">
              <div className="w-16 h-16 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-3xl animate-pulse">N</div>
              <p className="text-[#2C2C2C] font-medium text-center">Building a plan for {activeChild.name}...</p>
              <p className="text-sm text-[#C3BDB0] text-center">Using their interests and sensory profile</p>
            </motion.div>
          )}

          {plan && !loading && activity && (
            <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[#C3BDB0]">Activity {currentActivity + 1} of {activities.length}</p>
                <div className="h-2 w-32 bg-[#EBE4D5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E8836A] rounded-full transition-all"
                    style={{ width: `${((currentActivity + 1) / activities.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#EBE4D5] p-5 shadow-sm space-y-5">
                <div>
                  <h2 className="font-[family:var(--font-playfair)] text-xl font-semibold text-[#2C2C2C] mb-1">{activity.title}</h2>
                  <p className="text-xs text-[#C3BDB0]">{activity.duration} • {activity.successLooks}</p>
                </div>

                {activity.steps?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#C3BDB0] mb-2">What to do</p>
                    <ol className="space-y-2">
                      {activity.steps.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[#2C2C2C]">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-[#E8836A]/10 text-[#E8836A] text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {activity.phrases?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#C3BDB0] mb-2">What to say</p>
                    <div className="space-y-2">
                      {activity.phrases.map((p: string, i: number) => (
                        <div key={i} className="bg-[#FAF7F2] rounded-xl p-3 text-sm text-[#2C2C2C] italic">
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activity.materials?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#C3BDB0] mb-2">Materials needed</p>
                    <div className="flex flex-wrap gap-2">
                      {activity.materials.map((m: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-[#FAF7F2] rounded-full text-xs text-[#2C2C2C] border border-[#EBE4D5]">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                {currentActivity > 0 && (
                  <motion.button whileTap={{ scale: 0.98 }} onClick={() => setCurrentActivity(currentActivity - 1)} className="flex-1 py-4 bg-white text-[#2C2C2C] rounded-full border border-[#EBE4D5] font-medium">
                    Previous
                  </motion.button>
                )}
                {currentActivity < activities.length - 1 && (
                  <motion.button whileTap={{ scale: 0.98 }} onClick={() => setCurrentActivity(currentActivity + 1)} className="flex-1 py-4 bg-[#E8836A] text-white rounded-full font-medium flex items-center justify-center gap-2">
                    <span>Next Activity</span>
                    <ChevronRight size={16} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
