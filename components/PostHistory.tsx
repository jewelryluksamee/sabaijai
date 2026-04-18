"use client";

import { useState } from "react";
import { type EmotionCategory, emotionChartConfig as emotionConfig, moodColorMap } from "@/lib/emotions";

type PostData = {
  content: string;
  mood: string;
  emotion: EmotionCategory;
  createdAt: string; // serialized as ISO string from server
  aiResponse?: string;
};

type Period = "today" | "month" | "all";
const LABELS: Record<Period, string> = { today: "วันนี้", month: "เดือนนี้", all: "ทั้งหมด" };

export default function PostHistory({ posts }: { posts: PostData[] }) {
  const [period, setPeriod] = useState<Period>("today");

  const now = new Date();
  const filtered = posts.filter((p) => {
    const d = new Date(p.createdAt);
    if (period === "today") {
      return d.toDateString() === now.toDateString();
    }
    if (period === "month") {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 30);
      return d >= cutoff;
    }
    return true;
  });

  return (
    <details className="group/history" open>
      <summary className="flex items-center justify-between cursor-pointer list-none select-none mb-4">
        <h3 className="text-2xl font-bold font-[var(--font-display)] text-[#332b1f]">
          บันทึกย้อนหลัง
          <span className="ml-2 text-base font-normal text-[#9a8b7a]">({filtered.length})</span>
        </h3>
        <span className="material-symbols-outlined text-[#9a8b7a] transition-transform duration-200 group-open/history:rotate-180">
          expand_more
        </span>
      </summary>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["today", "month", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-4 py-1.5 rounded-full text-sm font-bold border border-black transition-colors cursor-pointer"
            style={period === p
              ? { backgroundColor: "#332b1f", color: "#fff" }
              : { backgroundColor: "#fff", color: "#6b5e4d" }}
          >
            {LABELS[p]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[#9a8b7a] italic text-center py-8">ไม่มีบันทึกในช่วงนี้</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => {
            const cfg = emotionConfig[post.emotion];
            const moodInfo = moodColorMap[post.mood] ?? moodColorMap.green;
            const date = new Date(post.createdAt);
            const dateStr = date.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" });
            const timeStr = date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
            return (
              <details
                key={i}
                className="group bg-white rounded-xl border border-black grainy-texture overflow-hidden"
              >
                <summary className="flex gap-4 items-center p-5 cursor-pointer list-none select-none">
                  <div
                    className="w-10 h-10 rounded-full shrink-0 border border-black"
                    style={{ backgroundColor: moodInfo.hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-black"
                        style={{ backgroundColor: cfg.chartColor + "25", color: cfg.color }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "12px", fontVariationSettings: "'FILL' 1" }}>
                          {cfg.icon}
                        </span>
                        {cfg.label}
                      </span>
                      <span className="text-[11px] text-[#9a8b7a]">{dateStr} · {timeStr}</span>
                    </div>
                    <p className="text-sm text-[#332b1f] leading-relaxed">{post.content}</p>
                  </div>
                  <span className="material-symbols-outlined text-[#9a8b7a] shrink-0 transition-transform duration-200 group-open:rotate-180">
                    expand_more
                  </span>
                </summary>

                <div className="px-5 pb-5 space-y-4 border-t border-black/10 pt-4">
                  {post.aiResponse && (
                    <div className="rounded-lg border border-black bg-[#f5eed8] p-4 flex gap-3">
                      <span
                        className="material-symbols-outlined text-[#4e7c5f] shrink-0 mt-0.5"
                        style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}
                      >
                        auto_awesome
                      </span>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#4e7c5f] mb-2">Sabaijai ตอบ</p>
                        <p className="text-sm text-[#6b5e4d] leading-relaxed italic">{post.aiResponse}</p>
                      </div>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </details>
  );
}
