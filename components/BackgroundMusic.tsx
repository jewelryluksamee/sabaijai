"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

const VIDEO_ID = "CJnu6sOwN_o";
const PLAYLIST = "CJnu6sOwN_o,HGl75kurxok";
const VOLUME = 20;

export default function BackgroundMusic() {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function initPlayer() {
      if (!containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: PLAYLIST,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady(e) {
            e.target.setVolume(VOLUME);
            e.target.playVideo();
            setReady(true);
            setPlaying(true);
          },
          onStateChange(e) {
            setPlaying(e.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    }

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.getElementById("yt-api-script")) {
        const script = document.createElement("script");
        script.id = "yt-api-script";
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
    }

    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  function toggle() {
    if (!playerRef.current || !ready) return;
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }

  return (
    <>
      {/* Hidden YouTube player */}
      <div className="fixed -top-[9999px] -left-[9999px] w-1 h-1 overflow-hidden" aria-hidden>
        <div ref={containerRef} />
      </div>

      {/* Music toggle button — inline in navbar */}
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
    </>
  );
}
