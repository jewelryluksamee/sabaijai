"use client";

import { useEffect, useState } from "react";

export default function AiFeedCard() {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    function onListening() {
      setText(null);
      setListening(true);
    }
    function onResponse(e: Event) {
      const detail = (e as CustomEvent<{ text: string }>).detail;
      setListening(false);
      setText(detail.text);
    }

    window.addEventListener("aiListening", onListening);
    window.addEventListener("aiResponse", onResponse);
    return () => {
      window.removeEventListener("aiListening", onListening);
      window.removeEventListener("aiResponse", onResponse);
    };
  }, []);

  if (!listening && !text) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-3 duration-500">
      {/* Label above card */}
      <p className="text-xs font-medium text-[#7c6aaa] flex items-center gap-1.5 mb-3">
        <span className="text-base leading-none">✦</span>
        {listening ? "Sabaijai AI กำลังรับฟังคุณ..." : "Sabaijai AI"}
      </p>

      {/* Card */}
      <div className="rounded-2xl px-5 py-4 space-y-3 border border-black" style={{ background: "rgba(232,226,248,0.55)" }}>
        <p className="text-sm font-semibold text-[#4a3878] flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-base shrink-0"
            style={{ background: "rgba(180,160,230,0.4)" }}
          >
            🤖
          </span>
          ข้อความจากใจ Sabaijai:
        </p>

        {text && (
          <p className="text-sm leading-relaxed text-[#332b1f] font-light pl-9">
            {text}
          </p>
        )}

        {listening && (
          <div className="pl-9 space-y-2 animate-pulse">
            <div className="h-2.5 w-full rounded-full" style={{ background: "rgba(180,160,230,0.35)" }} />
            <div className="h-2.5 w-4/5 rounded-full" style={{ background: "rgba(180,160,230,0.35)" }} />
            <div className="h-2.5 w-2/3 rounded-full" style={{ background: "rgba(180,160,230,0.35)" }} />
          </div>
        )}
      </div>
    </div>
  );
}
