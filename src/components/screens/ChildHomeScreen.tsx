"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChildProfile, INTEREST_OPTIONS, SUPERPOWER_OPTIONS } from "@/components/screens/ChildSignupScreen";
import { NaraChat } from "@/components/chat/NaraChat";

const T: Record<string, { icon: string; color: string; bg: string; acts: { t: string; e: string; s: string[] }[] }> = {
  dinosaurs:{ icon:"🦕",color:"#86EFAC",bg:"#DCFCE7",acts:[{t:"Dino Name Challenge!",e:"🦕",s:["Name 5 dinosaurs!","Which was the BIGGEST?","Draw your favourite!"]},{t:"T-Rex Roar Game",e:"🦖",s:["Stand up and ROAR!","Walk like a T-Rex!","You're a dino explorer!"]},{t:"Dino Fact Hunt",e:"🥚",s:["Find one dino fact today","Tell it to someone","You're a dino scientist!"]}]},
  space:    { icon:"🚀",color:"#C084FC",bg:"#EDE9FE",acts:[{t:"Planet Order Mission",e:"🪐",s:["Name planets in order!","Which is biggest?","Draw the solar system!"]},{t:"Astronaut Training",e:"👨‍🚀",s:["Jump 10 times!","Count backwards from 10!","Launch-ready!"]},{t:"My Constellation",e:"⭐",s:["Draw 5 stars","Connect them into a shape","Name your constellation!"]}]},
  minecraft:{ icon:"⛏️",color:"#FFD93D",bg:"#FFF9C4",acts:[{t:"Dream Build",e:"🏠",s:["Draw your dream house!","What biome?","What do you build first?"]},{t:"Mystery Chest",e:"📦",s:["You find a mystery chest…","Draw what's inside!","Tell someone the story!"]},{t:"Block Counter",e:"🧱",s:["Count blocks you can see","What shapes in the room?","Master builder!"]}]},
  video_games:{icon:"🎮",color:"#FF6B6B",bg:"#FFE5E5",acts:[{t:"Create Your Hero",e:"🦸",s:["Draw your game character!","What are their powers?","Give them a cool name!"]},{t:"Boss Battle Plan",e:"⚔️",s:["You face a final boss!","What 3 items would you bring?","How would you win?"]},{t:"Level Designer",e:"🗺️",s:["Design a game level on paper","Add obstacles + rewards!","You're a game designer!"]}]},
  art:      { icon:"🎨",color:"#E8836A",bg:"#FCEAE5",acts:[{t:"Feelings Drawing",e:"🖌️",s:["How do you feel RIGHT NOW?","Draw it using only colours","No words needed!"]},{t:"One-Minute Masterpiece",e:"⏱️",s:["Set 1 minute on a timer","Draw as much as you can!","It's perfect!"]},{t:"Colour Mixing Magic",e:"🌈",s:["Mix red + blue = ?","Mix yellow + blue = ?","Colour scientist!"]}]},
  music:    { icon:"🎵",color:"#4ECDC4",bg:"#CFFAFE",acts:[{t:"Body Beat Box",e:"🥁",s:["Clap a simple rhythm","Stomp + clap together!","Make up your own beat!"]},{t:"Song About Me",e:"🎤",s:["Think of 3 things you love","Sing them to any tune","You're a songwriter!"]},{t:"Sound Hunt",e:"👂",s:["Close eyes 30 seconds","How many sounds?","Superhero ears!"]}]},
  animals:  { icon:"🐾",color:"#86EFAC",bg:"#DCFCE7",acts:[{t:"Animal Facts Expert",e:"🦁",s:["Pick your fav animal","Name 3 facts!","Draw it in its habitat!"]},{t:"Animal Movement",e:"🐘",s:["Walk like an elephant","Hop like a rabbit!","Swim like a fish!"]},{t:"Dream Pet",e:"🐶",s:["Design your dream pet","Give it a name!","What do you feed it?"]}]},
  superheroes:{icon:"⚡",color:"#C084FC",bg:"#EDE9FE",acts:[{t:"Design Your Hero",e:"🦸",s:["Draw YOUR costume!","What's your superpower?","Who do you save?"]},{t:"Hero Training!",e:"💪",s:["10 jumping jacks!","5 super squats!","Training complete!"]},{t:"Save the Day!",e:"🌍",s:["A monster is coming!","Plan 3 steps to stop it","You saved the world!"]}]},
  default:  { icon:"⭐",color:"#FFD93D",bg:"#FFF8D6",acts:[{t:"My Superpower Story",e:"⚡",s:["What's your #1 superpower?","How would you use it today?","Draw yourself using it!"]},{t:"Gratitude Game",e:"💛",s:["Name 3 things that made you smile","Pick the BEST one!","Tell someone!"]},{t:"Dream Big!",e:"🌈",s:["What do you want to be?","One step toward it?","You've got this!"]}]},
};

