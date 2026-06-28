"use client";
import { useState } from "react";
import { type EmotionCategory, emotionChartConfig } from "@/lib/emotions";

type Post = { createdAt: string; emotion: EmotionCategory; mood: string };

const THAI_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function getDominantEmotion(posts: Post[], year: number, month: number, day: number): EmotionCategory | null {
  const dayStart = new Date(year, month, day, 0, 0, 0);
  const dayEnd = new Date(year, month, day, 23, 59, 59);
  const filtered = posts.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= dayStart && d <= dayEnd;
  });
  if (filtered.length === 0) return null;
  const counts: Partial<Record<EmotionCategory, number>> = {};
  for (const p of filtered) counts[p.emotion] = (counts[p.emotion] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as EmotionCategory;
}

const LEGEND_EMOTIONS: EmotionCategory[] = ["HAPPY", "SAD", "ANGRY", "ANXIOUS", "BURNOUT", "NEUTRAL"];

export default function MoodCalendar({ posts }: { posts: Post[] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <section className="bg-[#faf7f3] rounded-2xl p-6 border border-black">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold font-[var(--font-display)] text-[#332b1f] leading-tight">
            Mood Calendar
          </h3>
          <p className="text-sm text-[#9a8b7a] mt-0.5">
            {THAI_MONTHS[month]} {year + 543}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="w-9 h-9 rounded-xl border border-black bg-white flex items-center justify-center hover:bg-[#f0ece4] transition-colors active:scale-95"
            aria-label="เดือนก่อน"
          >
            <span className="material-symbols-outlined text-[#332b1f]" style={{ fontSize: "18px" }}>
              chevron_left
            </span>
          </button>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            disabled={isCurrentMonth}
            className="w-9 h-9 rounded-xl border border-black bg-white flex items-center justify-center hover:bg-[#f0ece4] transition-colors active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
            aria-label="เดือนถัดไป"
          >
            <span className="material-symbols-outlined text-[#332b1f]" style={{ fontSize: "18px" }}>
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {THAI_DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-[#b0a090] uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;

          const emotion = getDominantEmotion(posts, year, month, day);
          const cfg = emotion ? emotionChartConfig[emotion] : null;
          const isToday = isCurrentMonth && day === today.getDate();

          return (
            <div
              key={day}
              className="aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 relative transition-transform hover:scale-105"
              style={cfg ? {
                backgroundColor: cfg.chartColor + "38",
                border: `1.5px solid ${cfg.chartColor}70`,
              } : {
                backgroundColor: isToday ? "#eaf3ec" : "#f0ece4",
                border: isToday ? "1.5px solid #4e7c5f50" : "1.5px solid transparent",
              }}
            >
              {cfg ? (
                <>
                  <span
                    className="material-symbols-outlined leading-none"
                    style={{
                      color: cfg.chartColor,
                      fontVariationSettings: "'FILL' 1",
                      fontSize: "18px",
                    }}
                  >
                    {cfg.icon}
                  </span>
                  <span className="text-[9px] font-bold leading-none" style={{ color: cfg.chartColor + "cc" }}>
                    {day}
                  </span>
                </>
              ) : (
                <span className="text-[11px] font-medium" style={{ color: isToday ? "#4e7c5f" : "#c8b8a8" }}>
                  {day}
                </span>
              )}
              {isToday && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4e7c5f]" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5">
        {LEGEND_EMOTIONS.map((emotion) => {
          const cfg = emotionChartConfig[emotion];
          return (
            <div key={emotion} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-md"
                style={{ backgroundColor: cfg.chartColor + "50", border: `1px solid ${cfg.chartColor}80` }}
              />
              <span className="text-[10px] text-[#9a8b7a]">{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
