"use client";

import { useState } from "react";
import { lightCandle } from "@/app/actions";

const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315];
const SPARK_COLORS = ["#f472b6", "#fb7185", "#e879f9", "#f9a8d4", "#f472b6", "#fb7185", "#e879f9", "#f9a8d4"];

export default function CandleButton({
  postId,
  initialCount,
}: {
  postId: string;
  initialCount: number;
}) {
  const [count, setCount]       = useState(initialCount);
  const [lit, setLit]           = useState(false);
  const [sparking, setSparking] = useState(false);
  const [heart, setHeart]       = useState(false);

  async function handleClick() {
    if (lit) return;
    setSparking(true);
    setHeart(true);
    setLit(true);
    setCount((c) => c + 1);
    await lightCandle(postId);
    setTimeout(() => setSparking(false), 700);
    setTimeout(() => setHeart(false), 900);
  }

  return (
    <div className="relative inline-flex items-center">

      {/* ── Spark burst ── */}
      {sparking && SPARKS.map((angle, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-full w-1.5 h-1.5"
          style={{
            left: "1.6rem",
            top:  "50%",
            backgroundColor: SPARK_COLORS[i],
            ["--angle" as string]: `${angle}deg`,
            animation: `spark-out 0.6s ease-out ${i * 0.03}s forwards`,
          }}
        />
      ))}

      {/* ── Floating heart ── */}
      {heart && (
        <div
          className="absolute pointer-events-none text-orange-400 text-sm select-none"
          style={{
            left: "1.3rem",
            top:  "-4px",
            animation: "heart-float 0.9s ease-out forwards",
          }}
        >
          ♡
        </div>
      )}

      {/* ── Button ── */}
      <button
        onClick={handleClick}
        disabled={lit}
        className={`
          relative flex items-center gap-2.5 px-5 py-2.5 rounded-full border
          transition-all duration-300 select-none
          ${lit
            ? "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200/70"
            : "bg-white border-[#ede8de] hover:border-pink-200 hover:shadow-[0_2px_14px_rgba(244,114,182,0.14)] active:scale-95"
          }
        `}
        style={lit ? { animation: "candle-glow 2.5s ease-in-out infinite" } : {}}
      >
        {/* Heart icon */}
        <span
          className={`material-symbols-outlined text-xl leading-none transition-colors duration-300 ${lit ? "text-pink-400" : "text-pink-300"}`}
          style={{
            fontVariationSettings: lit ? "'FILL' 1" : "'FILL' 0",
            animation: lit ? "flame-flicker 1.4s ease-in-out infinite" : undefined,
          }}
        >
          favorite
        </span>

        {/* Label */}
        <span className={`text-sm font-medium transition-colors duration-300 ${lit ? "text-orange-500" : "text-[#a09888]"}`}>
          {lit ? "ส่งแล้ว 🤍" : "ส่งกำลังใจ 🤍"}
        </span>

        {/* Count bubble */}
        <span
          key={count}
          className={`min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-xs font-bold px-1.5 transition-colors duration-300 ${
            lit ? "bg-orange-100 text-orange-500" : "bg-[#f5f0e8] text-[#a09888]"
          }`}
          style={{ animation: "count-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          {count}
        </span>
      </button>
    </div>
  );
}