const MOODS: Record<string,string> = {
  Happy:"You're shining today! 🌟",Angry:"It's okay to feel angry. Breathe? 🌬️",Sad:"Big feelings are okay. I'm here. 💛",
  Scared:"You are safe. I'm here. 🤗",Okay:"Okay is perfect. You showed up! ⭐",Confused:"Let's figure it out together! 🧩",
  Excited:"That energy is AMAZING! 🎉",Tired:"Rest is brave. Take it slow. 😌",
};

const DEF: ChildProfile = { name:"Friend",age:8,color:{name:"Sky Blue",value:"#4ECDC4",key:"sky",bg:"#E0FAF8"},avatar:{emoji:"🦊",name:"Fox"},interests:["dinosaurs"],superpowers:["creative"] };

export function ChildHomeScreen() {
  const router = useRouter();
  const [p, setP] = useState<ChildProfile>(DEF);
  const [mood, setMood] = useState<string|null>(null);
  const [breath, setBreath] = useState(false);
  const [wins, setWins] = useState<string[]>([]);
  const [showWins, setShowWins] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [bPhase, setBPhase] = useState<"inhale"|"exhale">("inhale");
  const [bCount, setBCount] = useState(0);
  const [newWin, setNewWin] = useState("");
  const [actIdx, setActIdx] = useState<number|null>(null);

  useEffect(() => {
    const s = localStorage.getItem("nara_child_profile");
    if (s) { try { setP(JSON.parse(s)); } catch {} }
    const w = localStorage.getItem("nara_child_wins");
    if (w) { try { setWins(JSON.parse(w)); } catch {} }
  }, []);

  const addWin = (label?: string) => {
    const v = label || newWin.trim();
    if (!v) return;
    const u = [v, ...wins];
    setWins(u);
    localStorage.setItem("nara_child_wins", JSON.stringify(u));
    setNewWin("");
  };

  const interest = p.interests?.[0] || "default";
  const th = T[interest] || T["default"];
  const col = p.color?.value || "#4ECDC4";
  const bg  = p.color?.bg   || "#E0FAF8";
  const av  = p.avatar?.emoji || "🦊";

  return (
    <div className="h-svh w-full flex flex-col font-[family:var(--font-nunito)] overflow-hidden relative" style={{backgroundColor:bg}}>
      {/* bg deco */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[th.icon,"⭐",th.icon,"🌟","✨"].map((ic,i)=>(
          <motion.div key={i} className="absolute text-3xl opacity-10" style={{left:`${[8,78,22,68,45][i]}%`,top:`${[10,8,80,72,45][i]}%`}}
            animate={{rotate:[0,360],scale:[1,1.2,1]}} transition={{duration:5+i*1.5,repeat:Infinity,ease:"linear"}}>{ic}</motion.div>
        ))}
      </div>

      {/* header */}
      <header className="pt-14 pb-3 px-5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <motion.div animate={{rotate:[0,-5,5,0]}} transition={{repeat:Infinity,duration:3}}
            className="w-14 h-14 rounded-full border-[3px] border-[#2C2C2C] flex items-center justify-center text-3xl shadow-[0_4px_0_#2C2C2C]"
            style={{backgroundColor:col}}>{av}</motion.div>
          <div>
            <h2 className="text-2xl font-black text-[#2C2C2C] tracking-wider leading-none uppercase">HEY {p.name.toUpperCase()}!</h2>
            <motion.p animate={{color:[col,"#FF6B6B",col]}} transition={{duration:3,repeat:Infinity}}
              className="text-[11px] font-bold tracking-widest uppercase mt-0.5">{th.icon} {interest.replace("_"," ")} World</motion.p>
          </div>
        </div>
        <motion.button whileTap={{scale:0.95}} onClick={()=>router.push("/")}
          className="px-4 py-2 bg-[#2C2C2C] rounded-2xl text-xs font-black text-white shadow-[0_3px_0_#FF6B6B] flex items-center gap-1 uppercase">
          Exit <X size={13} strokeWidth={3}/>
        </motion.button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 space-y-4 z-10">

        {/* mood */}
        <section className="bg-white border-[3px] border-[#2C2C2C] rounded-[2rem] p-5 shadow-[0_6px_0_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 pointer-events-none">{th.icon}</div>
          <h3 className="text-xl font-black text-[#2C2C2C] uppercase tracking-wide mb-4 text-center">How are you feeling?</h3>
          <AnimatePresence mode="wait">
            {mood ? (
              <motion.div key="r" initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="text-center">
                <p className="text-base font-bold text-[#2C2C2C] mb-3 leading-relaxed">{MOODS[mood]}</p>
                {(mood==="Angry"||mood==="Sad"||mood==="Scared")&&(
                  <motion.button whileTap={{scale:0.95}} onClick={()=>setBreath(true)}
                    className="px-5 py-2 rounded-full font-black text-white border-[3px] border-[#2C2C2C] text-sm mb-2"
                    style={{backgroundColor:col,boxShadow:"0 4px 0px #2C2C2C"}}>Breathe with me 🎈</motion.button>
                )}
                <button onClick={()=>setMood(null)} className="block text-xs text-[#C3BDB0] underline font-bold mt-2 mx-auto">Change</button>
              </motion.div>
            ) : (
              <motion.div key="g" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-4 gap-2">
                {[{e:"😊",l:"Happy"},{e:"😤",l:"Angry"},{e:"😢",l:"Sad"},{e:"😰",l:"Scared"},{e:"😐",l:"Okay"},{e:"😕",l:"Confused"},{e:"🤩",l:"Excited"},{e:"😴",l:"Tired"}].map(m=>(
                  <motion.button key={m.l} whileTap={{scale:0.85}} onClick={()=>setMood(m.l)}
                    className="aspect-square rounded-2xl border-[3px] bg-white flex flex-col items-center justify-center"
                    style={{borderColor:col}}>
                    <span className="text-3xl leading-none">{m.e}</span>
                    <span className="text-[9px] font-black text-[#2C2C2C] mt-1 uppercase">{m.l}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* activities */}
        <section>
          <p className="text-xs font-black text-[#2C2C2C]/50 uppercase mb-2 tracking-wider px-1">{th.icon} {interest.replace("_"," ")} activities — just for you!</p>
          <div className="space-y-3">
            {th.acts.map((act,i)=>(
              <div key={i}>
                <motion.button whileTap={{scale:0.98}} onClick={()=>setActIdx(actIdx===i?null:i)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-[3px] text-left transition-all"
                  style={{backgroundColor:actIdx===i?col:"white",borderColor:actIdx===i?"#2C2C2C":"#EBE4D5",boxShadow:actIdx===i?"0 5px 0px #2C2C2C":"none"}}>
                  <span className="text-3xl shrink-0">{act.e}</span>
                  <div className="flex-1">
                    <p className={`font-black text-sm uppercase tracking-wide ${actIdx===i?"text-white":"text-[#2C2C2C]"}`}>{act.t}</p>
                    <p className={`text-xs font-bold mt-0.5 ${actIdx===i?"text-white/80":"text-[#C3BDB0]"}`}>{act.s.length} steps · tap to start!</p>
                  </div>
                  <span className="text-xl">{actIdx===i?"✅":"▶️"}</span>
                </motion.button>
                <AnimatePresence>
                  {actIdx===i&&(
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                      <div className="mt-2 p-4 rounded-2xl border-[3px] border-[#2C2C2C] bg-white space-y-2" style={{boxShadow:`0 4px 0px ${col}`}}>
                        {act.s.map((step,si)=>(
                          <motion.div key={si} initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:si*0.1}} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{backgroundColor:col}}>{si+1}</span>
                            <p className="text-sm font-bold text-[#2C2C2C]">{step}</p>
                          </motion.div>
                        ))}
                        <motion.button whileTap={{scale:0.95}} onClick={()=>{setActIdx(null);addWin(`Completed: ${act.t}!`);}}
                          className="w-full mt-2 py-3 rounded-2xl font-black text-white border-[3px] border-[#2C2C2C] text-sm uppercase"
                          style={{backgroundColor:col,boxShadow:"0 4px 0px #2C2C2C"}}>
                          I did it! ⭐ Add to my wins
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* interests tags */}
        {(p.interests?.length||0)>1&&(
          <div className="flex gap-2 flex-wrap px-1">
            {p.interests.map(k=>{const item=INTEREST_OPTIONS.find(o=>o.key===k);return item?(
              <div key={k} className="flex items-center gap-1 px-3 py-2 rounded-full border-[2px] border-[#2C2C2C] bg-white text-sm font-black" style={{boxShadow:`0 3px 0px ${col}`}}>
                <span>{item.emoji}</span><span>{item.label}</span>
              </div>):null;})}
          </div>
        )}

        {/* calm corner */}
        <section className="bg-white border-[3px] border-[#2C2C2C] rounded-[2rem] p-4 shadow-[0_5px_0_rgba(0,0,0,0.1)]">
          <h4 className="text-base font-black text-[#2C2C2C] uppercase tracking-wide mb-3">🌬️ Calm Corner</h4>
          <div className="grid grid-cols-3 gap-2">
            {[{emoji:"🎈",label:"Breathing",action:()=>setBreath(true)},{emoji:"⭐",label:"My Wins",action:()=>setShowWins(true)},{emoji:"💬",label:"Talk to Nara",action:()=>setShowChat(true)}].map(item=>(
              <motion.button key={item.label} whileTap={{scale:0.93}} onClick={item.action}
                className="flex flex-col items-center gap-1 p-3 rounded-2xl border-[3px] border-[#EBE4D5] bg-[#FFFBF0] hover:border-[#2C2C2C] transition-all">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[10px] font-black uppercase text-[#2C2C2C]">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* superpowers */}
        {(p.superpowers?.length||0)>0&&(
          <section className="border-[3px] border-[#2C2C2C] rounded-[2rem] p-4" style={{background:`linear-gradient(135deg,${bg},white)`}}>
            <h4 className="text-base font-black text-[#2C2C2C] uppercase mb-3">⚡ My Superpowers</h4>
            <div className="flex flex-wrap gap-2">
              {p.superpowers.map(k=>{const item=SUPERPOWER_OPTIONS.find(o=>o.key===k);return item?(
                <motion.div key={k} animate={{scale:[1,1.05,1]}} transition={{repeat:Infinity,duration:2}}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border-[3px] border-[#2C2C2C] font-black text-sm"
                  style={{backgroundColor:col,boxShadow:`0 4px 0px #2C2C2C`}}>
                  <span>{item.emoji}</span><span>{item.label}</span>
                </motion.div>):null;})}
            </div>
          </section>
        )}
      </div>

      {/* floating chat btn */}
      <AnimatePresence>
        {!showChat&&(
          <motion.button initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} whileTap={{scale:0.9}} onClick={()=>setShowChat(true)}
            className="fixed bottom-6 right-5 z-40 w-16 h-16 rounded-full flex items-center justify-center border-[3px] border-[#2C2C2C] shadow-[0_6px_0px_#2C2C2C]"
            style={{backgroundColor:col}}>
            <span className="text-2xl">💬</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* breathing overlay */}
      <AnimatePresence>
        {breath&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-50" style={{backgroundColor:bg}}>
            <h2 className="text-3xl font-black text-[#2C2C2C] uppercase">Breathe with me</h2>
            <motion.div animate={{scale:bPhase==="inhale"?1.5:0.8,backgroundColor:bPhase==="inhale"?col:"#FF6B6B"}}
              transition={{duration:4,repeat:Infinity,repeatType:"reverse"}}
              onAnimationComplete={()=>{setBPhase(p=>p==="inhale"?"exhale":"inhale");setBCount(c=>c+0.5);}}
              className="w-36 h-36 rounded-full flex items-center justify-center border-[5px] border-[#2C2C2C] shadow-[0_8px_0px_#2C2C2C]">
              <span className="text-6xl">{av}</span>
            </motion.div>
            <p className="text-2xl font-black text-[#2C2C2C] uppercase">{bPhase==="inhale"?"Breathe IN... 🌬️":"Breathe OUT... 😮‍💨"}</p>
            <p className="text-sm font-bold text-[#8FAF8F]">{Math.floor(bCount)} breaths ⭐</p>
            <motion.button whileTap={{scale:0.95}} onClick={()=>setBreath(false)}
              className="px-8 py-4 bg-[#2C2C2C] text-white rounded-full font-black uppercase text-lg"
              style={{boxShadow:`0 6px 0px ${col}`}}>I feel better! 💪</motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* wins overlay */}
      <AnimatePresence>
        {showWins&&(
          <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:25}}
            className="absolute inset-0 flex flex-col z-50 bg-white rounded-t-[2rem] top-12 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBE4D5]">
              <h2 className="text-2xl font-black text-[#2C2C2C] uppercase">⭐ My Wins!</h2>
              <motion.button whileTap={{scale:0.95}} onClick={()=>setShowWins(false)}
                className="w-10 h-10 bg-[#FAF7F2] rounded-full flex items-center justify-center border-2 border-[#EBE4D5]">
                <X size={18} strokeWidth={3}/>
              </motion.button>
            </div>
            <div className="flex gap-2 px-4 py-3 border-b border-[#EBE4D5]">
              <input className="flex-1 px-4 py-2 text-base font-bold bg-[#FAF7F2] rounded-2xl border-[3px] border-[#EBE4D5] outline-none"
                placeholder="Add a win — anything counts!" value={newWin}
                onChange={e=>setNewWin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addWin()} />
              <motion.button whileTap={{scale:0.95}} onClick={()=>addWin()}
                className="px-4 py-2 rounded-2xl font-black text-white border-[3px] border-[#2C2C2C]"
                style={{backgroundColor:col,boxShadow:"0 4px 0px #2C2C2C"}}>Add!</motion.button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {wins.length===0?(
                <div className="text-center py-8"><p className="text-4xl mb-2">🌟</p><p className="font-bold text-[#C3BDB0]">Add your first win!</p></div>
              ):wins.map((w,i)=>(
                <motion.div key={i} initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:i*0.05}}
                  className="flex items-start gap-3 p-3 rounded-2xl border-[3px] border-[#EBE4D5] bg-white"
                  style={{boxShadow:`0 4px 0px ${col}`}}>
                  <span className="text-2xl">⭐</span>
                  <p className="font-bold text-[#2C2C2C] text-sm">{w}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* nara chat */}
      <AnimatePresence>
        {showChat&&(
          <NaraChat childProfile={{...p,name:p.name,interests:p.interests}} mode="child"
            onClose={()=>setShowChat(false)} themeColor={col} isChild={true}/>
        )}
      </AnimatePresence>
    </div>
  );
}
