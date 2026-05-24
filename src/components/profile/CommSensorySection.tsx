"use client";

import { motion } from "framer-motion";
import { COMMUNICATION_STYLES, SENSORY_OVERWHELMS, SENSORY_CALMS } from "@/lib/profile-data";

interface CommSensoryProps {
  data: {
    communicationStyle: string;
    communicationTools: string;
    helpfulPhrases: string;
    harmfulPhrases: string;
    sensoryOverwhelms: string[];
    sensoryCalms: string[];
    safeSpace: string;
  };
  onChange: (field: string, value: any) => void;
}

export function CommSensorySection({ data, onChange }: CommSensoryProps) {
  return (
    <div className="space-y-8">
      {/* Communication */}
      <div>
        <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Communication Style</h3>
        <div className="flex flex-col gap-2 mb-4">
          {COMMUNICATION_STYLES.map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.99 }}
              onClick={() => onChange("communicationStyle", s)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ${
                data.communicationStyle === s
                  ? "bg-[#E8836A]/10 border-[#E8836A] text-[#E8836A]"
                  : "bg-white border-[#EBE4D5] text-[#2C2C2C]"
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>
        <textarea
          className="w-full px-4 py-3 text-sm bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none resize-none"
          rows={2}
          placeholder="What communication tools do they use? (AAC device, PECS, etc.)"
          value={data.communicationTools}
          onChange={(e) => onChange("communicationTools", e.target.value)}
        />
        <textarea
          className="w-full mt-3 px-4 py-3 text-sm bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none resize-none"
          rows={2}
          placeholder="Phrases or words that work well with them..."
          value={data.helpfulPhrases}
          onChange={(e) => onChange("helpfulPhrases", e.target.value)}
        />
        <textarea
          className="w-full mt-3 px-4 py-3 text-sm bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none resize-none"
          rows={2}
          placeholder="Words or phrases that make things worse..."
          value={data.harmfulPhrases}
          onChange={(e) => onChange("harmfulPhrases", e.target.value)}
        />
      </div>

      {/* Sensory Overwhelms */}
      <div>
        <h3 className="text-lg font-semibold text-[#2C2C2C] mb-1">Sensory Profile</h3>
        <p className="text-sm text-[#C3BDB0] mb-4">What overwhelms your child?</p>
        <div className="grid grid-cols-2 gap-2">
          {SENSORY_OVERWHELMS.map((item) => (
            <motion.button
              key={item.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const updated = data.sensoryOverwhelms.includes(item.label)
                  ? data.sensoryOverwhelms.filter((x) => x !== item.label)
                  : [...data.sensoryOverwhelms, item.label];
                onChange("sensoryOverwhelms", updated);
              }}
              className={`flex items-center gap-2 p-3 rounded-xl text-xs border transition-all text-left ${
                data.sensoryOverwhelms.includes(item.label)
                  ? "bg-[#E8836A]/10 border-[#E8836A]"
                  : "bg-white border-[#EBE4D5]"
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="text-[#2C2C2C] leading-tight">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sensory Calms */}
      <div>
        <p className="text-sm text-[#C3BDB0] mb-4">What calms your child?</p>
        <div className="grid grid-cols-2 gap-2">
          {SENSORY_CALMS.map((item) => (
            <motion.button
              key={item.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const updated = data.sensoryCalms.includes(item.label)
                  ? data.sensoryCalms.filter((x) => x !== item.label)
                  : [...data.sensoryCalms, item.label];
                onChange("sensoryCalms", updated);
              }}
              className={`flex items-center gap-2 p-3 rounded-xl text-xs border transition-all text-left ${
                data.sensoryCalms.includes(item.label)
                  ? "bg-[#8FAF8F]/10 border-[#8FAF8F]"
                  : "bg-white border-[#EBE4D5]"
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="text-[#2C2C2C] leading-tight">{item.label}</span>
            </motion.button>
          ))}
        </div>
        <textarea
          className="w-full mt-4 px-4 py-3 text-sm bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none resize-none"
          rows={2}
          placeholder="Describe their safe space or calm-down spot..."
          value={data.safeSpace}
          onChange={(e) => onChange("safeSpace", e.target.value)}
        />
      </div>
    </div>
  );
}
