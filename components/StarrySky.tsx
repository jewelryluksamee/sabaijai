"use client";

import { useEffect, useState } from "react";

/* ── deterministic per-star properties ── */
function starProps(index: number) {
  const a = (index * 2654435761) >>> 0;
  const b = (index * 1234567891) >>> 0;
  const c = (index * 987654323)  >>> 0;

  const colorType = c % 4;
  const color =
    colorType === 0 ? "rgba(255,248,190,0.90)" :   // warm butter yellow
    colorType === 1 ? "rgba(255,252,220,0.88)" :   // off-white warm
    colorType === 2 ? "rgba(255,240,200,0.85)" :   // soft amber
                      "rgba(255,255,238,0.82)";    // creamy white

  return {
    x:        (a % 82) + 5,
    y:        (b % 52) + 5,
    size:     (c % 2) + 1,                       // 1–2 px
    duration: ((a % 25) / 10) + 2,               // 2–4.5 s
    delay:    (b % 30) / 10,                     // 0–3 s
    glow:     c % 3 === 0,
    color,
  };
}

export default function StarrySky({ count }: { count: number }) {
  const [launching, setLaunching] = useState(false);
  const [newStarKey, setNewStarKey] = useState(0);

  useEffect(() => {
    const handler = () => {
      setNewStarKey((k) => k + 1);
      setLaunching(true);
      setTimeout(() => setLaunching(false), 2600);
    };
    window.addEventListener("newPost", handler);
    return () => window.removeEventListener("newPost", handler);
  }, []);

  return (
    <>
      {/* ── Fixed stars, one per post ── */}
      {Array.from({ length: count }, (_, i) => {
        const s = starProps(i);
        const isNewest = i === count - 1 && newStarKey > 0;
        return (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left:      `${s.x}%`,
              top:       `${s.y}%`,
              width:     `${s.size + 1}px`,
              height:    `${s.size + 1}px`,
              backgroundColor: s.color,
              boxShadow: s.glow
                ? `0 0 ${s.size * 4}px ${s.size * 2}px ${s.color.replace("0.95", "0.45").replace("0.90", "0.40")}`
                : "none",
              animation: isNewest
                ? "star-pop 0.7s ease-out forwards"
                : `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        );
      })}

      {/* ── Launch animation — fixed so it travels from form → sky ── */}
      {launching && (
        <div
          className="pointer-events-none z-50"
          style={{
            position:  "fixed",
            left:      "50%",
            bottom:    "18vh",
            animation: "star-launch 2.6s cubic-bezier(0.2, 0.6, 0.4, 1) forwards",
          }}
        >
          {/* Comet tail */}
          <div
            style={{
              position:     "absolute",
              top:          "100%",
              left:         "50%",
              transform:    "translateX(-50%)",
              width:        "3px",
              height:       "54px",
              background:   "linear-gradient(to bottom, rgba(255,255,255,0.75) 0%, rgba(180,210,255,0.30) 50%, transparent 100%)",
              borderRadius: "2px",
            }}
          />
          {/* Star core */}
          <div
            style={{
              width:        "11px",
              height:       "11px",
              borderRadius: "50%",
              transform:    "translateX(-50%)",
              background:   "radial-gradient(circle, #ffffff 0%, #d0eaff 55%, transparent 100%)",
              boxShadow:    "0 0 12px 6px rgba(255,255,255,0.85), 0 0 28px 14px rgba(180,220,255,0.55), 0 0 56px 28px rgba(140,200,255,0.25)",
            }}
          />
        </div>
      )}
    </>
  );
}
