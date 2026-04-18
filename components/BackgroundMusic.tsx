"use client";

import { useMusicPlayer } from "@/components/MusicProvider";

export default function BackgroundMusic() {
  const { playing, toggle } = useMusicPlayer();

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "หยุดเพลง" : "เปิดเพลง"}
      title={playing ? "หยุดเพลง" : "เปิดเพลง"}
      className="flex items-center justify-center w-8 h-8 rounded-full border border-white/30 text-white/80 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
        {playing ? "music_note" : "music_off"}
      </span>
    </button>
  );
}
