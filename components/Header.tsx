import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#fdf8ef]/70 backdrop-blur-xl flex items-center justify-between px-6 h-16">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[#4e7c5f] text-2xl">
          bubble_chart
        </span>
        <h1 className="text-2xl font-bold text-[#4e7c5f] [font-family:var(--font-display)] tracking-tight">
          Sabaijai
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#4e7c5f]/10 text-[#4e7c5f] hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <SignOutButton />
      </div>
    </header>
  );
}
