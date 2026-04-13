import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row items-stretch overflow-hidden relative grainy-texture">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-[#d6beff]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-[#bdefbe]/15 blur-[150px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="flex-1 relative flex flex-col justify-center items-center p-8 md:p-16 z-10">
        <div className="max-w-xl w-full space-y-8">
          {/* Branding */}
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-[#69558e] rounded-xl flex items-center justify-center text-[#fef7ff] shadow-lg shadow-[#69558e]/10">
              <span className="material-symbols-outlined text-3xl">
                bubble_chart
              </span>
            </div>
            <span className="font-[var(--font-headline)] text-3xl font-extrabold tracking-tight text-[#69558e]">
              Sabaijai
            </span>
          </div>

          {/* Headlines */}
          <div className="space-y-4">
            <h1 className="font-[var(--font-headline)] text-5xl md:text-7xl font-extrabold text-[#353136] tracking-tight leading-tight">
              สบายใจ{" "}
              <span className="text-[#5c4981] block md:inline">(Sabaijai)</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#625e63] font-medium leading-relaxed max-w-md">
              พื้นที่ปลอดภัย ให้ใจได้พัก
            </p>
          </div>

          {/* Illustration */}
          <div className="relative mt-12 group">
            <div className="absolute -inset-4 bg-white/40 backdrop-blur-md rounded-xl transform -rotate-2 scale-105 transition-transform group-hover:rotate-0 duration-700" />
            <div className="relative aspect-square md:aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#d6beff]/30 to-[#bdefbe]/30 flex items-center justify-center">
              <img
                alt="Soft illustrated cloud character"
                className="w-4/5 h-4/5 object-contain drop-shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3gxaUy2X05YstuDg-Fbu_LRqJ100wRSDBpXw4g5Bo93wgcGkd40eylXekfucfYcrlnp9Q_58PdRo_RS7M9HDXRZsrW2CL_gGcd6La6jDPiVlLNHs66YIjiYh-suqfz7f4Do1iqHqvH13-jqTBqyEjKxqjH-y0J7IVoXpJpK1oEc9H4K9_RDyDvcNNyB_e8iWuXlxm2nBe1sXXjskUSD9KLu5xU_387s_u3Z7i9VcNy5p8GLJsTYqe1vt5xXrc6QP1UDFRipsVvaTb"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 pt-4">
            <span className="px-5 py-2 rounded-full bg-[#bdefbe]/30 text-[#2f5b36] text-sm font-medium">
              ผ่อนคลาย
            </span>
            <span className="px-5 py-2 rounded-full bg-[#95cfff]/30 text-[#00466a] text-sm font-medium">
              ทำสมาธิ
            </span>
            <span className="px-5 py-2 rounded-full bg-[#d6beff]/30 text-[#4b386e] text-sm font-medium">
              บันทึกอารมณ์
            </span>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="w-full md:w-[480px] bg-white/40 backdrop-blur-2xl md:bg-[#ffffff]/80 flex flex-col justify-center items-center p-8 md:p-12 z-20 border-t md:border-t-0 md:border-l border-white/20">
        <div className="w-full max-w-sm space-y-10">
          <div className="text-center md:text-left">
            <h2 className="font-[var(--font-headline)] text-2xl font-bold text-[#353136] mb-2">
              ยินดีต้อนรับกลับมา
            </h2>
            <p className="text-[#625e63]">เริ่มต้นช่วงเวลาแห่งความสงบของคุณ</p>
          </div>

          <div className="space-y-4">
            {/* Google Login */}
            <GoogleSignIn />
          </div>

          {/* Footer */}
          <div className="text-center space-y-6">
            <p className="text-sm text-[#625e63]">
              ยังไม่มีบัญชี?{" "}
              <a href="#" className="text-[#69558e] font-bold hover:underline">
                สมัครสมาชิก
              </a>
            </p>
            <p className="text-[10px] leading-relaxed text-[#7e797e]/60 uppercase tracking-widest px-8">
              การเข้าสู่ระบบแสดงว่าคุณยอมรับข้อตกลงและนโยบายความเป็นส่วนตัวของเรา
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
