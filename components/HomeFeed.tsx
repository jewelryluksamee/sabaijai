"use client";

import { useState } from "react";
import CandleButton from "@/components/CandleButton";
import PostAiResponse from "@/components/PostAiResponse";
import { type EmotionCategory, emotionBadgeConfig as emotionConfig, moodPalette } from "@/lib/emotions";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "เมื่อสักครู่";
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
}

type Post = { id: string; content: string; mood: string; moodLabel: string; candles: number; createdAt: string; emotion?: EmotionCategory; hasProfanity?: boolean };
type Period = "today" | "month" | "all";
const LABELS: Record<Period, string> = { today: "วันนี้", month: "เดือนนี้", all: "ทั้งหมด" };

export default function HomeFeed({ posts }: { posts: Post[] }) {
  const [period, setPeriod] = useState<Period>("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const now = new Date();
  const filtered = posts.filter((p) => {
    const d = new Date(p.createdAt);
    if (period === "today") return d.toDateString() === now.toDateString();
    if (period === "month") { const c = new Date(now); c.setDate(c.getDate() - 30); return d >= c; }
    return true;
  });

  return (
    <section className="max-w-4xl mx-auto mt-12 px-6 space-y-8">
      <div className="flex items-end justify-between border-b-2 border-[#f5eed8] pb-4">
        <h3 className="text-2xl [font-family:var(--font-display)] font-bold text-[#6f624e]">
          ข้อความล่าสุด
        </h3>
        <span className="text-sm text-[#9a8b7a]">
          {filtered.length > 0 ? `${filtered.length} โพสต์` : "ยังไม่มีโพสต์"}
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
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

      <div className="grid grid-cols-1 gap-8">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-black/30">
            <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">
              auto_awesome
            </span>
            <p>ไม่มีโพสต์ในช่วงนี้</p>
          </div>
        )}

        {filtered.map((post) => {
          const colors = moodPalette[post.mood] ?? moodPalette.blue;
          const emotion = (post.emotion ?? "NEUTRAL") as EmotionCategory;
          const sensitive = emotion === "CRITICAL_RISK" || !!post.hasProfanity;
          return (
            <div
              key={post.id}
              className="bg-white rounded-xl p-8 space-y-6 relative overflow-hidden group border border-black shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-[100%] transition-all group-hover:scale-110"
                style={{ backgroundColor: colors.blob }}
              />
              <div className="relative">
                <div className={sensitive && !revealed.has(post.id) ? "blur-md select-none pointer-events-none" : ""}>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors.dot }} />
                      <span className="text-xs text-[#9a8b7a]">{timeAgo(post.createdAt)} • ไม่ระบุตัวตน</span>
                    </div>
                    <span
                      className="self-start flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full border"
                      style={{ background: emotionConfig[emotion].bg, color: emotionConfig[emotion].text, borderColor: emotionConfig[emotion].border }}
                    >
                      <span className="material-symbols-outlined text-sm leading-none" style={{ fontSize: "14px" }}>
                        {emotionConfig[emotion].icon}
                      </span>
                      {emotionConfig[emotion].label}
                    </span>
                  </div>
                  <p className="text-lg leading-relaxed text-[#332b1f] font-light mt-5">
                    &ldquo;{post.content}&rdquo;
                  </p>
                  <div className="mt-6">
                    <PostAiResponse
                      postId={post.id}
                      content={post.content}
                      emotion={emotion}
                      blobColor={colors.blob}
                      dotColor={colors.dot}
                    />
                  </div>
                </div>

                {sensitive && !revealed.has(post.id) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`flex flex-col items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 shadow-[0_4px_20px_rgba(0,0,0,0.1)] text-center ${emotion === "CRITICAL_RISK" ? "border-red-400 shadow-[0_4px_20px_rgba(220,38,38,0.15)]" : "border-amber-400 shadow-[0_4px_20px_rgba(217,119,6,0.15)]"}`}>
                      {emotion === "CRITICAL_RISK" ? (
                        <>
                          <span className="material-symbols-outlined text-red-500" style={{ fontSize: "28px" }}>warning</span>
                          <p className="text-sm font-semibold text-red-600">เนื้อหาที่ละเอียดอ่อน</p>
                          <p className="text-xs text-[#9a8b7a]">โพสต์นี้อาจมีเนื้อหาที่กระทบความรู้สึก</p>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-amber-500" style={{ fontSize: "28px" }}>block</span>
                          <p className="text-sm font-semibold text-amber-700">มีคำหยาบ</p>
                          <p className="text-xs text-[#9a8b7a]">โพสต์นี้มีภาษาที่ไม่เหมาะสม</p>
                        </>
                      )}
                      <button
                        onClick={() => setRevealed((prev) => new Set(prev).add(post.id))}
                        className="mt-1 px-4 py-1.5 rounded-full bg-[#332b1f] text-white text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
                      >
                        กดเพื่อดู
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {emotion === "CRITICAL_RISK" && revealed.has(post.id) && (
                <a
                  href="tel:1323"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white border border-red-700 active:scale-95 transition-transform"
                  style={{ background: "linear-gradient(135deg, #c00000, #e82828)" }}
                >
                  <span className="material-symbols-outlined text-base leading-none" style={{ fontSize: "18px" }}>call</span>
                  โทรกรมสุขภาพจิต · 1323
                </a>
              )}

              <div className="flex justify-end">
                <CandleButton postId={post.id} initialCount={post.candles} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
