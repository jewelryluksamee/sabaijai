import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function InsightPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto space-y-10">
        {/* Hero */}
        <section className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-[var(--font-headline)] font-extrabold tracking-tight text-[#353136]">
            Insight รายสัปดาห์
          </h2>
          <p className="text-[#625e63] text-lg max-w-lg leading-relaxed">
            สำรวจโลกภายในของคุณผ่านข้อมูลและพลังของ AI
            เพื่อความเข้าใจตนเองที่ลึกซึ้งยิ่งขึ้น
          </p>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Mood Donut Chart */}
          <div className="md:col-span-8 bg-white rounded-xl p-8 flex flex-col md:flex-row items-center gap-10 shadow-[0_-4px_32px_rgba(105,85,142,0.06)] relative overflow-hidden grainy-texture">
            <div className="relative w-48 h-48 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="stroke-[#bdefbe]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeDasharray="45, 100"
                  strokeWidth="4"
                />
                <path
                  className="stroke-[#d6beff]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeDasharray="30, 100"
                  strokeDashoffset="-45"
                  strokeWidth="4"
                />
                <path
                  className="stroke-[#95cfff]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-75"
                  strokeWidth="4"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-[var(--font-headline)] text-[#353136]">
                  82%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#625e63] font-medium">
                  Stable
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-bold font-[var(--font-headline)] text-[#353136]">
                สัดส่วนอารมณ์ของคุณ
              </h3>
              <div className="space-y-3">
                {[
                  { color: "bg-[#3c6942]", label: "ผ่อนคลาย (Calm)", pct: "45%" },
                  { color: "bg-[#69558e]", label: "มีความสุข (Joyful)", pct: "30%" },
                  { color: "bg-[#22648e]", label: "จดจ่อ (Focus)", pct: "25%" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium text-[#625e63]">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#353136]">
                      {item.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dominant Mood */}
          <div className="md:col-span-4 bg-[#bdefbe] rounded-xl p-8 flex flex-col justify-between relative overflow-hidden grainy-texture">
            <div className="relative z-10">
              <span className="bg-white/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#3c6942] uppercase tracking-widest">
                Dominant
              </span>
              <h3 className="text-2xl font-bold font-[var(--font-headline)] text-[#2f5b36] mt-4">
                อารมณ์หลัก: สงบ
              </h3>
              <p className="text-[#2f5b36]/80 mt-2 text-sm">
                คุณรู้สึกผ่อนคลายและมีความมั่นคงทางอารมณ์สูงในสัปดาห์นี้
              </p>
            </div>
            <div className="relative z-10 flex justify-end">
              <span
                className="material-symbols-outlined text-6xl text-[#3c6942] opacity-40"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                spa
              </span>
            </div>
          </div>

          {/* Color of the Week */}
          <div className="md:col-span-4 bg-[#69558e] rounded-xl p-8 text-[#fef7ff] flex flex-col gap-6 shadow-xl relative overflow-hidden grainy-texture">
            <div className="w-12 h-12 rounded-full bg-[#d6beff]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#fef7ff]">
                palette
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold font-[var(--font-headline)]">
                สีประจำตัวสัปดาห์นี้
              </h3>
              <p className="text-[#fef7ff]/70 text-sm mt-1">
                สีม่วงลาเวนเดอร์สื่อถึงความอ่อนโยนและการเยียวยา
              </p>
            </div>
            <div className="flex gap-2">
              <div className="w-full h-2 rounded-full bg-white/20">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="md:col-span-8 bg-[#f8f2f6] rounded-xl p-8 space-y-6 relative border border-[#b6b0b6]/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#d6beff]/40 rounded-lg">
                <span
                  className="material-symbols-outlined text-[#69558e]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
              </div>
              <h3 className="text-xl font-bold font-[var(--font-headline)] text-[#353136]">
                AI สรุปใจความสำคัญ
              </h3>
            </div>
            <div className="space-y-4">
              <p className="text-[#625e63] leading-relaxed italic border-l-4 border-[#69558e]/30 pl-4">
                "จากการบันทึกของคุณในช่วง 7 วันที่ผ่านมา
                พบว่าคุณสามารถรับมือกับความเครียดจากการทำงานได้ดีขึ้น
                การที่คุณจัดเวลาพักสั้นๆ
                ระหว่างวันช่วยลดระดับความเหนื่อยล้าสะสมได้อย่างมีนัยสำคัญ"
              </p>
              <div className="bg-white rounded-lg p-5 space-y-3">
                <h4 className="text-sm font-bold text-[#69558e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    lightbulb
                  </span>
                  วิธีรับมือ (How to cope)
                </h4>
                <ul className="space-y-2">
                  {[
                    "รักษาจังหวะการหายใจลึกๆ 5 นาทีเมื่อรู้สึกว่างานเริ่มล้นมือ",
                    "เพิ่มการฟังเพลงแนว Ambient เพื่อรักษาความจดจ่อในตอนบ่าย",
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#625e63]">
                      <span className="w-5 h-5 rounded-full bg-[#bdefbe] text-[#3c6942] flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <section className="bg-[#95cfff]/20 rounded-xl p-10 text-center relative overflow-hidden group grainy-texture">
          <span className="material-symbols-outlined text-[#22648e] mb-4 text-4xl group-hover:scale-110 transition-transform duration-500 block">
            format_quote
          </span>
          <p className="text-2xl font-[var(--font-headline)] font-semibold text-[#00466a] leading-snug">
            "ทุกความรู้สึกที่เกิดขึ้น คือสัญญาณของการมีอยู่{" "}
            <br className="hidden md:block" />
            และการเติบโตที่งดงามเสมอ"
          </p>
          <p className="mt-4 text-[#22648e] font-medium">- Sabaijai AI Buddy</p>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
