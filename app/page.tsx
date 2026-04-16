import Image from "next/image";
import GoogleSignIn from "@/components/GoogleSignIn";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#fdf8ef] grainy-texture">

      {/* Background blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-[#c2e3c8]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-[#d4e8c8]/15 blur-[150px] rounded-full" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full px-6 pt-8 pb-20">

        {/* Brand mark */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-12 h-12 rounded-2xl bg-[#fff9a0] border border-black flex items-center justify-center shadow-sm">
            <Image src="/2.png" alt="Sabaijai" width={34} height={34} className="object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="[font-family:var(--font-display)] text-2xl font-bold text-[#332b1f] tracking-wide">
              sabaijai
            </span>
            <span className="text-[10px] text-[#9a8c7d] tracking-widest uppercase font-medium mt-0.5">
              สบายใจ
            </span>
          </div>
        </div>

        {/* Hero headline */}
        <div className="text-center mb-7 w-full max-w-sm">
          <h1 className="[font-family:var(--font-display)] text-[4.5rem] font-extrabold text-[#332b1f] leading-none mb-5 tracking-tight">
            สบายใจ
          </h1>
          <p className="text-[#6b5e4d] text-lg leading-relaxed font-medium [font-family:var(--font-display)]">
            พื้นที่ปลอดภัย ให้ใจได้พัก
          </p>
          <p className="text-[#a09080] text-sm mt-2 tracking-wide">
            Your safe space to breathe
          </p>
        </div>

        {/* Feature tags */}
        <div className="flex gap-2 flex-wrap justify-center mb-7">
          <span className="px-4 py-1.5 rounded-full bg-[#d4e8c8] border border-black text-[#2a4d32] text-xs font-semibold tracking-wide">
            แชร์ความรู้สึกโดยไม่ถูกตัดสิน
          </span>
          <span className="px-4 py-1.5 rounded-full bg-[#e8d8a8] border border-black text-[#5a4a25] text-xs font-semibold tracking-wide">
            แชร์เพลงช่วยฮีลใจ
          </span>
          <span className="px-4 py-1.5 rounded-full bg-[#c8dce8] border border-black text-[#253d5a] text-xs font-semibold tracking-wide">
            วิเคราะห์อารมณ์
          </span>
        </div>

        {/* Login card */}
        <div className="w-full max-w-[360px] bg-white border border-black rounded-2xl shadow-[0_4px_32px_rgba(78,124,95,0.12)] overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="[font-family:var(--font-display)] text-xl font-bold text-[#332b1f]">
                ยินดีต้อนรับกลับมา
              </h2>
              <p className="text-[#9a8c7d] text-sm mt-1.5 leading-relaxed">
                ลงชื่อเข้าใช้พื้นที่สบายใจของคุณ
              </p>
            </div>

            <GoogleSignIn />

            <p className="text-center text-[11px] text-[#b8a898] leading-relaxed">
              การเข้าสู่ระบบถือว่าคุณยอมรับ{" "} <br/>
              <span className="underline decoration-dotted cursor-pointer hover:text-[#6b5e4d] transition-colors">
                นโยบายความเป็นส่วนตัว
              </span>
              {" "}ของเรา
            </p>
          </div>
        </div>

      </div>
      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 bg-[#2d1b4e] py-4 px-6 text-center">
        <p className="text-white/80 text-xs tracking-wide">
          © 2026 Sabaijai · สบายใจ
        </p>
        <p className="text-white/50 text-[11px] mt-1">
          Made by MentalEDDY Team ♥ 
        </p>
      </footer>
    </main>
  );
}
