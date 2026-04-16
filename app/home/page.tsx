import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MoodEntryForm from "@/components/MoodEntryForm";
import CandleButton from "@/components/CandleButton";
import StarrySky from "@/components/StarrySky";
import FlyingImages from "@/components/FlyingImages";
import { db } from "@/lib/firebase-admin";

type EmotionCategory =
  | "HAPPY"
  | "SAD"
  | "ANGRY"
  | "ANXIOUS"
  | "BURNOUT"
  | "NEUTRAL"
  | "CRITICAL_RISK";

type Post = {
  id: string;
  content: string;
  mood: string;
  moodLabel: string;
  candles: number;
  createdAt: string;
  emotion?: EmotionCategory;
};

const emotionConfig: Record<
  EmotionCategory,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  HAPPY:         { label: "มีความสุข",       icon: "sentiment_very_satisfied", bg: "rgba(240,200,50,0.15)",  text: "#c8960a", border: "rgba(240,200,50,0.5)" },
  SAD:           { label: "เศร้า",            icon: "sentiment_sad",            bg: "rgba(56,128,232,0.12)",  text: "#3063b8", border: "rgba(56,128,232,0.4)" },
  ANGRY:         { label: "โกรธ",             icon: "sentiment_very_dissatisfied", bg: "rgba(232,93,74,0.12)", text: "#c03020", border: "rgba(232,93,74,0.4)" },
  ANXIOUS:       { label: "กังวล",            icon: "warning",                  bg: "rgba(240,136,58,0.12)", text: "#b86010", border: "rgba(240,136,58,0.4)" },
  BURNOUT:       { label: "หมดแรง",           icon: "battery_0_bar",            bg: "rgba(144,72,208,0.12)", text: "#703aa0", border: "rgba(144,72,208,0.4)" },
  NEUTRAL:       { label: "เฉยๆ",             icon: "sentiment_neutral",        bg: "rgba(144,144,144,0.12)",text: "#666666", border: "rgba(144,144,144,0.4)" },
  CRITICAL_RISK: { label: "ต้องการความช่วยเหลือ", icon: "emergency",           bg: "rgba(232,40,40,0.12)",  text: "#c00000", border: "rgba(232,40,40,0.5)" },
};

