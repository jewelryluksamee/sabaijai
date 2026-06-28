"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuiz } from "@/lib/quiz-context";

const navItems = [
  { href: "/home", label: "Home", icon: "auto_awesome" },
  { href: "/activity", label: "Activity", icon: "self_improvement" },
  { href: "/profile", label: "Profile", icon: "insights" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { quizOpen } = useQuiz();
  if (quizOpen) return null;

  return (
    <nav className="fixed bottom-0 w-full z-60 flex justify-around items-center px-4 pb-3 pt-2 bg-white/90 backdrop-blur-xl h-18 rounded-t-3xl shadow-[0_-6px_28px_rgba(123,111,255,0.11)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-5 py-2 rounded-2xl transition-all duration-200 ${
              isActive
                ? "text-[#7B6FFF] bg-[#7B6FFF]/10"
                : "text-[#B0ABCC] hover:text-[#7B6FFF]"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={
                isActive
                  ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'opsz' 22" }
                  : { fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 22" }
              }
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
