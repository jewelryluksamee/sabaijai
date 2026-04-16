"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", label: "Home", icon: "auto_awesome" },
  { href: "/music", label: "Music", icon: "music_note" },
  { href: "/insight", label: "Insight", icon: "insights" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-end px-8 pb-3 bg-linear-to-b from-[#a89cc8]/85 via-[#8070b8]/85 to-[#5548a0]/90 backdrop-blur-xl h-20 rounded-t-[3rem] border border-black shadow-[0_-4px_32px_rgba(52,45,120,0.25)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-5 py-2 rounded-full transition-all ${
              isActive
                ? "bg-white/25 text-white scale-105 shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                : "text-white/50 hover:bg-white/10 hover:text-white/80"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                isActive
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {item.icon}
            </span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
