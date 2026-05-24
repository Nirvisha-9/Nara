"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEazo } from "@eazo/sdk/react";
import { request } from "@/lib/api/request";
import { memory } from "@eazo/sdk";
import { AboutChildSection } from "@/components/profile/AboutChildSection";
import { CommSensorySection } from "@/components/profile/CommSensorySection";
import { TriggersInterestRoutineSection } from "@/components/profile/TriggersInterestRoutineSection";

const SECTIONS = [
  "About Your Child",
  "Communication & Sensory",
  "Triggers, Interests & Routine",
];

const NARA_MESSAGES = [
  "Updating profile...",
  "Nara is learning...",
  "Saving changes...",
  "Almost done...",
];

export default function EditChildProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const user = useEazo((s) => s.auth.user);
  const [childId, setChildId] = useState<string | null>(null);
  const [section, setSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState(0);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    params.then((p) => setChildId(p.id));
  }, [params]);

  useEffect(() => {
    if (!childId || !user) return;
    setLoading(true);
    request(`/api/children/${childId}`)
      .then((child) => {
        setProfile({
          name: child.name || "",
          dateOfBirth: child.dateOfBirth || "",
          gender: child.gender || "",
          photoUrl: child.photoUrl || "",
          diagnoses: child.diagnoses || [],
          communicationStyle: child.communicationStyle || "",
          communicationTools: child.communicationTools || "",
          helpfulPhrases: child.helpfulPhrases || "",
          harmfulPhrases: child.harmfulPhrases || "",
          sensoryOverwhelms: child.sensoryOverwhelms || [],
          sensoryCalms: child.sensoryCalms || [],
          safeSpace: child.safeSpace || "",
          meltdownTriggers: child.meltdownTriggers || "",
          warningSignsEarly: child.warningSignsEarly || "",
          warningSignsWorse: child.warningSignsWorse || "",
          whatHasHelped: child.whatHasHelped || "",
          interests: child.interests || "",
          strengths: child.strengths || "",
          whatLightsUp: child.whatLightsUp || "",
          longActivities: child.longActivities || "",
          wakeTime: child.wakeTime || "",
          hardestTimeOfDay: child.hardestTimeOfDay || "",
          transitionIssues: child.transitionIssues || "",
          bedtimeRoutine: child.bedtimeRoutine || "",
          recentChanges: child.recentChanges || "",
          attendsSchool: child.attendsSchool,
          schoolType: child.schoolType || "",
          hasIep: child.hasIep,
          therapies: child.therapies || [],
          schoolNotes: child.schoolNotes || "",
        });
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load profile");
        router.back();
      });
  }, [childId, user, router]);

  const handleChange = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile?.name?.trim()) {
      alert("Please enter your child's name.");
      return;
    }
    setSaving(true);
    const msgInterval = setInterval(() => setSaveMsg((m) => (m + 1) % NARA_MESSAGES.length), 1200);
    try {
      await request(`/api/children/${childId}`, {
        method: "PATCH",
        body: JSON.stringify(profile),
      });
      memory.reportAction({
        content: `Parent updated profile for "${profile.name}"`,
        event_type: "update",
        page: "profile-edit",
        metadata: { type: "update_child_profile", child_name: profile.name },
      }).catch(() => {});
      clearInterval(msgInterval);
      setSaving(false);
      router.back();
    } catch (err: any) {
      clearInterval(msgInterval);
      setSaving(false);
      console.error("Profile save error:", err);
      alert(`Couldn't save changes — ${err.message || "please try again"}`);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-svh bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-3xl animate-pulse">N</div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#FAF7F2] flex flex-col">
      {/* Saving overlay */}
      {saving && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-white/90 z-50 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-3xl animate-pulse">N</div>
          <p className="text-[#2C2C2C] font-medium text-lg">{NARA_MESSAGES[saveMsg]}</p>
        </motion.div>
      )}

      {/* Header */}
      <header className="pt-14 pb-4 px-6 flex items-center gap-3 border-b border-[#EBE4D5]">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors">
          <ChevronLeft size={20} className="text-[#2C2C2C]" />
        </motion.button>
        <h1 className="text-lg font-semibold text-[#2C2C2C]">Edit {profile.name}&apos;s Profile</h1>
      </header>

      {/* Section tabs */}
      <div className="flex border-b border-[#EBE4D5] bg-white">
        {SECTIONS.map((s, i) => (
          <button
            key={s}
            onClick={() => setSection(i)}
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              section === i ? "text-[#E8836A] border-b-2 border-[#E8836A]" : "text-[#C3BDB0]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {section === 0 && <AboutChildSection data={profile} onChange={handleChange} />}
        {section === 1 && <CommSensorySection data={profile} onChange={handleChange} />}
        {section === 2 && <TriggersInterestRoutineSection data={profile} onChange={handleChange} />}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white border-t border-[#EBE4D5] pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={section < SECTIONS.length - 1 ? () => setSection(section + 1) : handleSave}
          className="w-full py-4 rounded-full bg-[#E8836A] text-white font-medium text-base flex items-center justify-center gap-2"
        >
          <span>{section < SECTIONS.length - 1 ? "Continue" : "Save Changes"}</span>
          {section < SECTIONS.length - 1 && <ChevronRight size={18} />}
        </motion.button>
      </div>
    </div>
  );
}
