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
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-8 pb-4 bg-[#fef8fb]/70 backdrop-blur-xl h-20 rounded-t-[3rem] shadow-[0_-4px_32px_rgba(105,85,142,0.06)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-5 py-2 rounded-full transition-all ${
              isActive
                ? "bg-[#69558e]/10 text-[#69558e] scale-105"
                : "text-[#69558e]/50 hover:bg-[#69558e]/5"
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
