import Image from "next/image";
import GoogleSignIn from "@/components/GoogleSignIn";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row items-stretch overflow-hidden relative grainy-texture">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-[#c2e3c8]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-[#d4e8c8]/15 blur-[150px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="flex-1 relative flex flex-col justify-center items-center p-8 md:p-16 z-10">
        <div className="max-w-xl w-full space-y-8">
          {/* Branding */}
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 flex items-center justify-center">
              <Image src="/2.png" alt="Sabaijai logo" width={48} height={48} className="object-contain" />
            </div>
            <span className="font-[var(--font-display)] text-3xl font-extrabold tracking-tight text-[#4e7c5f]">
              Sabaijai
            </span>
          </div>

          {/* Headlines */}
          <div className="space-y-4">
            <h1 className="font-[var(--font-headline)] text-5xl md:text-7xl font-extrabold text-[#332b1f] tracking-tight leading-tight">
              สบายใจ{" "}
              <span className="text-[#3d6b4e] block md:inline">(Sabaijai)</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#6b5e4d] font-medium leading-relaxed max-w-md">
              พื้นที่ปลอดภัย ให้ใจได้พัก
            </p>
          </div>

          {/* Illustration */}
          <div className="relative mt-12 group">
            <div className="absolute -inset-4 bg-white/40 backdrop-blur-md rounded-xl transform -rotate-2 scale-105 transition-transform group-hover:rotate-0 duration-700" />
            <div className="relative aspect-square md:aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#c2e3c8]/30 to-[#d4e8c8]/30 flex items-center justify-center">
              <img
                alt="Soft illustrated cloud character"
                className="w-4/5 h-4/5 object-contain drop-shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3gxaUy2X05YstuDg-Fbu_LRqJ100wRSDBpXw4g5Bo93wgcGkd40eylXekfucfYcrlnp9Q_58PdRo_RS7M9HDXRZsrW2CL_gGcd6La6jDPiVlLNHs66YIjiYh-suqfz7f4Do1iqHqvH13-jqTBqyEjKxqjH-y0J7IVoXpJpK1oEc9H4K9_RDyDvcNNyB_e8iWuXlxm2nBe1sXXjskUSD9KLu5xU_387s_u3Z7i9VcNy5p8GLJsTYqe1vt5xXrc6QP1UDFRipsVvaTb"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 pt-4">
            <span className="px-5 py-2 rounded-full bg-[#d4e8c8]/30 text-[#2a4d32] text-sm font-medium">
              ผ่อนคลาย
            </span>
            <span className="px-5 py-2 rounded-full bg-[#e8d8a8]/30 text-[#5a4a25] text-sm font-medium">
              ทำสมาธิ
            </span>
            <span className="px-5 py-2 rounded-full bg-[#c2e3c8]/30 text-[#1a3d25] text-sm font-medium">
              บันทึกอารมณ์
            </span>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="w-full md:w-[480px] bg-white/40 backdrop-blur-2xl md:bg-[#ffffff]/80 flex flex-col justify-center items-center p-8 md:p-12 z-20 border-t md:border-t-0 md:border-l border-white/20">
        <div className="w-full max-w-sm space-y-10">
          <div className="text-center md:text-left">
            <h2 className="font-[var(--font-headline)] text-2xl font-bold text-[#332b1f] mb-2">
              ยินดีต้อนรับกลับมา
            </h2>
            <p className="text-[#6b5e4d]">เริ่มต้นช่วงเวลาแห่งความสงบของคุณ</p>
          </div>

          <div className="space-y-4">
            {/* Google Login */}
            <GoogleSignIn />
          </div>
        </div>
      </section>
    </main>
  );
}
