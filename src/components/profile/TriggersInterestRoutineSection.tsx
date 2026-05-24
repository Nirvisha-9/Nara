"use client";

import { THERAPIES, SCHOOL_TYPES, HARDEST_TIMES } from "@/lib/profile-data";
import { motion } from "framer-motion";

interface TriggersInterestRoutineProps {
  data: {
    meltdownTriggers: string;
    warningSignsEarly: string;
    warningSignsWorse: string;
    whatHasHelped: string;
    interests: string;
    strengths: string;
    whatLightsUp: string;
    longActivities: string;
    wakeTime: string;
    hardestTimeOfDay: string;
    transitionIssues: string;
    bedtimeRoutine: string;
    recentChanges: string;
    attendsSchool: boolean | null;
    schoolType: string;
    hasIep: boolean | null;
    therapies: string[];
    schoolNotes: string;
  };
  onChange: (field: string, value: any) => void;
}

function TextareaField({ label, placeholder, value, field, onChange, rows = 3 }: { label: string; placeholder: string; value: string; field: string; onChange: (f: string, v: any) => void; rows?: number }) {
  return (
    <div>
      <p className="text-sm font-medium text-[#2C2C2C] mb-2">{label}</p>
      <textarea
        className="w-full px-4 py-3 text-sm bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none resize-none"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
      />
    </div>
  );
}

function ChipSelect({ label, options, value, field, onChange }: { label: string; options: string[]; value: string; field: string; onChange: (f: string, v: any) => void }) {
  return (
    <div>
      <p className="text-sm font-medium text-[#2C2C2C] mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <motion.button
            key={o}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(field, o)}
            className={`px-3 py-2 rounded-full text-sm transition-all ${
              value === o ? "bg-[#E8836A] text-white" : "bg-white text-[#2C2C2C] border border-[#EBE4D5]"
            }`}
          >
            {o}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function TriggersInterestRoutineSection({ data, onChange }: TriggersInterestRoutineProps) {
  return (
    <div className="space-y-8">
      {/* Triggers */}
      <div>
        <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Triggers & Warning Signs</h3>
        <div className="space-y-4">
          <TextareaField label="What triggers a meltdown or crisis?" placeholder="Describe the situations or events that lead to difficult moments..." value={data.meltdownTriggers} field="meltdownTriggers" onChange={onChange} />
          <TextareaField label="Early warning signs before it escalates" placeholder="What do you notice before a meltdown begins?" value={data.warningSignsEarly} field="warningSignsEarly" onChange={onChange} />
          <TextareaField label="What makes things worse once it starts?" placeholder="Things to avoid during a meltdown..." value={data.warningSignsWorse} field="warningSignsWorse" onChange={onChange} />
          <TextareaField label="What has helped in the past?" placeholder="Strategies, words, or actions that have worked..." value={data.whatHasHelped} field="whatHasHelped" onChange={onChange} />
        </div>
      </div>

      {/* Interests */}
      <div>
        <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Interests & Strengths</h3>
        <div className="space-y-4">
          <TextareaField label="What does your child absolutely love?" placeholder="Topics, characters, activities, games..." value={data.interests} field="interests" onChange={onChange} />
          <TextareaField label="What are they surprisingly good at?" placeholder="Skills, memory, specific knowledge..." value={data.strengths} field="strengths" onChange={onChange} />
          <TextareaField label="What makes them genuinely light up?" placeholder="Those magical moments of pure joy..." value={data.whatLightsUp} field="whatLightsUp" onChange={onChange} />
          <TextareaField label="What activities can they do for hours?" placeholder="Deep focus areas and special interests..." value={data.longActivities} field="longActivities" onChange={onChange} />
        </div>
      </div>

      {/* Routine */}
      <div>
        <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Daily Routine</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[#2C2C2C] mb-2">Typical wake time</p>
            <input type="time" className="w-full px-4 py-3 text-sm bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none" value={data.wakeTime} onChange={(e) => onChange("wakeTime", e.target.value)} />
          </div>
          <ChipSelect label="Hardest time of day" options={HARDEST_TIMES} value={data.hardestTimeOfDay} field="hardestTimeOfDay" onChange={onChange} />
          <TextareaField label="Transition points that cause problems" placeholder="Getting ready for school, leaving activities, bedtime..." value={data.transitionIssues} field="transitionIssues" onChange={onChange} />
          <TextareaField label="Bedtime routine" placeholder="Describe what happens each night..." value={data.bedtimeRoutine} field="bedtimeRoutine" onChange={onChange} />
          <TextareaField label="Recent major changes in routine?" placeholder="New school, move, new sibling, schedule changes..." value={data.recentChanges} field="recentChanges" onChange={onChange} />
        </div>
      </div>

      {/* School */}
      <div>
        <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">School & Therapy</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[#2C2C2C] mb-2">Does your child attend school?</p>
            <div className="flex gap-2">
              {["Yes", "No"].map((v) => (
                <motion.button key={v} whileTap={{ scale: 0.97 }} onClick={() => onChange("attendsSchool", v === "Yes")} className={`px-6 py-2 rounded-full text-sm transition-all ${data.attendsSchool === (v === "Yes") ? "bg-[#E8836A] text-white" : "bg-white text-[#2C2C2C] border border-[#EBE4D5]"}`}>{v}</motion.button>
              ))}
            </div>
          </div>
          {data.attendsSchool && (
            <ChipSelect label="School type" options={SCHOOL_TYPES} value={data.schoolType} field="schoolType" onChange={onChange} />
          )}
          <div>
            <p className="text-sm font-medium text-[#2C2C2C] mb-2">Do they have an IEP or support plan?</p>
            <div className="flex gap-2">
              {["Yes", "No"].map((v) => (
                <motion.button key={v} whileTap={{ scale: 0.97 }} onClick={() => onChange("hasIep", v === "Yes")} className={`px-6 py-2 rounded-full text-sm transition-all ${data.hasIep === (v === "Yes") ? "bg-[#E8836A] text-white" : "bg-white text-[#2C2C2C] border border-[#EBE4D5]"}`}>{v}</motion.button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C2C2C] mb-2">Current therapies</p>
            <div className="flex flex-wrap gap-2">
              {THERAPIES.map((t) => (
                <motion.button key={t} whileTap={{ scale: 0.97 }} onClick={() => { const updated = data.therapies.includes(t) ? data.therapies.filter((x) => x !== t) : [...data.therapies, t]; onChange("therapies", updated); }} className={`px-3 py-2 rounded-full text-sm transition-all ${data.therapies.includes(t) ? "bg-[#E8836A] text-white" : "bg-white text-[#2C2C2C] border border-[#EBE4D5]"}`}>{t}</motion.button>
              ))}
            </div>
          </div>
          <TextareaField label="What has worked at school or in therapy?" placeholder="Strategies, accommodations, or approaches that have been effective..." value={data.schoolNotes} field="schoolNotes" onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
