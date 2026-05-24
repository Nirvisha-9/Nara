"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEazo } from "@eazo/sdk/react";
import { request } from "@/lib/api/request";
import { memory, auth } from "@eazo/sdk";
import { AboutChildSection } from "@/components/profile/AboutChildSection";
import { CommSensorySection } from "@/components/profile/CommSensorySection";
import { TriggersInterestRoutineSection } from "@/components/profile/TriggersInterestRoutineSection";

const SECTIONS = [
  "About Your Child",
  "Communication & Sensory",
  "Triggers, Interests & Routine",
];

const NARA_MESSAGES = [
  "Building your child's guide...",
  "Nara is learning...",
  "Getting to know your child...",
  "Almost ready...",
];

const SECTION_TIPS = [
  "The more you share, the better Nara can help.",
  "This helps Nara understand how your child communicates.",
  "This is what Nara uses to personalize every suggestion.",
];

export function ChildProfileBuilderScreen() {
  const router = useRouter();
  const user = useEazo((s) => s.auth.user);

  const [section, setSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(0);

  const [profile, setProfile] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    photoUrl: "",
    diagnoses: [] as string[],
    communicationStyle: "",
    communicationTools: "",
    helpfulPhrases: "",
    harmfulPhrases: "",
    sensoryOverwhelms: [] as string[],
    sensoryCalms: [] as string[],
    safeSpace: "",
    meltdownTriggers: "",
    warningSignsEarly: "",
    warningSignsWorse: "",
    whatHasHelped: "",
    interests: "",
    strengths: "",
    whatLightsUp: "",
    longActivities: "",
    wakeTime: "",
    hardestTimeOfDay: "",
    transitionIssues: "",
    bedtimeRoutine: "",
    recentChanges: "",
    attendsSchool: null as boolean | null,
    schoolType: "",
    hasIep: null as boolean | null,
    therapies: [] as string[],
    schoolNotes: "",
  });

  const handleChange = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) { auth.login().catch(() => {}); return; }
    if (!profile.name.trim()) {
      alert("Please enter your child's name to continue.");
      return;
    }
    setSaving(true);
    const msgInterval = setInterval(() => setSaveMsg((m) => (m + 1) % NARA_MESSAGES.length), 1200);
    try {
      const res = await request("/api/children", {
        method: "POST",
        body: JSON.stringify(profile),
      });
      memory.reportAction({
        content: `Parent added child profile for "${profile.name}"`,
        event_type: "create",
        page: "profile-builder",
        metadata: { type: "create_child_profile", child_name: profile.name },
      }).catch(() => {});
      clearInterval(msgInterval);
      setSaving(false);
      router.push("/dashboard");
    } catch (err: any) {
      clearInterval(msgInterval);
      setSaving(false);
      console.error("Profile save error:", err);
      alert(`Couldn't save profile — ${err.message || "please try again"}`);
    }
  };

  return (
    <div className="min-h-svh bg-[#FAF7F2] flex flex-col">
      {/* Saving overlay */}
      <AnimatePresence>
        {saving && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white/90 z-50 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-3xl animate-pulse">N</div>
            <p className="text-[#2C2C2C] font-medium text-lg">{NARA_MESSAGES[saveMsg]}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-4">
        <button onClick={() => section === 0 ? router.back() : setSection(section - 1)} className="p-2 -ml-2 rounded-full hover:bg-white/60">
          <ChevronLeft size={20} className="text-[#2C2C2C]" />
        </button>
        <div className="text-center">
          <p className="text-xs text-[#C3BDB0] uppercase tracking-wider">{section + 1} of {SECTIONS.length}</p>
        </div>
        <div className="w-8" />
      </div>

      {/* Progress */}
      <div className="px-6 mb-2">
        <div className="h-1 bg-[#EBE4D5] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#E8836A] rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((section + 1) / SECTIONS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Nara message */}
      <div className="px-6 py-4">
        <div className="flex gap-3 items-start bg-white rounded-2xl p-4 border border-[#EBE4D5]">
          <div className="w-8 h-8 rounded-full bg-[#E8836A] flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-sm shrink-0">N</div>
          <p className="text-sm text-[#2C2C2C]/80 leading-relaxed">{SECTION_TIPS[section]}</p>
        </div>
      </div>

      {/* Section content */}
      <div className="flex-1 px-6 pb-28 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {section === 0 && (
              <AboutChildSection
                data={{ name: profile.name, dateOfBirth: profile.dateOfBirth, gender: profile.gender, photoUrl: profile.photoUrl, diagnoses: profile.diagnoses }}
                onChange={handleChange}
              />
            )}
            {section === 1 && (
              <CommSensorySection
                data={{ communicationStyle: profile.communicationStyle, communicationTools: profile.communicationTools, helpfulPhrases: profile.helpfulPhrases, harmfulPhrases: profile.harmfulPhrases, sensoryOverwhelms: profile.sensoryOverwhelms, sensoryCalms: profile.sensoryCalms, safeSpace: profile.safeSpace }}
                onChange={handleChange}
              />
            )}
            {section === 2 && (
              <TriggersInterestRoutineSection
                data={{ meltdownTriggers: profile.meltdownTriggers, warningSignsEarly: profile.warningSignsEarly, warningSignsWorse: profile.warningSignsWorse, whatHasHelped: profile.whatHasHelped, interests: profile.interests, strengths: profile.strengths, whatLightsUp: profile.whatLightsUp, longActivities: profile.longActivities, wakeTime: profile.wakeTime, hardestTimeOfDay: profile.hardestTimeOfDay, transitionIssues: profile.transitionIssues, bedtimeRoutine: profile.bedtimeRoutine, recentChanges: profile.recentChanges, attendsSchool: profile.attendsSchool, schoolType: profile.schoolType, hasIep: profile.hasIep, therapies: profile.therapies, schoolNotes: profile.schoolNotes }}
                onChange={handleChange}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#FAF7F2]/90 backdrop-blur-sm border-t border-[#EBE4D5] pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={section < SECTIONS.length - 1 ? () => setSection(section + 1) : handleSave}
          className="w-full py-4 rounded-full bg-[#E8836A] text-white font-medium text-base flex items-center justify-center gap-2"
        >
          <span>{section < SECTIONS.length - 1 ? "Continue" : "Save & Complete Profile"}</span>
          {section < SECTIONS.length - 1 && <ChevronRight size={18} />}
        </motion.button>
        <p className="text-center text-xs text-[#C3BDB0] mt-3">You can always add more later</p>
      </div>
    </div>
  );
}
