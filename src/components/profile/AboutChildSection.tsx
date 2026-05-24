"use client";

import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { DIAGNOSES } from "@/lib/profile-data";

interface AboutChildSectionProps {
  data: {
    name: string;
    dateOfBirth: string;
    gender: string;
    photoUrl: string;
    diagnoses: string[];
  };
  onChange: (field: string, value: any) => void;
}

export function AboutChildSection({ data, onChange }: AboutChildSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#2C2C2C]">About Your Child</h3>
      
      <div className="flex justify-center">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-28 h-28 rounded-full bg-white border-2 border-[#EBE4D5] flex items-center justify-center overflow-hidden"
        >
          {data.photoUrl ? (
            <img src={data.photoUrl} alt="Child" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Camera size={24} className="text-[#C3BDB0]" />
              <span className="text-xs text-[#C3BDB0]">Add photo</span>
            </div>
          )}
        </motion.button>
      </div>

      <div className="space-y-4">
        <input
          className="w-full px-4 py-3 text-base bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none"
          placeholder="Child's name"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
        <input
          className="w-full px-4 py-3 text-base bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none"
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => onChange("dateOfBirth", e.target.value)}
        />
        <select
          className="w-full px-4 py-3 text-base bg-white rounded-xl border border-[#EBE4D5] focus:border-[#E8836A] outline-none"
          value={data.gender}
          onChange={(e) => onChange("gender", e.target.value)}
        >
          <option value="">Gender (optional)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>

      <div>
        <p className="text-sm font-medium text-[#2C2C2C] mb-3">Primary diagnosis or challenge</p>
        <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto">
          {DIAGNOSES.map((d) => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const updated = data.diagnoses.includes(d)
                  ? data.diagnoses.filter((x) => x !== d)
                  : [...data.diagnoses, d];
                onChange("diagnoses", updated);
              }}
              className={`px-3 py-2 rounded-full text-sm transition-all ${
                data.diagnoses.includes(d)
                  ? "bg-[#E8836A] text-white"
                  : "bg-white text-[#2C2C2C] border border-[#EBE4D5]"
              }`}
            >
              {d}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
