"use client";

import Image from "next/image";

const flyers = [
  { src: "/1.png", duration: 12, delay: 0 },
  { src: "/1.png", duration: 15, delay: 4 },
  { src: "/1.png", duration: 10, delay: 8 },
  { src: "/1.png", duration: 14, delay: 2 },
];

// Waypoints as [left%, top%] — 4 distinct looping paths across the banner
const paths = [
  [[5, 20], [30, 10], [60, 30], [85, 15], [75, 55], [50, 70], [20, 60], [5, 40], [5, 20]],
  [[80, 60], [55, 80], [25, 70], [10, 50], [20, 20], [50, 10], [78, 25], [90, 45], [80, 60]],
  [[45, 50], [70, 20], [90, 60], [65, 80], [35, 65], [10, 80], [15, 35], [40, 15], [45, 50]],
  [[90, 80], [70, 65], [50, 85], [25, 75], [8, 55], [15, 25], [40, 40], [65, 15], [90, 80]],
];

export default function FlyingImages() {
  return (
    <>
      <style>{`
        ${flyers.map((_, i) => {
          const pts = paths[i];
          const pct = (idx: number) => Math.round((idx / (pts.length - 1)) * 100);
          const keyframes = pts.map((p, idx) => {
            const rot = idx % 2 === 0 ? -12 : 12;
            return `${pct(idx)}% { left:${p[0]}%; top:${p[1]}%; transform:rotate(${rot}deg); }`;
          }).join("\n          ");
          return `@keyframes banner-fly-${i} {\n          ${keyframes}\n        }`;
        }).join("\n        ")}
      `}</style>

      {flyers.map((f, i) => (
        <div
          key={i}
          className="absolute pointer-events-none z-10"
          style={{
            left: `${paths[i][0][0]}%`,
            top:  `${paths[i][0][1]}%`,
            animation: `banner-fly-${i} ${f.duration}s linear ${f.delay}s infinite`,
          }}
        >
          <Image
            src={f.src}
            alt=""
            width={32}
            height={32}
            className="object-contain opacity-85 drop-shadow-lg"
          />
        </div>
      ))}
    </>
  );
}
