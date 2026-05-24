"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Star, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/api/request";
import { memory } from "@eazo/sdk";

export function ProgressPatternsScreen() {
  const router = useRouter();
  const [activeChild, setActiveChild] = useState(null as any);
  const [data, setData] = useState(null as any);
  const [loading, setLoading] = useState(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");

  useEffect(() => {
    request("/api/children").then(async (res) => {
      const child = res[0];
      if (!child) { setLoading(false); return; }
      setActiveChild(child);
      const progress = await request(`/api/progress?childId=${child.id}`);
      setData(progress);
      setLoading(false);
    });
  }, []);

  const handleAddMilestone = async () => {
    if (!milestoneTitle || !activeChild) return;
    await request("/api/milestones", {
      method: "POST",
      body: JSON.stringify({ childId: activeChild.id, title: milestoneTitle }),
    });
    memory.reportAction({
      content: `Parent logged milestone: "${milestoneTitle}"`,
      event_type: "create",
      page: "progress",
      metadata: { type: "log_milestone", title: milestoneTitle },
    }).catch(() => {});
    const progress = await request(`/api/progress?childId=${activeChild.id}`);
    setData(progress);
    setMilestoneTitle("");
    setShowMilestoneForm(false);
  };

  return (
    <div className="min-h-svh bg-[#FAF7F2] flex flex-col">
      <header className="pt-14 pb-6 px-6 flex items-center gap-4 border-b border-[#EBE4D5]">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/60">
          <ChevronLeft size={20} className="text-[#2C2C2C]" />
        </button>
        <h1 className="font-[family:var(--font-playfair)] text-xl font-bold text-[#2C2C2C]">Progress & Patterns</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-24">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl skeleton" />)}
          </div>
        ) : !data ? (
          <div className="text-center py-12">
            <p className="text-[#C3BDB0]">Start logging to unlock patterns</p>
          </div>
        ) : (
          <>
            {/* Pattern Intelligence */}
            {data.patterns?.length > 0 && (
              <div>
                <h2 className="font-[family:var(--font-playfair)] text-lg font-semibold text-[#2C2C2C] mb-3">Nara&apos;s Insights</h2>
                <div className="space-y-3">
                  {data.patterns.map((p: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-2xl border border-[#EBE4D5] p-4 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-sm shrink-0">N</div>
                        <p className="text-sm text-[#2C2C2C] leading-relaxed">{p}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Crisis summary */}
            {data.crises?.length > 0 && (
              <div>
                <h2 className="font-[family:var(--font-playfair)] text-lg font-semibold text-[#2C2C2C] mb-3">Crisis Events</h2>
                <div className="bg-white rounded-2xl border border-[#EBE4D5] p-4 shadow-sm">
                  <p className="text-3xl font-bold text-[#E8836A]">{data.crises.length}</p>
                  <p className="text-sm text-[#C3BDB0]">logged this month</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.from(new Set(data.crises.map((c: any) => c.crisisType))).map((type: any) => (
                      <span key={type} className="px-2 py-1 bg-[#FAF7F2] rounded-full text-xs text-[#2C2C2C] border border-[#EBE4D5]">{type}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-[family:var(--font-playfair)] text-lg font-semibold text-[#2C2C2C]">Milestone Wall</h2>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowMilestoneForm(true)} className="w-8 h-8 rounded-full bg-[#E8836A] text-white flex items-center justify-center">
                  <Plus size={16} />
                </motion.button>
              </div>

              {showMilestoneForm && (
                <div className="bg-white rounded-2xl border border-[#EBE4D5] p-4 mb-3 shadow-sm">
                  <input
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] rounded-xl border border-[#EBE4D5] outline-none mb-2"
                    placeholder="e.g. First time used words instead of hitting"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowMilestoneForm(false)} className="flex-1 py-2 text-sm text-[#C3BDB0] border border-[#EBE4D5] rounded-full">Cancel</button>
                    <button onClick={handleAddMilestone} className="flex-1 py-2 text-sm text-white bg-[#E8836A] rounded-full">Save</button>
                  </div>
                </div>
              )}

              {data.milestones?.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#EBE4D5] p-6 text-center shadow-sm">
                  <Star size={32} className="mx-auto text-[#FFD93D] mb-2" />
                  <p className="text-sm text-[#C3BDB0]">Celebrate your first milestone</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.milestones.map((m: any, i: number) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl border border-[#EBE4D5] p-4 shadow-sm flex items-start gap-3"
                    >
                      <Star size={18} className="text-[#FFD93D] mt-0.5 shrink-0" fill="#FFD93D" />
                      <div>
                        <p className="text-sm font-medium text-[#2C2C2C]">{m.title}</p>
                        <p className="text-xs text-[#C3BDB0]">{new Date(m.celebratedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
