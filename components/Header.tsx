import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-gradient-to-r from-[#1e1a50]/90 via-[#342d78]/85 to-[#5548a0]/80 backdrop-blur-xl flex items-center justify-between px-6 h-16 border-b border-black shadow-[0_2px_24px_rgba(30,26,80,0.30)]">
      <div className="flex items-center gap-3">
        <Image src="/2.png" alt="Sabaijai logo" width={32} height={32} className="object-contain drop-shadow-md" />
        <h1 className="text-2xl font-bold text-white [font-family:var(--font-display)] tracking-tight drop-shadow-sm">
          Sabaijai
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <SignOutButton />
      </div>
    </header>
  );
}
