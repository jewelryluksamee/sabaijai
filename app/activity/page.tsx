"use client";

import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const ACTIVITIES = [
  {
    href: "/activity/music",
    icon: "music_note",
    label: "แชร์เพลงฮีลใจ",
    desc: "ส่งต่อบทเพลงที่ปลอบประโลมหัวใจให้ Community",
    gradient: "from-[#7B6FFF]/15 to-[#B8B0FF]/10",
    iconBg: "bg-[#7B6FFF]/15",
    iconColor: "text-[#7B6FFF]",
    accent: "#7B6FFF",
  },
  {
    href: "/activity/breathing",
    icon: "air",
    label: "การหายใจแบบ Grounding",
    desc: "หายใจเพื่อผ่อนคลาย ลดความเครียด คืนสู่ปัจจุบัน",
    gradient: "from-[#5BB8D4]/15 to-[#A8DFF0]/10",
    iconBg: "bg-[#5BB8D4]/15",
    iconColor: "text-[#4A9BB8]",
    accent: "#4A9BB8",
  },
  {
    href: "/activity/meditation",
    icon: "self_improvement",
    label: "สมาธิจับเวลา",
    desc: "นั่งสมาธิพร้อมเสียง Ambient สงบจิตใจ",
    gradient: "from-[#A78BFA]/15 to-[#DDD6FE]/10",
    iconBg: "bg-[#A78BFA]/15",
    iconColor: "text-[#7C5CBF]",
    accent: "#7C5CBF",
  },
  {
    href: "/activity/relaxation",
    icon: "spa",
    label: "ทำเควส",
    desc: "เควสสั้น ๆ ผ่อนคลายจิตใจ พร้อม AI รับฟังและตอบกลับ",
    gradient: "from-[#4E9A6D]/15 to-[#A8D5B5]/10",
    iconBg: "bg-[#4E9A6D]/15",
    iconColor: "text-[#3A7A56]",
    accent: "#3A7A56",
  },
];

export default function ActivityPage() {
  return (
    <>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-[#7B6FFF]/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-[#A78BFA]/6 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 pt-20 px-4 max-w-2xl mx-auto pb-32">
        <section className="mb-8 mt-4">
          <h2 className="text-3xl font-extrabold text-[#1E1B3A] leading-tight">
            กิจกรรม <br />
            <span className="text-[#7B6FFF]">เยียวยาใจ</span>
          </h2>
          <p className="mt-2 text-sm text-[#6B6890]">เลือกกิจกรรมที่ตรงกับความรู้สึกของคุณวันนี้</p>
        </section>

        <div className="grid grid-cols-1 gap-4">
          {ACTIVITIES.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`group flex items-center gap-4 bg-gradient-to-r ${a.gradient} border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] bg-white/70 backdrop-blur-sm`}
            >
              <div className={`shrink-0 w-14 h-14 rounded-2xl ${a.iconBg} flex items-center justify-center`}>
                <span
                  className={`material-symbols-outlined text-[28px] ${a.iconColor}`}
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 28" }}
                >
                  {a.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1E1B3A] text-base">{a.label}</h3>
                <p className="text-[#6B6890] text-sm mt-0.5 leading-snug">{a.desc}</p>
              </div>
              <span
                className="material-symbols-outlined text-xl shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: a.accent, fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 20" }}
              >
                chevron_right
              </span>
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </>
  );
}
