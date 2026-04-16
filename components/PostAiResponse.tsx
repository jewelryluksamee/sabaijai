"use client";

import { useEffect, useState } from "react";

type Props = {
  postId: string;
  content: string;
  emotion: string;
  blobColor: string;
  dotColor: string;
};

export default function PostAiResponse({ postId, content, emotion, blobColor, dotColor }: Props) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content, emotion }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setText(data.text ?? null);
      })
      .catch(() => {
        if (!cancelled) setText("ขอบคุณที่เล่าให้ฟังนะ น้องสบายใจกำลังป่วยอยู่ ไว้มาเล่าใหม่นะ! ");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [postId, content, emotion]);

  return (
    <div
      className="rounded-2xl px-5 py-4 space-y-3 border border-black"
      style={{ background: blobColor }}
    >
      <p className="text-sm font-semibold flex items-center gap-2" style={{ color: dotColor + "bb" }}>
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-base shrink-0"
          style={{ background: dotColor + "44" }}
        >
          🤖
        </span>
        ข้อความจากใจ Sabaijai:
      </p>

      {loading ? (
        <div className="pl-9 space-y-2 animate-pulse">
          <div className="h-2.5 w-full rounded-full" style={{ background: dotColor + "33" }} />
          <div className="h-2.5 w-4/5 rounded-full" style={{ background: dotColor + "33" }} />
          <div className="h-2.5 w-2/3 rounded-full" style={{ background: dotColor + "33" }} />
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-[#332b1f] font-light pl-9">
          {text}
        </p>
      )}
    </div>
  );
}
