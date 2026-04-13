"use client";

import { useState } from "react";
import { lightCandle } from "@/app/actions";

export default function CandleButton({
  postId,
  initialCount,
}: {
  postId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [lit, setLit] = useState(false);

  async function handleClick() {
    if (lit) return;
    setLit(true);
    setCount((c) => c + 1);
    await lightCandle(postId);
  }

  return (
    <button
      onClick={handleClick}
      disabled={lit}
      className="flex items-center gap-3 px-6 py-3 rounded-full bg-white text-[#5c4981] hover:bg-[#d6beff]/20 transition-colors disabled:cursor-default"
    >
      <span
        className="material-symbols-outlined text-orange-400"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        candle
      </span>
      <span className="font-semibold">เทียน (Light a Candle)</span>
      <span className="ml-2 text-sm text-[#7e797e]">{count}</span>
    </button>
  );
}
