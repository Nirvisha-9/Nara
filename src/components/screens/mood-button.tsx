"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { request } from "@/lib/api/request";

type Mood = { emoji: string; label: string; color: string };

export function MoodButton({
  m,
  activeChild,
  selectedMood,
  setSelectedMood,
}: {
  m: Mood;
  activeChild: any;
  selectedMood: string | null;
  setSelectedMood: (s: string | null) => void;
}) {
  const [isLogging, setIsLogging] = useState(false);

  const handleClick = async () => {
    if (isLogging) return;
    setIsLogging(true);
    // optimistic update
    setSelectedMood(m.label);
    try {
      await request("/api/logs", {
        method: "POST",
        body: JSON.stringify({
          childId: activeChild.id,
          childName: activeChild.name,
          emotion: m.label,
        }),
      });
    } catch (err) {
      console.error("Failed to log mood", err);
      // revert optimistic
      setSelectedMood(null);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={handleClick}
      disabled={isLogging}
      className="py-4 px-2 rounded-2xl flex flex-col items-center justify-center border-2 transition-all"
      style={{
        backgroundColor: selectedMood === m.label ? m.color + "22" : "white",
        borderColor: selectedMood === m.label ? m.color : "#EBE4D5",
        boxShadow: selectedMood === m.label ? `0 0 0 2px ${m.color}33` : "none",
        opacity: isLogging ? 0.7 : 1,
        cursor: isLogging ? "progress" : "pointer",
      }}
    >
      <span className="text-2xl mb-1">{m.emoji}</span>
      <span className="text-[11px] font-medium text-[#2C2C2C]">{m.label}</span>
      {selectedMood === m.label && (
        <span className="text-[9px] font-bold mt-1" style={{ color: m.color }}>✓ logged</span>
      )}
    </motion.button>
  );
}
