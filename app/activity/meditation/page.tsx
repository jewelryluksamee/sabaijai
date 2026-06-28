"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const DURATIONS = [5, 10, 15, 20, 30];

const SOUNDS = [
  { id: "bowl",    label: "ระฆังทิเบต", icon: "🔔" },
  { id: "rain",    label: "เสียงฝน",    icon: "🌧️" },
  { id: "nature",  label: "ธรรมชาติ",   icon: "🌿" },
  { id: "silence", label: "เงียบ",      icon: "🔇" },
];

function getAudioCtx(): AudioContext {
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

function playBell(ctx: AudioContext, volume = 0.5) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 432;
  osc.type = "sine";
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);
  osc.start();
  osc.stop(ctx.currentTime + 3.6);
}

function createNoiseBuffer(ctx: AudioContext, brown = false) {
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    data[i] = brown ? ((last = (last + 0.02 * w) / 1.02) * 3.5) : w;
  }
  return buf;
}

interface AmbientHandle { stop: () => void }

function startAmbient(ctx: AudioContext, soundId: string): AmbientHandle | null {
  if (soundId === "silence") return null;

  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  if (soundId === "bowl") {
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.frequency.value = 120;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    osc.connect(gain);
    lfo.start(); osc.start();
    return { stop: () => { try { osc.stop(); lfo.stop(); } catch { /* already stopped */ } } };
  }

  if (soundId === "rain" || soundId === "nature") {
    const buf = createNoiseBuffer(ctx, soundId === "nature");
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    src.buffer = buf;
    src.loop = true;
    filter.type = soundId === "rain" ? "bandpass" : "lowpass";
    filter.frequency.value = soundId === "rain" ? 700 : 300;
    filter.Q.value = soundId === "rain" ? 0.5 : 1;
    gain.gain.value = soundId === "rain" ? 0.28 : 0.18;
    src.connect(filter);
    filter.connect(gain);
    src.start();
    return { stop: () => { try { src.stop(); } catch { /* already stopped */ } } };
  }

  return null;
}

export default function MeditationPage() {
  const [duration, setDuration] = useState(10);
  const [sound, setSound] = useState("bowl");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<AmbientHandle | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSec = duration * 60;
  const remaining = totalSec - elapsed;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = elapsed / totalSec;

  const stopAll = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    ambientRef.current?.stop(); ambientRef.current = null;
  }, []);

  const handleStop = useCallback(() => {
    stopAll();
    setRunning(false);
    setElapsed(0);
    setDone(false);
  }, [stopAll]);

  const handleStart = useCallback(() => {
    setElapsed(0);
    setDone(false);
    setRunning(true);

    const ctx = getAudioCtx();
    ctxRef.current = ctx;
    playBell(ctx);
    ambientRef.current = startAmbient(ctx, sound);

    let sec = 0;
    intervalRef.current = setInterval(() => {
      sec += 1;
      setElapsed(sec);
      if (sec >= totalSec) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        ambientRef.current?.stop(); ambientRef.current = null;
        if (ctxRef.current) playBell(ctxRef.current);
        setRunning(false);
        setDone(true);
      }
    }, 1000);
  }, [sound, totalSec]);

  useEffect(() => () => stopAll(), [stopAll]);

  const circumference = 2 * Math.PI * 54;
  const dash = circumference * (1 - progress);

  return (
    <>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#F5F0FF]/60 to-[#EEE8FF]/30" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#A78BFA]/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 pt-16 px-4 max-w-md mx-auto pb-32 flex flex-col min-h-screen">

        <Link href="/activity" className="flex items-center gap-1 text-[#7C5CBF] text-sm font-medium mt-4 mb-6 w-fit">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'opsz' 20" }}>arrow_back</span>
          กลับ
        </Link>

        <h2 className="text-2xl font-extrabold text-[#1E1B3A] mb-1">สมาธิจับเวลา</h2>
        <p className="text-sm text-[#6B6890] mb-8">ตั้งเวลาและเลือกเสียง เพื่อช่วยให้จิตใจสงบ</p>

        {/* Timer circle */}
        <div className="flex justify-center mb-8">
          <div className="relative w-52 h-52">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#EDE9FF" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke="#7B6FFF" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={running || done ? dash : circumference}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {done ? (
                <>
                  <span className="text-4xl">🧘</span>
                  <span className="text-xs text-[#7C5CBF] font-semibold mt-1">เสร็จแล้ว!</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-[#1E1B3A] tabular-nums">
                    {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-[#6B6890] mt-1">{running ? "กำลังนั่งสมาธิ" : "พร้อมเริ่ม"}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Duration selector */}
        {!running && !done && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#6B6890] mb-2 uppercase tracking-wide">ระยะเวลา</p>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    duration === d
                      ? "bg-[#7B6FFF] text-white shadow-md"
                      : "bg-white/70 text-[#6B6890] border border-[#E0DBFF] hover:border-[#7B6FFF]/40"
                  }`}
                >
                  {d} นาที
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sound selector */}
        {!running && !done && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-[#6B6890] mb-2 uppercase tracking-wide">เสียงประกอบ</p>
            <div className="grid grid-cols-4 gap-2">
              {SOUNDS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSound(s.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-medium transition-all ${
                    sound === s.id
                      ? "bg-[#7B6FFF] text-white shadow-md"
                      : "bg-white/70 text-[#6B6890] border border-[#E0DBFF] hover:border-[#7B6FFF]/40"
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="leading-tight text-center text-[11px]">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sound label during session */}
        {running && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-lg">{SOUNDS.find((s) => s.id === sound)?.icon}</span>
            <span className="text-sm text-[#7C5CBF] font-medium">{SOUNDS.find((s) => s.id === sound)?.label}</span>
            <span className="inline-flex gap-0.5 items-end h-4 ml-1">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-1 bg-[#A78BFA] rounded-full animate-bounce"
                  style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </div>
        )}

        {/* Control button */}
        <div className="flex justify-center gap-3">
          {!running ? (
            <button
              onClick={done ? handleStop : handleStart}
              className="px-10 py-3.5 rounded-2xl bg-[#7B6FFF] hover:bg-[#6B5FEF] text-white font-bold text-sm shadow-lg transition-all active:scale-95"
            >
              {done ? "เริ่มใหม่" : "เริ่มนั่งสมาธิ"}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-10 py-3.5 rounded-2xl bg-[#EDE9FF] hover:bg-[#DDD8FF] text-[#7B6FFF] font-bold text-sm transition-all active:scale-95"
            >
              หยุด
            </button>
          )}
        </div>

        {/* Tip */}
        {!running && !done && (
          <div className="mt-10 bg-white/60 border border-[#E0DBFF] rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#7C5CBF] mb-1">💡 เคล็ดลับ</p>
            <p className="text-xs text-[#6B6890] leading-relaxed">
              นั่งในท่าที่สบาย หลับตา โฟกัสที่ลมหายใจ เมื่อจิตใจวอกแวก ให้ค่อย ๆ ดึงความสนใจกลับมาที่ลมหายใจโดยไม่ตัดสิน
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}
