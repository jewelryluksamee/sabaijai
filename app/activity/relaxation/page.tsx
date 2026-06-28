"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const QUESTS = [
  {
    id: "good-things",
    icon: "✨",
    prompt: "ลองหาสิ่งที่ทำให้รู้สึกดี 5 อย่างรอบตัวคุณ",
    placeholder: "เช่น แสงแดดอ่อน ๆ, เสียงเพลง, กลิ่นกาแฟ...",
    color: "#7B6FFF",
    bg: "bg-[#7B6FFF]/8",
    border: "border-[#7B6FFF]/25",
  },
  {
    id: "smile-today",
    icon: "🌻",
    prompt: "วันนี้มีอะไรเล็ก ๆ น้อย ๆ ที่ทำให้คุณยิ้มได้บ้าง?",
    placeholder: "บอกเล่าให้ฟังหน่อย...",
    color: "#C07A3A",
    bg: "bg-[#C07A3A]/8",
    border: "border-[#C07A3A]/25",
  },
  {
    id: "safe-place",
    icon: "🌅",
    prompt: "นึกถึงสถานที่ที่ทำให้คุณรู้สึกสงบและปลอดภัยที่สุด อธิบายให้ฟังหน่อย",
    placeholder: "ที่ไหน? มีอะไรอยู่ที่นั่น? รู้สึกอย่างไร?",
    color: "#4A9BB8",
    bg: "bg-[#4A9BB8]/8",
    border: "border-[#4A9BB8]/25",
  },
  {
    id: "proud-today",
    icon: "💪",
    prompt: "วันนี้คุณทำสิ่งที่ภาคภูมิใจได้อะไรบ้าง ไม่ว่าจะเล็กหรือใหญ่?",
    placeholder: "ไม่ต้องยิ่งใหญ่ก็ได้ แค่ก้าวเล็ก ๆ ก็นับ...",
    color: "#3A7A56",
    bg: "bg-[#3A7A56]/8",
    border: "border-[#3A7A56]/25",
  },
  {
    id: "thank-body",
    icon: "🧘",
    prompt: "ร่างกายของคุณรู้สึกเป็นอย่างไรตอนนี้? มีส่วนไหนที่อยากขอบคุณมันบ้าง?",
    placeholder: "สังเกตร่างกายตั้งแต่หัวจรดเท้า...",
    color: "#9B6FBF",
    bg: "bg-[#9B6FBF]/8",
    border: "border-[#9B6FBF]/25",
  },
  {
    id: "person-love",
    icon: "💜",
    prompt: "นึกถึงคนที่คุณรักหรือห่วงใย เขาทำให้คุณรู้สึกดีอย่างไร?",
    placeholder: "ใคร? ทำไมถึงนึกถึงเขา?",
    color: "#B85B8A",
    bg: "bg-[#B85B8A]/8",
    border: "border-[#B85B8A]/25",
  },
  {
    id: "let-go",
    icon: "🍃",
    prompt: "มีความกังวลอะไรที่คุณพร้อมจะวางลงชั่วคราวในตอนนี้?",
    placeholder: "ลองบอกออกมา แล้ววางมันไว้ตรงนี้ก่อน...",
    color: "#4E9A6D",
    bg: "bg-[#4E9A6D]/8",
    border: "border-[#4E9A6D]/25",
  },
  {
    id: "senses-now",
    icon: "👁️",
    prompt: "ตอนนี้คุณได้ยินอะไร? มองเห็นอะไร? และรู้สึกได้ถึงอะไรที่ผิวกาย?",
    placeholder: "อธิบายสิ่งที่ประสาทสัมผัสได้รับอยู่ตอนนี้...",
    color: "#4A9BB8",
    bg: "bg-[#4A9BB8]/8",
    border: "border-[#4A9BB8]/25",
  },
];

function pickRandom<T>(arr: T[], exclude?: T): T {
  const pool = exclude ? arr.filter((x) => x !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

type Stage = "quest" | "loading" | "reply";

export default function RelaxationPage() {
  const [quest, setQuest] = useState(() => pickRandom(QUESTS));
  const [answer, setAnswer] = useState("");
  const [stage, setStage] = useState<Stage>("quest");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || stage === "loading") return;
    setStage("loading");
    setError("");
    try {
      const res = await fetch("/api/relaxation-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quest: quest.prompt, answer }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReply(data.reply);
      setStage("reply");
    } catch {
      setError("ขออภัย เกิดข้อผิดพลาด ลองใหม่อีกครั้งนะ");
      setStage("quest");
    }
  }, [answer, quest, stage]);

  const handleNewQuest = useCallback(() => {
    setQuest((prev) => pickRandom(QUESTS, prev));
    setAnswer("");
    setReply("");
    setError("");
    setStage("quest");
  }, []);

  return (
    <>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full h-full transition-colors duration-700"
          style={{ background: `radial-gradient(ellipse at 60% 10%, ${quest.color}12 0%, transparent 65%)` }}
        />
      </div>

      <main className="relative z-10 pt-16 px-4 max-w-md mx-auto pb-32 flex flex-col min-h-screen">

        <Link href="/activity" className="flex items-center gap-1 text-[#6B6890] text-sm font-medium mt-4 mb-6 w-fit">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 20" }}>arrow_back</span>
          กลับ
        </Link>

        <h2 className="text-2xl font-extrabold text-[#1E1B3A] mb-1">ทำเควส</h2>
        <p className="text-sm text-[#6B6890] mb-8">ทำเควสสั้น ๆ แล้ว AI จะรับฟังและตอบกลับคุณ</p>

        {/* Quest card */}
        <div className={`rounded-3xl border ${quest.border} ${quest.bg} p-6 mb-6 transition-all duration-300`}>
          <div className="flex items-start gap-3 mb-5">
            <span className="text-3xl">{quest.icon}</span>
            <p className="text-[#1E1B3A] font-semibold text-base leading-snug pt-1">{quest.prompt}</p>
          </div>

          {stage !== "reply" ? (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={quest.placeholder}
              rows={4}
              disabled={stage === "loading"}
              className="w-full bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-3 text-[#1E1B3A] placeholder-[#6B6890]/50 outline-none focus:ring-2 resize-none text-sm transition-all"
              style={{ "--tw-ring-color": `${quest.color}40` } as React.CSSProperties}
              onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${quest.color}40`)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
            />
          ) : (
            /* AI reply bubble */
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: `${quest.color}20` }}>
                  🤍
                </div>
                <span className="text-xs font-semibold" style={{ color: quest.color }}>Sabaijai AI</span>
              </div>
              <p className="text-[#1E1B3A] text-sm leading-relaxed">{reply}</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-xs mb-4 text-center">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          {stage !== "reply" ? (
            <>
              <button
                onClick={handleNewQuest}
                className="flex-1 py-3 rounded-2xl border border-[#E0DBFF] bg-white/60 text-[#6B6890] font-semibold text-sm transition-all hover:bg-white/80 active:scale-95"
              >
                สุ่มเควสใหม่
              </button>
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || stage === "loading"}
                className="flex-1 py-3 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: quest.color }}
              >
                {stage === "loading" ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    กำลังคิด...
                  </>
                ) : (
                  <>
                    ส่งให้ AI อ่าน
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 20" }}>send</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleNewQuest}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: quest.color }}
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 20" }}>shuffle</span>
              เควสถัดไป
            </button>
          )}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-6">
          {QUESTS.map((q) => (
            <div
              key={q.id}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ backgroundColor: q.id === quest.id ? quest.color : "#D1CCEE" }}
            />
          ))}
        </div>

      </main>

      <BottomNav />
    </>
  );
}
