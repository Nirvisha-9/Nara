"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check } from "lucide-react";

export const CHILD_COLORS = [
  { name: "Sky Blue", value: "#4ECDC4", key: "sky", bg: "#E0FAF8" },
  { name: "Yellow", value: "#FFD93D", key: "yellow", bg: "#FFF8D6" },
  { name: "Coral", value: "#FF6B6B", key: "coral", bg: "#FFE5E5" },
  { name: "Orange", value: "#E8836A", key: "orange", bg: "#FCEAE5" },
  { name: "Purple", value: "#C084FC", key: "purple", bg: "#F3E8FF" },
  { name: "Green", value: "#86EFAC", key: "green", bg: "#DCFCE7" },
];

export const CHILD_AVATARS = [
  { emoji: "🦊", name: "Fox" },
  { emoji: "🦖", name: "Dino" },
  { emoji: "🐻", name: "Bear" },
  { emoji: "🐰", name: "Bunny" },
  { emoji: "🐼", name: "Panda" },
  { emoji: "🦁", name: "Lion" },
];

export const INTEREST_OPTIONS = [
  { emoji: "🦕", label: "Dinosaurs", key: "dinosaurs" },
  { emoji: "🚀", label: "Space", key: "space" },
  { emoji: "⛏️", label: "Minecraft", key: "minecraft" },
  { emoji: "🎮", label: "Video Games", key: "video_games" },
  { emoji: "🎨", label: "Drawing & Art", key: "art" },
  { emoji: "🎵", label: "Music", key: "music" },
  { emoji: "🏈", label: "Sports", key: "sports" },
  { emoji: "🐾", label: "Animals", key: "animals" },
  { emoji: "📖", label: "Books & Stories", key: "books" },
  { emoji: "🚗", label: "Cars & Trucks", key: "cars" },
  { emoji: "💃", label: "Dancing", key: "dancing" },
  { emoji: "🌊", label: "Swimming", key: "swimming" },
  { emoji: "⚡", label: "Superheroes", key: "superheroes" },
  { emoji: "🧩", label: "Puzzles", key: "puzzles" },
  { emoji: "🌈", label: "Rainbows", key: "rainbows" },
  { emoji: "🍕", label: "Cooking & Food", key: "cooking" },
];

export const SUPERPOWER_OPTIONS = [
  { emoji: "🧠", label: "Super Memory", key: "memory" },
  { emoji: "🎯", label: "Focus Power", key: "focus" },
  { emoji: "🤸", label: "Moving & Jumping", key: "movement" },
  { emoji: "🎨", label: "Creative Brain", key: "creative" },
  { emoji: "❤️", label: "Big Heart", key: "kind" },
  { emoji: "😂", label: "Funniest Ever", key: "funny" },
  { emoji: "🔍", label: "Notice Everything", key: "observant" },
  { emoji: "🤝", label: "Amazing Helper", key: "helper" },
];

export interface ChildProfile {
  name: string;
  age: number;
  color: typeof CHILD_COLORS[0];
  avatar: typeof CHILD_AVATARS[0];
  interests: string[];
  superpowers: string[];
}

interface ChildSignupScreenProps {
  onBack: () => void;
  onComplete: (profile: ChildProfile) => void;
}

const STEPS = ["name_age", "look", "interests", "superpowers"];

