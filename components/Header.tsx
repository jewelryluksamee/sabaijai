import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";
import FeedbackButton from "@/components/FeedbackButton";
import BackgroundMusic from "@/components/BackgroundMusic";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-gradient-to-r from-[#1e1a50]/90 via-[#342d78]/85 to-[#5548a0]/80 backdrop-blur-xl flex items-center justify-between px-6 h-16 border-b border-black shadow-[0_2px_24px_rgba(30,26,80,0.30)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#fff9a0] border border-black flex items-center justify-center shadow-sm">
          <Image src="/2.png" alt="Sabaijai" width={28} height={28} className="object-contain" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="[font-family:var(--font-display)] text-xl font-bold text-white tracking-wide drop-shadow-sm">
            sabaijai
          </span>
          <span className="text-[9px] text-white/60 tracking-widest uppercase font-medium mt-0.5">
            สบายใจ
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <BackgroundMusic />
        <FeedbackButton />
        <SignOutButton />
      </div>
    </header>
  );
}