const moodPalette: Record<string, { blob: string; dot: string }> = {
  red:    { blob: "rgba(232,93,74,0.18)",   dot: "#e85d4a" },
  orange: { blob: "rgba(240,136,58,0.18)",  dot: "#f0883a" },
  yellow: { blob: "rgba(240,200,50,0.18)",  dot: "#f0c832" },
  lime:   { blob: "rgba(126,208,64,0.18)",  dot: "#7ed040" },
  green:  { blob: "rgba(56,184,106,0.18)",  dot: "#38b86a" },
  teal:   { blob: "rgba(32,184,168,0.18)",  dot: "#20b8a8" },
  cyan:   { blob: "rgba(32,168,216,0.18)",  dot: "#20a8d8" },
  blue:   { blob: "rgba(56,128,232,0.18)",  dot: "#3880e8" },
  indigo: { blob: "rgba(88,88,216,0.18)",   dot: "#5858d8" },
  purple: { blob: "rgba(144,72,208,0.18)",  dot: "#9048d0" },
  pink:   { blob: "rgba(224,80,160,0.18)",  dot: "#e050a0" },
  gray:   { blob: "rgba(144,144,144,0.18)", dot: "#909090" },
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
      emotion: data.emotion ?? undefined,
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

          {/* Dark overlay for depth */}
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />

          {/* Moon glow — top right, very soft */}
          <div className="absolute top-[-50px] right-[18%] w-52 h-52 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,252,220,0.12) 0%, transparent 70%)" }} />
          <div className="absolute top-[0px] right-[21%] w-28 h-28 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,250,200,0.18) 0%, transparent 65%)" }} />

          {/* Dreamy cloud wisps — very low opacity */}
          <div className="absolute top-[12%] -left-8 w-80 h-14 bg-white/6 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-[20%] right-[-60px] w-96 h-16 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-[48%] left-[8%] w-56 h-10 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-[14%] left-[-20px] w-72 h-12 bg-white/7 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-[8%] right-[-30px] w-64 h-10 bg-white/6 rounded-full blur-2xl pointer-events-none" />

          {/* Horizon glow */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(200,210,240,0.18), transparent)" }} />

          {/* Stars — one per post */}
          <StarrySky count={posts.length} />

          {/* Flying image decorations */}
          <FlyingImages />

          <div className="relative z-10 text-center space-y-5 max-w-xl">
            <h2 className="text-4xl md:text-6xl [font-family:var(--font-display)] font-bold text-white/90 leading-tight drop-shadow-lg" style={{ textShadow: "0 2px 24px rgba(80,60,160,0.5)" }}>
              ✨คุณไม่ได้อยู่คนเดียวนะ✨
            </h2>
            <p className="text-white/60 text-xl [font-family:var(--font-display)] leading-relaxed" style={{ textShadow: "0 1px 12px rgba(60,40,120,0.4)" }}>
              พื้นที่ตรงนี้จะเป็นไหล่ให้คุณพักพิง <br/> ในวันที่โลกข้างนอกมันใจร้ายเกินไป 𖤐
            </p>
          </div>
        </section>

        {/* Mood Entry Card */}
        <div className="max-w-4xl mx-auto -mt-10 relative z-20 px-6">
          <div className="bg-white rounded-xl p-8 border border-black shadow-[0_4px_32px_rgba(78,124,95,0.12)]">
            <MoodEntryForm />
          </div>
        </div>

        {/* Feed Section */}
        <section className="max-w-4xl mx-auto mt-12 px-6 space-y-8">
          <div className="flex items-end justify-between border-b-2 border-[#f5eed8] pb-4">
            <h3 className="text-2xl [font-family:var(--font-display)] font-bold text-[#4e7c5f]">
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
              const emotion = (post.emotion ?? "NEUTRAL") as EmotionCategory;
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-xl p-8 space-y-6 relative overflow-hidden group border border-black shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
                >
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-bl-[100%] transition-all group-hover:scale-110"
                    style={{ backgroundColor: colors.blob }}
                  />
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: colors.dot }}
                      />
                      <span className="text-xs text-[#9a8b7a]">
                        {timeAgo(post.createdAt)} • ไม่ระบุตัวตน
                      </span>
                    </div>
                    <span
                      className="self-start flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border"
                      style={{
                        background: emotionConfig[emotion].bg,
                        color: emotionConfig[emotion].text,
                        borderColor: emotionConfig[emotion].border,
                      }}
                    >
                      <span className="material-symbols-outlined text-sm leading-none" style={{ fontSize: "14px" }}>
                        {emotionConfig[emotion].icon}
                      </span>
                      {emotionConfig[emotion].label}
                    </span>
                  </div>
                  <p className="text-lg leading-relaxed text-[#332b1f] font-light">
                    &ldquo;{post.content}&rdquo;
                  </p>

                  {/* AI response sub-section — tinted with the post's mood colour */}
                  <div
                    className="rounded-2xl px-5 py-4 space-y-3 border border-black"
                    style={{ background: colors.blob.replace("0.18", "0.18") }}
                  >
                    <p className="text-sm font-semibold flex items-center gap-2" style={{ color: colors.dot + "bb" }}>
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-base shrink-0"
                        style={{ background: colors.blob.replace("0.18", "0.28") }}
                      >
                        🤖
                      </span>
                      ข้อความจากใจ Sabaijai:
                    </p>
                    <p className="text-sm leading-relaxed text-[#332b1f] font-light pl-9 opacity-40 italic">
                      กำลังรับฟัง... {/* replace with API response */}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <CandleButton postId={post.id} initialCount={post.candles} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
