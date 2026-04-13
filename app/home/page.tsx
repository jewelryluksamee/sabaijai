import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pt-16 pb-32">
        {/* Sky Banner */}
        <section className="relative w-full h-[400px] sky-gradient overflow-hidden flex flex-col justify-center items-center px-6">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url(https://lh3.googleusercontent.com/aida-public/AB6AXuBaUKoZHVwRk9rzvgVWEwzBladU0EcbQhTrhOV5ArvFKouGbUJKUr7w4Du6DOUYUAyYwfFo4WHuzK1Rbvp3w-pI_HHYDkhMBuOxrzFWGDViPrcm_MVZySyzz_WwsT8APx0G-hIgBh0i2kxAQXd2ZYwYPIB0ecxppOw44lvyhaW8HpCpdPAgIRiaeImQRJpmw9JD6MoBV6s5jgacVtYOp9pvVOnN3yjnXv0lV5nNH6QVvrfPxHZZh2_mTFD46Tjs6WcTwTWl5E3ZW7vC)",
            }}
          />
          {/* Floating Stars */}
          <div className="absolute top-20 left-[15%] w-2 h-2 bg-white rounded-full blur-[1px] opacity-60" />
          <div className="absolute top-40 left-[40%] w-1 h-1 bg-white rounded-full blur-[0.5px] opacity-80" />
          <div className="absolute top-10 right-[25%] w-2 h-2 bg-white rounded-full blur-[1px] opacity-40" />
          <div className="absolute top-32 right-[10%] w-1 h-1 bg-white rounded-full blur-[0.5px] opacity-70" />
          <div className="absolute bottom-20 left-[30%] w-1.5 h-1.5 bg-[#d6beff] rounded-full blur-[1px] opacity-50" />

          <div className="relative z-10 text-center space-y-6 max-w-xl">
            <h2 className="text-4xl md:text-5xl font-[var(--font-headline)] font-extrabold text-white leading-tight">
              ความรู้สึกของคุณ
              <br />
              เปรียบดั่งดวงดาว
            </h2>
            <p className="text-white/80 text-lg font-light leading-relaxed">
              พื้นที่ปลอดภัยที่คุณสามารถปลดปล่อยความในใจ
              <br />
              ท่ามกลางหมู่ดาวที่พร้อมรับฟัง
            </p>
            <button className="mt-4 px-10 py-4 bg-white text-[#69558e] rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                edit_note
              </span>
              ระบายอารมณ์ (Vent)
            </button>
          </div>
        </section>

        {/* Mood Entry Card */}
        <div className="max-w-4xl mx-auto -mt-10 relative z-20 px-6">
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_32px_rgba(105,85,142,0.12)]">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#69558e]/60 uppercase tracking-wider">
                  บอกความในใจของคุณ
                </label>
                <textarea
                  className="w-full bg-[#ede6eb] rounded-lg p-6 min-h-[120px] border-none outline-none focus:ring-2 focus:ring-[#69558e]/20 text-[#353136] placeholder:text-[#b6b0b6]"
                  placeholder="วันนี้เจอเรื่องอะไรมาบ้าง..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-[#69558e]/60 uppercase tracking-wider">
                  เลือกสีตามอารมณ์ของคุณ
                </label>
                <div className="flex flex-wrap gap-4">
                  {[
                    "bg-yellow-400/20 border-yellow-400 focus:ring-yellow-400",
                    "bg-blue-400/20 border-blue-400 focus:ring-blue-400",
                    "bg-red-400/20 border-red-400 focus:ring-red-400",
                    "bg-purple-400/20 border-purple-400 focus:ring-purple-400",
                    "bg-green-400/20 border-green-400 focus:ring-green-400",
                  ].map((cls, i) => (
                    <button
                      key={i}
                      className={`w-12 h-12 rounded-full border-2 ring-offset-2 ring-2 ring-transparent transition-all ${cls}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#ede6eb]">
                <button className="px-8 py-3 bg-gradient-to-r from-[#69558e] to-[#5c4981] text-[#fef7ff] rounded-full font-semibold shadow-md hover:opacity-90 transition-opacity">
                  ส่งขึ้นสู่ดวงดาว
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Section */}
        <section className="max-w-4xl mx-auto mt-12 px-6 space-y-8">
          <div className="flex items-end justify-between border-b-2 border-[#f8f2f6] pb-4">
            <h3 className="text-2xl font-[var(--font-headline)] font-bold text-[#69558e]">
              ความรู้สึกจากผู้คน
            </h3>
            <span className="text-sm text-[#7e797e]">
              อัปเดตล่าสุด: เมื่อสักครู่
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Post 1 */}
            <div className="bg-[#f8f2f6] rounded-xl p-8 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-bl-[100%] transition-all group-hover:scale-110" />
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-400/20 text-[#0e5881] text-xs font-bold uppercase tracking-widest">
                  เศร้า
                </span>
                <span className="text-xs text-[#7e797e]">
                  2 นาทีที่แล้ว • ไม่ระบุตัวตน
                </span>
              </div>
              <p className="text-lg leading-relaxed text-[#353136] font-light">
                "บางทีการพยายามทำให้ทุกคนมีความสุข
                มันก็เหนื่อยเหมือนกันนะ วันนี้แค่อยากมีใครสักคนที่ถามว่า
                'วันนี้เป็นยังไงบ้าง' โดยที่ไม่ต้องแสร้งยิ้มตอบ"
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <button className="flex items-center gap-3 px-6 py-3 rounded-full bg-white text-[#5c4981] hover:bg-[#d6beff]/20 transition-colors">
                  <span
                    className="material-symbols-outlined text-orange-400"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    candle
                  </span>
                  <span className="font-semibold">เทียน (Light a Candle)</span>
                  <span className="ml-2 text-sm text-[#7e797e]">12</span>
                </button>
                <div className="flex items-center gap-2 text-xs text-[#69558e]/60 italic">
                  <span className="material-symbols-outlined text-sm">
                    auto_awesome
                  </span>
                  <span>Sabaijai AI กำลังรับฟังคุณ...</span>
                </div>
              </div>
              {/* AI Response */}
              <div className="bg-[#d6beff]/10 rounded-lg p-6 border-l-4 border-[#69558e]/30">
                <div className="flex items-start gap-4">
                  <span
                    className="material-symbols-outlined text-[#69558e] mt-1"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    smart_toy
                  </span>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#69558e]">
                      ข้อความจากใจ Sabaijai:
                    </p>
                    <p className="text-[#625e63] text-sm leading-relaxed">
                      เรารับรู้ถึงความเหนื่อยล้าของคุณนะ
                      การใจดีกับตัวเองบ้างก็เป็นเรื่องที่สำคัญพอๆ
                      กับการใจดีกับคนอื่นเลย
                      วันนี้คุณเก่งมากแล้วที่ผ่านมันมาได้ พักผ่อนให้เต็มที่นะ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Post 2 */}
            <div className="bg-[#f8f2f6] rounded-xl p-8 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/10 rounded-bl-[100%] transition-all group-hover:scale-110" />
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-400/20 text-[#2f5b36] text-xs font-bold uppercase tracking-widest">
                  สบายใจ
                </span>
                <span className="text-xs text-[#7e797e]">
                  15 นาทีที่แล้ว • ไม่ระบุตัวตน
                </span>
              </div>
              <p className="text-lg leading-relaxed text-[#353136] font-light">
                "วันนี้ลองออกไปเดินสวนสาธารณะตอนเย็น เห็นดอกไม้บานเต็มเลย
                รู้สึกใจฟูขึ้นมานิดนึง
                ชีวิตมันก็มีความสุขเล็กๆ ซ่อนอยู่แบบนี้เองสินะ"
              </p>
              <button className="flex items-center gap-3 px-6 py-3 rounded-full bg-white text-[#5c4981] hover:bg-[#d6beff]/20 transition-colors">
                <span
                  className="material-symbols-outlined text-orange-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  candle
                </span>
                <span className="font-semibold">เทียน (Light a Candle)</span>
                <span className="ml-2 text-sm text-[#7e797e]">45</span>
              </button>
            </div>

            {/* Post 3 */}
            <div className="bg-[#f8f2f6] rounded-xl p-8 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-bl-[100%] transition-all group-hover:scale-110" />
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-400/20 text-[#4b386e] text-xs font-bold uppercase tracking-widest">
                  สับสน
                </span>
                <span className="text-xs text-[#7e797e]">
                  1 ชั่วโมงที่แล้ว • ไม่ระบุตัวตน
                </span>
              </div>
              <p className="text-lg leading-relaxed text-[#353136] font-light">
                "งานที่ทำอยู่นี่คือสิ่งที่เราต้องการจริงๆ หรือเปล่านะ?
                เริ่มไม่แน่ใจแล้วว่าทางที่เลือกมันถูกไหม
                แต่ก็จะลองพยายามดูอีกสักนิด"
              </p>
              <button className="flex items-center gap-3 px-6 py-3 rounded-full bg-white text-[#5c4981] hover:bg-[#d6beff]/20 transition-colors">
                <span
                  className="material-symbols-outlined text-orange-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  candle
                </span>
                <span className="font-semibold">เทียน (Light a Candle)</span>
                <span className="ml-2 text-sm text-[#7e797e]">28</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />

      {/* FAB */}
      <button className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-tr from-[#69558e] to-[#d6beff] text-[#fef7ff] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 md:hidden">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </>
  );
}
