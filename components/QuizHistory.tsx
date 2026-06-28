"use client";

const CATEGORY_META = [
  { id: "anxiety",    label: "ความเครียด",      labelEn: "Anxiety",    color: "#7c6fe0", bg: "#ede9ff", icon: "psychology" },
  { id: "burnout",    label: "หมดไฟ",           labelEn: "Burnout",    color: "#e07c3a", bg: "#fff0e5", icon: "local_fire_department" },
  { id: "depression", label: "ความเศร้า",        labelEn: "Depression", color: "#4e7cac", bg: "#e5f0ff", icon: "sentiment_very_dissatisfied" },
  { id: "sleep",      label: "การนอน",           labelEn: "Sleep",      color: "#5a8a70", bg: "#e5f5ec", icon: "bedtime" },
  { id: "focus",      label: "สมาธิ",            labelEn: "Focus",      color: "#c0983a", bg: "#fff8e5", icon: "center_focus_strong" },
  { id: "loneliness", label: "ความโดดเดี่ยว",    labelEn: "Loneliness", color: "#9a5a8a", bg: "#f5e5f5", icon: "person_off" },
  { id: "trauma",     label: "บาดแผลทางใจ",      labelEn: "Trauma",     color: "#7a5a40", bg: "#f5ede5", icon: "healing" },
] as const;

function getLevel(score: number) {
  if (score <= 3) return { label: "ต่ำ", color: "#4e7c5f", bg: "#e5f5ec" };
  if (score <= 7) return { label: "ปานกลาง", color: "#c0983a", bg: "#fff8e5" };
  return { label: "สูง", color: "#c00000", bg: "#fff0f0" };
}

export type QuizEntry = {
  id: string;
  takenAt: string;
  scores: Partial<Record<string, number>>;
};

export default function QuizHistory({ entries }: { entries: QuizEntry[] }) {
  return (
    <details className="group/qh" open>
      <summary className="flex items-center justify-between cursor-pointer list-none select-none mb-4">
        <h3 className="text-2xl font-bold [font-family:var(--font-display)] text-[#332b1f]">
          ประวัติแบบทดสอบ
          <span className="ml-2 text-base font-normal text-[#9a8b7a]">({entries.length})</span>
        </h3>
        <span className="material-symbols-outlined text-[#9a8b7a] transition-transform duration-200 group-open/qh:rotate-180">
          expand_more
        </span>
      </summary>

      {entries.length === 0 ? (
        <p className="text-sm text-[#9a8b7a] italic text-center py-8">ยังไม่มีประวัติการทำแบบทดสอบ</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const date = new Date(entry.takenAt);
            const dateStr = date.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short", year: "2-digit" });
            const timeStr = date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

            const topCat = CATEGORY_META.reduce<typeof CATEGORY_META[number] | null>((best, cat) => {
              const s = entry.scores[cat.id] ?? 0;
              const bestS = best ? (entry.scores[best.id] ?? 0) : -1;
              return s > bestS ? cat : best;
            }, null);

            return (
              <details key={entry.id} className="group bg-white rounded-xl shadow-sm overflow-hidden">
                <summary className="flex gap-4 items-center p-5 cursor-pointer list-none select-none">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-sm font-bold text-[#332b1f]" suppressHydrationWarning>
                        {dateStr} · {timeStr}
                      </span>
                      {topCat && (
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm"
                          style={{ backgroundColor: topCat.bg, color: topCat.color }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "11px", fontVariationSettings: "'FILL' 1" }}>
                            {topCat.icon}
                          </span>
                          {topCat.label}สูงสุด
                        </span>
                      )}
                    </div>
                    {/* Mini score dots */}
                    <div className="flex gap-1.5 flex-wrap">
                      {CATEGORY_META.map((cat) => {
                        const score = entry.scores[cat.id] ?? 0;
                        const level = getLevel(score);
                        return (
                          <div
                            key={cat.id}
                            className="w-3 h-3 rounded-full border border-black"
                            style={{ backgroundColor: level.color }}
                            title={`${cat.label}: ${score}/12`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#9a8b7a] shrink-0 transition-transform duration-200 group-open:rotate-180">
                    expand_more
                  </span>
                </summary>

                <div className="px-5 pb-5 pt-4 border-t border-black/10 space-y-2">
                  {CATEGORY_META.map((cat) => {
                    const score = entry.scores[cat.id] ?? 0;
                    const level = getLevel(score);
                    return (
                      <div key={cat.id} className="flex items-center gap-3">
                        <span
                          className="material-symbols-outlined text-base shrink-0"
                          style={{ color: cat.color, fontVariationSettings: "'FILL' 1", fontSize: "16px" }}
                        >
                          {cat.icon}
                        </span>
                        <span className="text-xs text-[#6b5e4d] w-28 shrink-0">{cat.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-black/8 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.round((score / 12) * 100)}%`, backgroundColor: cat.color }}
                          />
                        </div>
                        <span className="text-xs font-bold w-8 text-right" style={{ color: level.color }}>
                          {score}/12
                        </span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full w-16 text-center"
                          style={{ color: level.color, backgroundColor: level.bg }}
                        >
                          {level.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </details>
  );
}
