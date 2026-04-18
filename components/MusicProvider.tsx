"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const VIDEO_ID = "CJnu6sOwN_o";
const PLAYLIST = "CJnu6sOwN_o,HGl75kurxok";
const VOLUME = 20;

type MusicCtx = { playing: boolean; ready: boolean; toggle: () => void };
const MusicContext = createContext<MusicCtx>({ playing: false, ready: false, toggle: () => {} });
export const useMusicPlayer = () => useContext(MusicContext);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onReady(e: any) {
            e.target.setVolume(VOLUME);
            e.target.playVideo();
            setReady(true);
            setPlaying(true);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange(e: any) {
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

    return () => { playerRef.current?.destroy(); };
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
    <MusicContext.Provider value={{ playing, ready, toggle }}>
      {/* Hidden YouTube player */}
      <div className="fixed -top-[9999px] -left-[9999px] w-1 h-1 overflow-hidden" aria-hidden>
        <div ref={containerRef} />
      </div>
      {children}
    </MusicContext.Provider>
  );
}
