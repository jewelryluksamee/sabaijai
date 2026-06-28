"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type Phase = "idle" | "inhale" | "hold-in" | "exhale" | "hold-out";

const PHASES: { phase: Phase; label: string; seconds: number; instruction: string }[] = [
  { phase: "inhale",   label: "หายใจเข้า",  seconds: 4, instruction: "ค่อย ๆ หายใจเข้าลึก ๆ" },
  { phase: "hold-in",  label: "กลั้นใจ",    seconds: 4, instruction: "กลั้นลมหายใจไว้นิ่ง ๆ" },
  { phase: "exhale",   label: "หายใจออก", seconds: 4, instruction: "ค่อย ๆ ปล่อยลมหายใจออก" },
  { phase: "hold-out", label: "หยุด",       seconds: 4, instruction: "หยุดพักก่อนรอบต่อไป" },
];

const TOTAL_CYCLE_SEC = PHASES.reduce((s, p) => s + p.seconds, 0); // 16s

export default function BreathingPage() {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick] = useState(0); // 0..phase.seconds-1
  const [cycles, setCycles] = useState(0);
  const [targetCycles] = useState(5);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef({ phaseIdx: 0, tick: 0, cycles: 0 });

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setPhaseIdx(0);
    setTick(0);
    setCycles(0);
    stateRef.current = { phaseIdx: 0, tick: 0, cycles: 0 };
  }, []);

  const start = useCallback(() => {
    stateRef.current = { phaseIdx: 0, tick: 0, cycles: 0 };
    setPhaseIdx(0);
    setTick(0);
    setCycles(0);
    setRunning(true);

    intervalRef.current = setInterval(() => {
      const s = stateRef.current;
      const phase = PHASES[s.phaseIdx];
      const nextTick = s.tick + 1;

      if (nextTick >= phase.seconds) {
        const nextPhaseIdx = (s.phaseIdx + 1) % PHASES.length;
        const newCycles = nextPhaseIdx === 0 ? s.cycles + 1 : s.cycles;

        if (nextPhaseIdx === 0 && newCycles >= targetCycles) {
          // done
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          stateRef.current = { phaseIdx: 0, tick: 0, cycles: newCycles };
          setRunning(false);
          setPhaseIdx(0);
          setTick(0);
          setCycles(newCycles);
          return;
        }

        stateRef.current = { phaseIdx: nextPhaseIdx, tick: 0, cycles: newCycles };
        setPhaseIdx(nextPhaseIdx);
        setTick(0);
        setCycles(newCycles);
      } else {
        stateRef.current = { ...s, tick: nextTick };
        setTick(nextTick);
      }
    }, 1000);
  }, [targetCycles]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const phase = PHASES[phaseIdx];
  const progress = running ? (tick + 1) / phase.seconds : 0;
  const isExpanding = phase.phase === "inhale";
  const isHolding = phase.phase === "hold-in" || phase.phase === "hold-out";
  const done = !running && cycles >= targetCycles;

  const ringScale = running
    ? phase.phase === "inhale"  ? 0.6 + 0.4 * progress
    : phase.phase === "hold-in" ? 1
    : phase.phase === "exhale"  ? 1 - 0.4 * progress
    : 0.6
    : 0.7;

  return (
    <>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#EEF8FF]/60 to-[#F0F4FF]/40" />
      </div>

      <main className="relative z-10 pt-16 px-4 max-w-md mx-auto pb-32 flex flex-col min-h-screen">

        {/* Back */}
        <Link href="/activity" className="flex items-center gap-1 text-[#4A9BB8] text-sm font-medium mt-4 mb-6 w-fit">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 20" }}>arrow_back</span>
          กลับ
        </Link>

        <h2 className="text-2xl font-extrabold text-[#1E1B3A] mb-1">การหายใจ Grounding</h2>
        <p className="text-sm text-[#6B6890] mb-8">กล่องหายใจ 4-4-4-4 ช่วยให้ร่างกายและจิตใจกลับสู่สมดุล</p>

        {/* Circle */}
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          <div className="relative flex items-center justify-center w-64 h-64">
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full bg-[#5BB8D4]/10 transition-transform duration-1000 ease-in-out"
              style={{ transform: `scale(${ringScale * 1.15})` }}
            />
            {/* Main ring */}
            <div
              className="absolute inset-0 rounded-full border-4 border-[#5BB8D4]/50 bg-[#5BB8D4]/8 transition-transform duration-1000 ease-in-out"
              style={{ transform: `scale(${ringScale})` }}
            />
            {/* Inner circle */}
            <div className="relative w-28 h-28 rounded-full bg-white/80 backdrop-blur-sm border border-[#5BB8D4]/20 shadow-lg flex flex-col items-center justify-center">
              {running ? (
                <>
                  <span className="text-3xl font-bold text-[#1E1B3A]">{phase.seconds - tick}</span>
                  <span className="text-[10px] text-[#6B6890] font-medium mt-0.5 tracking-wide">{phase.label}</span>
                </>
              ) : done ? (
                <span className="text-3xl">✨</span>
              ) : (
                <span className="material-symbols-outlined text-3xl text-[#5BB8D4]"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 32" }}>air</span>
              )}
            </div>
          </div>

          {/* Instruction */}
          <div className="text-center h-12">
            {running && (
              <p className="text-[#4A9BB8] font-semibold text-base animate-pulse">{phase.instruction}</p>
            )}
            {done && (
              <p className="text-[#3A7A56] font-semibold text-base">เยี่ยมมาก! ครบ {cycles} รอบแล้ว 🎉</p>
            )}
            {!running && !done && (
              <p className="text-[#6B6890] text-sm">กด เริ่ม เพื่อเริ่มการหายใจ 5 รอบ</p>
            )}
          </div>

          {/* Phase indicators */}
          <div className="flex gap-3">
            {PHASES.map((p, i) => (
              <div key={p.phase} className="flex flex-col items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    running && phaseIdx === i
                      ? "bg-[#4A9BB8] scale-125"
                      : "bg-[#B0ABCC]/40"
                  }`}
                />
                <span className="text-[9px] text-[#6B6890]">{p.label}</span>
              </div>
            ))}
          </div>

          {/* Cycles */}
          {running && (
            <p className="text-xs text-[#6B6890]">รอบที่ {cycles + 1} / {targetCycles}</p>
          )}

          {/* Controls */}
          <div className="flex gap-3 mt-2">
            {!running ? (
              <button
                onClick={start}
                className="px-8 py-3 rounded-2xl bg-[#4A9BB8] hover:bg-[#3A8AA8] text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                {done ? "เริ่มใหม่" : "เริ่ม"}
              </button>
            ) : (
              <button
                onClick={stop}
                className="px-8 py-3 rounded-2xl bg-[#E0EFF6] hover:bg-[#C8E3EF] text-[#4A9BB8] font-bold text-sm transition-all active:scale-95"
              >
                หยุด
              </button>
            )}
          </div>
        </div>

        {/* Tip box */}
        <div className="mt-8 bg-white/60 border border-[#5BB8D4]/20 rounded-2xl p-4">
          <p className="text-xs font-semibold text-[#4A9BB8] mb-2">วิธีการ Box Breathing</p>
          <div className="grid grid-cols-4 gap-2">
            {PHASES.map((p) => (
              <div key={p.phase} className="text-center">
                <div className="w-8 h-8 rounded-full bg-[#5BB8D4]/12 flex items-center justify-center mx-auto mb-1">
                  <span className="font-bold text-[#4A9BB8] text-sm">{p.seconds}</span>
                </div>
                <p className="text-[10px] text-[#6B6890] leading-tight">{p.label}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <BottomNav />
    </>
  );
}
