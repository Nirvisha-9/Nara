"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Image, Mic, MicOff, Video, ChevronDown } from "lucide-react";
import { request } from "@/lib/api/request";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  images?: string[];
  videoUrl?: string;
  isStreaming?: boolean;
}

interface NaraChatProps {
  childProfile: any;
  mode: "parent" | "child";
  onClose: () => void;
  themeColor?: string;
  isChild?: boolean;
}

export function NaraChat({ childProfile, mode, onClose, themeColor = "#E8836A", isChild = false }: NaraChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: mode === "parent"
        ? `Hi! I'm Nara — your companion for everything to do with ${childProfile?.name || "your child"}. You can talk to me, share photos or videos, ask me anything. I'm here for you. 💛`
        : `HEY ${(childProfile?.name || "friend").toUpperCase()}!! 🎉 I'm Nara, your fun buddy! We can chat, I can see your drawings, and we can play games together! What's up? ${childProfile?.interests?.[0] === "dinosaurs" ? "🦕" : "⭐"}`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [pendingVideo, setPendingVideo] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (textOverride?: string, imagesOverride?: string[]) => {
    const text = textOverride ?? input.trim();
    const images = imagesOverride ?? pendingImages;
    if (!text && !images.length && !pendingVideo) return;

    // If only an image with no text, add a default prompt
    const messageText = text || (images.length > 0 ? "What do you think about this?" : "");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: messageText,
      images: images.length > 0 ? images : undefined,
      videoUrl: pendingVideo || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPendingImages([]);
    setPendingVideo(null);
    setIsLoading(true);

    // Add streaming placeholder
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: "", isStreaming: true }]);

    try {
      const historyForAPI = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
        images: m.images,
        content: m.text,
      }));

      // Build headers — include session token for parent mode
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (mode === "parent") {
        try {
          const { auth } = await import("@eazo/sdk");
          const session = await (auth as any).getSessionHeader?.();
          if (session) headers["x-eazo-session"] = session;
        } catch {}
      }

      const res = await fetch("/api/nara-chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: historyForAPI,
          mode,
          childProfile,
        }),
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.delta) {
              fullText += data.delta;
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, text: fullText, isStreaming: true } : m)
              );
            }
            if (data.done) {
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, text: data.full || fullText, isStreaming: false } : m)
              );
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId
          ? { ...m, text: "Sorry, I had trouble responding. Please try again.", isStreaming: false }
          : m)
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, mode, childProfile, pendingImages, pendingVideo]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPendingImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingVideo(url);
    // Send a message noting the video was shared
    sendMessage("I've shared a video with you. Please help me understand what to do.", []);
    e.target.value = "";
  };

  const toggleVoice = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        // For now, show a placeholder — real speech-to-text would need an API
        setInput((prev) => prev + (prev ? " " : "") + "[Voice message recorded — type your question]");
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setInput("Microphone not available. Please type your message.");
    }
  };

  const bg = isChild ? "#FFFBF0" : "#FAF7F2";
  const headerBg = isChild ? themeColor : "#E8836A";

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: bg }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4 border-b border-[#EBE4D5]"
        style={{ backgroundColor: isChild ? themeColor : "white" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-[family:var(--font-playfair)] italic text-xl"
            style={{ backgroundColor: isChild ? "white" : "#E8836A", color: isChild ? themeColor : "white" }}>
            N
          </div>
          <div>
            <p className={`font-bold text-base ${isChild ? "text-[#2C2C2C] font-black uppercase" : "text-[#2C2C2C]"}`}>
              {isChild ? "NARA 🌟" : "Nara"}
            </p>
            <p className={`text-xs ${isChild ? "text-[#2C2C2C]/70 font-bold" : "text-[#8FAF8F]"}`}>
              {isChild ? "Your fun AI buddy!" : `Your companion for ${childProfile?.name || "your child"}`}
            </p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: isChild ? "white" : "#FAF7F2" }}>
          <X size={18} className="text-[#2C2C2C]" />
        </motion.button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <motion.div key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold italic shrink-0 mt-1"
                style={{ backgroundColor: isChild ? themeColor : "#E8836A",
                  fontFamily: isChild ? "var(--font-nunito)" : "var(--font-playfair)" }}>
                N
              </div>
            )}
            <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              {/* Images preview */}
              {msg.images?.map((img, i) => (
                <img key={i} src={img} alt="shared" className="rounded-2xl max-w-[200px] max-h-[200px] object-cover border-2 border-[#EBE4D5]" />
              ))}
              {msg.text && (
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? isChild
                      ? "text-white font-black border-[3px] border-[#2C2C2C]"
                      : "bg-[#E8836A] text-white"
                    : isChild
                      ? "bg-white border-[3px] border-[#EBE4D5] font-bold text-[#2C2C2C]"
                      : "bg-white border border-[#EBE4D5] text-[#2C2C2C] shadow-sm"
                }`}
                style={msg.role === "user" && isChild ? { backgroundColor: themeColor } : {}}>
                  {msg.text}
                  {msg.isStreaming && (
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1 h-4 ml-1 rounded-full align-middle"
                      style={{ backgroundColor: isChild ? themeColor : "#E8836A" }} />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Pending media preview */}
      {(pendingImages.length > 0 || pendingVideo) && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto border-t border-[#EBE4D5]">
          {pendingImages.map((img, i) => (
            <div key={i} className="relative shrink-0">
              <img src={img} alt="pending" className="w-16 h-16 rounded-xl object-cover border-2 border-[#EBE4D5]" />
              <button onClick={() => setPendingImages((p) => p.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8836A] rounded-full flex items-center justify-center text-white text-xs">×</button>
            </div>
          ))}
          {pendingVideo && (
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-xl bg-[#2C2C2C] flex items-center justify-center text-white text-xs font-bold">📹 Video</div>
              <button onClick={() => setPendingVideo(null)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8836A] rounded-full flex items-center justify-center text-white text-xs">×</button>
            </div>
          )}
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-[#EBE4D5] pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-3"
        style={{ backgroundColor: isChild ? "#FFFBF0" : "white" }}>
        <div className={`flex items-end gap-2 p-2 rounded-2xl border-[${isChild ? "3" : "1"}px]`}
          style={{ backgroundColor: isChild ? "white" : "#FAF7F2",
            border: isChild ? `3px solid #2C2C2C` : `1px solid #EBE4D5` }}>

          {/* Media buttons */}
          <div className="flex gap-1 pb-1">
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#C3BDB0] hover:text-[#E8836A]">
              <Image size={18} />
            </motion.button>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => videoInputRef.current?.click()}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#C3BDB0] hover:text-[#E8836A]">
              <Video size={18} />
            </motion.button>
          </div>

          {/* Text input */}
          <textarea
            className="flex-1 bg-transparent text-[#2C2C2C] text-base outline-none resize-none placeholder:text-[#C3BDB0] leading-relaxed py-1 max-h-28"
            placeholder={isChild ? "Tell me anything! 🌟" : `Ask me about ${childProfile?.name || "your child"}...`}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          {/* Voice button */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggleVoice}
            className="w-8 h-8 rounded-full flex items-center justify-center pb-1"
            style={{ color: isRecording ? "#E8836A" : "#C3BDB0" }}>
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </motion.button>

          {/* Send */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage()}
            disabled={!input.trim() && !pendingImages.length}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-40"
            style={{ backgroundColor: isChild ? themeColor : "#E8836A" }}>
            <Send size={16} />
          </motion.button>
        </div>

        {isRecording && (
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }}
            className="text-center text-xs font-bold mt-2" style={{ color: "#E8836A" }}>
            🔴 Recording… tap mic to stop
          </motion.div>
        )}
      </div>
    </div>
  );
}