export function ChildSignupScreen({ onBack, onComplete }: ChildSignupScreenProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState(7);
  const [color, setColor] = useState(CHILD_COLORS[0]);
  const [avatar, setAvatar] = useState(CHILD_AVATARS[0]);
  const [interests, setInterests] = useState<string[]>([]);
  const [superpowers, setSuperpowers] = useState<string[]>([]);

  const toggleInterest = (key: string) =>
    setInterests((p) => p.includes(key) ? p.filter((k) => k !== key) : p.length < 5 ? [...p, key] : p);

  const toggleSuperpower = (key: string) =>
    setSuperpowers((p) => p.includes(key) ? p.filter((k) => k !== key) : p.length < 3 ? [...p, key] : p);

  const canNext =
    step === 0 ? name.trim().length > 0 :
    step === 1 ? true :
    step === 2 ? interests.length > 0 :
    superpowers.length > 0;

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete({ name, age, color, avatar, interests, superpowers });
  };

  return (
    <div className="h-svh w-full flex flex-col overflow-hidden font-[family:var(--font-nunito)] relative" style={{ backgroundColor: color.bg }}>
      {/* Floating stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {["10%,15%","85%,20%","20%,75%","75%,80%","50%,10%"].map((pos, i) => (
          <motion.div key={i} className="absolute text-2xl opacity-20"
            style={{ left: pos.split(",")[0], top: pos.split(",")[1] }}
            animate={{ rotate: [0,360], scale:[1,1.2,1] }}
            transition={{ duration: 4+i, repeat: Infinity, ease:"linear" }}>⭐</motion.div>
        ))}
      </div>

      {/* Header */}
      <header className="pt-14 pb-4 px-6 flex justify-between items-center z-10">
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => step === 0 ? onBack() : setStep(step - 1)}
          className="w-12 h-12 rounded-2xl flex items-center justify-center border-[3px] border-[#2C2C2C] bg-white shadow-[0_4px_0px_#2C2C2C]">
          <ChevronLeft size={24} strokeWidth={3} className="text-[#2C2C2C]" />
        </motion.button>
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <motion.div key={i} animate={{ scale: i === step ? 1.3 : 1 }}
              className="w-3 h-3 rounded-full border-2 border-[#2C2C2C]"
              style={{ backgroundColor: i <= step ? color.value : "white" }} />
          ))}
        </div>
        <div className="w-12 h-12 rounded-full border-[3px] border-[#2C2C2C] flex items-center justify-center text-2xl shadow-[0_4px_0px_#2C2C2C]"
          style={{ backgroundColor: color.value }}>{avatar.emoji}</div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32">
        <AnimatePresence mode="wait">

          {step === 0 && (
            <motion.div key="s0" initial={{ x:60,opacity:0 }} animate={{ x:0,opacity:1 }} exit={{ x:-60,opacity:0 }} className="space-y-8">
              <div className="text-center">
                <motion.div animate={{ rotate:[0,10,-10,0] }} transition={{ repeat:Infinity,duration:3 }} className="text-6xl mb-4">👋</motion.div>
                <h1 className="text-4xl font-black text-[#2C2C2C] tracking-wide">What&apos;s your name?</h1>
              </div>
              <input
                className="w-full px-6 py-5 text-3xl font-black text-center text-[#2C2C2C] bg-white rounded-3xl border-[4px] border-[#2C2C2C] shadow-[0_8px_0px_#2C2C2C] focus:shadow-[0_4px_0px_#2C2C2C] focus:translate-y-[4px] outline-none transition-all placeholder:text-[#C3BDB0]"
                placeholder="Your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <div className="text-center">
                <h2 className="text-3xl font-black text-[#2C2C2C] mb-6">How old are you?</h2>
                <div className="flex items-center justify-center gap-6">
                  <motion.button whileTap={{ scale:0.9,y:4 }} onClick={() => setAge(Math.max(3,age-1))}
                    className="w-16 h-16 rounded-3xl bg-white border-[4px] border-[#2C2C2C] text-3xl font-black flex items-center justify-center shadow-[0_6px_0px_#2C2C2C]">−</motion.button>
                  <motion.span key={age} initial={{ scale:1.4,opacity:0 }} animate={{ scale:1,opacity:1 }}
                    className="text-8xl font-black text-[#2C2C2C] w-28 text-center block">{age}</motion.span>
                  <motion.button whileTap={{ scale:0.9,y:4 }} onClick={() => setAge(Math.min(14,age+1))}
                    className="w-16 h-16 rounded-3xl border-[4px] border-[#2C2C2C] text-3xl font-black flex items-center justify-center shadow-[0_6px_0px_#2C2C2C] text-white"
                    style={{ backgroundColor: color.value }}>+</motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ x:60,opacity:0 }} animate={{ x:0,opacity:1 }} exit={{ x:-60,opacity:0 }} className="space-y-8">
              <div className="text-center">
                <motion.div animate={{ scale:[1,1.1,1] }} transition={{ repeat:Infinity,duration:2 }} className="text-6xl mb-3">🎨</motion.div>
                <h1 className="text-3xl font-black text-[#2C2C2C]">Make it yours, {name}!</h1>
              </div>
              <div>
                <p className="text-lg font-black text-[#2C2C2C] mb-3 text-center">Pick your colour</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {CHILD_COLORS.map((c) => (
                    <motion.button key={c.key} whileTap={{ scale:0.9 }} onClick={() => setColor(c)}
                      className="relative w-14 h-14 rounded-full border-[4px] flex items-center justify-center transition-all"
                      style={{ backgroundColor:c.value, borderColor:color.key===c.key?"#2C2C2C":"transparent", boxShadow:color.key===c.key?"0 6px 0px #2C2C2C":"none", transform:color.key===c.key?"scale(1.15)":"scale(1)" }}>
                      {color.key===c.key && <Check size={22} strokeWidth={4} className="text-white"/>}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-lg font-black text-[#2C2C2C] mb-3 text-center">Pick your buddy</p>
                <div className="grid grid-cols-3 gap-3">
                  {CHILD_AVATARS.map((a) => (
                    <motion.button key={a.name} whileTap={{ scale:0.95 }} onClick={() => setAvatar(a)}
                      className="relative aspect-square rounded-3xl bg-white flex flex-col items-center justify-center gap-1 transition-all"
                      style={{ border:avatar.name===a.name?`4px solid #2C2C2C`:"3px solid #EBE4D5", boxShadow:avatar.name===a.name?`0 6px 0px ${color.value}`:"none" }}>
                      <span className="text-4xl">{a.emoji}</span>
                      <span className="text-[10px] font-black text-[#2C2C2C] uppercase">{a.name}</span>
                      {avatar.name===a.name && (
                        <motion.div className="absolute -top-2 -right-2 text-lg" animate={{ rotate:[0,20,-20,0] }} transition={{ repeat:Infinity,duration:1.5 }}>⭐</motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ x:60,opacity:0 }} animate={{ x:0,opacity:1 }} exit={{ x:-60,opacity:0 }} className="space-y-6">
              <div className="text-center">
                <motion.div animate={{ rotate:[0,-10,10,0] }} transition={{ repeat:Infinity,duration:2.5 }} className="text-6xl mb-3">{avatar.emoji}</motion.div>
                <h1 className="text-3xl font-black text-[#2C2C2C]">What do you LOVE?</h1>
                <p className="text-sm font-bold text-[#8FAF8F] mt-1">Pick up to 5 things! {interests.length}/5</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_OPTIONS.map((item) => {
                  const sel = interests.includes(item.key);
                  return (
                    <motion.button key={item.key} whileTap={{ scale:0.95 }} onClick={() => toggleInterest(item.key)}
                      className="flex items-center gap-3 p-4 rounded-2xl border-[3px] transition-all text-left"
                      style={{ backgroundColor:sel?color.value:"white", borderColor:sel?"#2C2C2C":"#EBE4D5", boxShadow:sel?"0 4px 0px #2C2C2C":"none" }}>
                      <span className="text-2xl">{item.emoji}</span>
                      <span className={`text-sm font-black ${sel?"text-white":"text-[#2C2C2C]"}`}>{item.label}</span>
                      {sel && <Check size={16} strokeWidth={3} className="text-white ml-auto shrink-0"/>}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ x:60,opacity:0 }} animate={{ x:0,opacity:1 }} exit={{ x:-60,opacity:0 }} className="space-y-6">
              <div className="text-center">
                <motion.div animate={{ scale:[1,1.2,1] }} transition={{ repeat:Infinity,duration:1.5 }} className="text-6xl mb-3">⚡</motion.div>
                <h1 className="text-3xl font-black text-[#2C2C2C]">Your Superpowers!</h1>
                <p className="text-sm font-bold text-[#8FAF8F] mt-1">What makes you amazingly YOU? Pick 3! {superpowers.length}/3</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SUPERPOWER_OPTIONS.map((item) => {
                  const sel = superpowers.includes(item.key);
                  return (
                    <motion.button key={item.key} whileTap={{ scale:0.95 }} onClick={() => toggleSuperpower(item.key)}
                      className="flex items-center gap-3 p-4 rounded-2xl border-[3px] transition-all text-left"
                      style={{ backgroundColor:sel?color.value:"white", borderColor:sel?"#2C2C2C":"#EBE4D5", boxShadow:sel?"0 4px 0px #2C2C2C":"none" }}>
                      <span className="text-2xl">{item.emoji}</span>
                      <span className={`text-sm font-black ${sel?"text-white":"text-[#2C2C2C]"}`}>{item.label}</span>
                      {sel && <Check size={16} strokeWidth={3} className="text-white ml-auto shrink-0"/>}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-6 left-6 right-6 z-20 pb-[env(safe-area-inset-bottom)] md:pb-0">
        <motion.button whileTap={{ scale:0.97,y:6 }} onClick={handleNext} disabled={!canNext}
          className="w-full flex items-center justify-center gap-2 px-6 py-5 rounded-full text-white text-xl font-black border-[4px] border-[#2C2C2C] tracking-wide uppercase disabled:opacity-40 transition-all"
          style={{ backgroundColor: canNext ? color.value : "#C3BDB0", boxShadow: canNext ? "0 8px 0px #2C2C2C" : "none" }}>
          {step === STEPS.length - 1 ? `Let's Go, ${name}! 🚀` : "Next →"}
        </motion.button>
      </div>
    </div>
  );
}
