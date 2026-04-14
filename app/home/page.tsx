import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MoodEntryForm from "@/components/MoodEntryForm";
import CandleButton from "@/components/CandleButton";
import StarrySky from "@/components/StarrySky";
import { db } from "@/lib/firebase-admin";

type Post = {
  id: string;
  content: string;
  mood: string;
  moodLabel: string;
  candles: number;
  createdAt: string;
};

const moodPalette: Record<string, { blob: string; dot: string }> = {
  red:    { blob: "rgba(232,93,74,0.12)",   dot: "#e85d4a" },
  orange: { blob: "rgba(240,136,58,0.12)",  dot: "#f0883a" },
  yellow: { blob: "rgba(240,200,50,0.12)",  dot: "#f0c832" },
  lime:   { blob: "rgba(126,208,64,0.12)",  dot: "#7ed040" },
  green:  { blob: "rgba(56,184,106,0.12)",  dot: "#38b86a" },
  teal:   { blob: "rgba(32,184,168,0.12)",  dot: "#20b8a8" },
  cyan:   { blob: "rgba(32,168,216,0.12)",  dot: "#20a8d8" },
  blue:   { blob: "rgba(56,128,232,0.12)",  dot: "#3880e8" },
  indigo: { blob: "rgba(88,88,216,0.12)",   dot: "#5858d8" },
  purple: { blob: "rgba(144,72,208,0.12)",  dot: "#9048d0" },
  pink:   { blob: "rgba(224,80,160,0.12)",  dot: "#e050a0" },
  gray:   { blob: "rgba(144,144,144,0.12)", dot: "#909090" },
};

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "เมื่อสักครู่";
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
}

async function getPosts(): Promise<Post[]> {
  const snapshot = await db
    .collection("posts")
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      content: data.content ?? "",
      mood: data.mood ?? "blue",
      moodLabel: data.moodLabel ?? data.mood ?? "เศร้า",
      candles: data.candles ?? 0,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    };
  });
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <>
      <Header />
      <main className="pt-16 pb-32">
        {/* Sky Banner */}
        <section className="relative w-full h-100 sky-gradient overflow-hidden flex flex-col justify-center items-center px-6">

          {/* ── Sun glow ── */}
          <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-white/20 blur-2xl" />

          {/* ── Layered clouds ── */}
          {/* far-back large clouds */}
          <div className="absolute top-6 -left-16 w-80 h-20 bg-white/18 rounded-full blur-2xl" />
          <div className="absolute top-10 right-[-80px] w-96 h-24 bg-white/15 rounded-full blur-2xl" />
          {/* mid clouds */}
          <div className="absolute top-[28%] -left-8 w-56 h-14 bg-white/22 rounded-full blur-xl" />
          <div className="absolute top-[22%] right-[5%] w-48 h-12 bg-white/18 rounded-full blur-xl" />
          <div className="absolute top-[40%] left-[30%] w-40 h-10 bg-white/12 rounded-full blur-xl" />
          {/* foreground wispy clouds near horizon */}
          <div className="absolute bottom-8 -left-10 w-72 h-16 bg-white/25 rounded-full blur-2xl" />
          <div className="absolute bottom-4 right-[-20px] w-80 h-14 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute bottom-12 left-[35%] w-52 h-10 bg-white/15 rounded-full blur-xl" />

          {/* ── Light rays from top ── */}
          <div className="absolute top-0 left-[30%] w-1 h-full bg-white/5 blur-sm rotate-6" />
          <div className="absolute top-0 left-[50%] w-2 h-full bg-white/4 blur-sm -rotate-3" />
          <div className="absolute top-0 left-[65%] w-1 h-full bg-white/4 blur-sm rotate-12" />

          {/* ── Stars — one per post ── */}
          <StarrySky count={posts.length} />

          <div className="relative z-10 text-center space-y-6 max-w-xl drop-shadow-lg">
            <h2 className="text-4xl md:text-5xl [font-family:var(--font-headline)] font-extrabold text-white leading-tight" style={{ textShadow: '0 2px 16px rgba(30,80,180,0.4)' }}>
              ความรู้สึกของคุณ
              <br />
              เปรียบดั่งดวงดาว
            </h2>
            <p className="text-white/85 text-lg font-light leading-relaxed" style={{ textShadow: '0 1px 8px rgba(30,80,180,0.3)' }}>
              พื้นที่ปลอดภัยที่คุณสามารถปลดปล่อยความในใจ
              <br />
              ท่ามกลางหมู่ดาวที่พร้อมรับฟัง
            </p>
          </div>
        </section>

        {/* Mood Entry Card */}
        <div className="max-w-4xl mx-auto -mt-10 relative z-20 px-6">
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_32px_rgba(78,124,95,0.12)]">
            <MoodEntryForm />
          </div>
        </div>

        {/* Feed Section */}
        <section className="max-w-4xl mx-auto mt-12 px-6 space-y-8">
          <div className="flex items-end justify-between border-b-2 border-[#f5eed8] pb-4">
            <h3 className="text-2xl [font-family:var(--font-headline)] font-bold text-[#4e7c5f]">
              ความรู้สึกจากผู้คน
            </h3>
            <span className="text-sm text-[#9a8b7a]">
              {posts.length > 0 ? `${posts.length} โพสต์` : "ยังไม่มีโพสต์"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {posts.length === 0 && (
              <div className="text-center py-16 text-[#9a8b7a]">
                <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">
                  auto_awesome
                </span>
                <p>เป็นคนแรกที่แบ่งปันความรู้สึก</p>
              </div>
            )}

            {posts.map((post) => {
              const colors = moodPalette[post.mood] ?? moodPalette.blue;
              return (
                <div
                  key={post.id}
                  className="bg-[#f5eed8] rounded-xl p-8 space-y-6 relative overflow-hidden group"
                >
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-bl-[100%] transition-all group-hover:scale-110"
                    style={{ backgroundColor: colors.blob }}
                  />
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: colors.dot }}
                    />
                    <span className="text-xs text-[#9a8b7a]">
                      {timeAgo(post.createdAt)} • ไม่ระบุตัวตน
                    </span>
                  </div>
                  <p className="text-lg leading-relaxed text-[#332b1f] font-light">
                    &ldquo;{post.content}&rdquo;
                  </p>
                  <CandleButton postId={post.id} initialCount={post.candles} />
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <BottomNav />

      {/* FAB */}
      <button className="fixed bottom-24 right-6 w-16 h-16 bg-linear-to-tr from-[#4e7c5f] to-[#c2e3c8] text-[#f4faf6] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 md:hidden">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </>
  );
}
