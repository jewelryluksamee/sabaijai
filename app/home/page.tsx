import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MoodEntryForm from "@/components/MoodEntryForm";
import StarrySky from "@/components/StarrySky";
import FlyingImages from "@/components/FlyingImages";
import HomeFeed from "@/components/HomeFeed";
import { db } from "@/lib/firebase-admin";
import { type EmotionCategory } from "@/lib/emotions";

type Post = {
  id: string;
  content: string;
  mood: string;
  moodLabel: string;
  candles: number;
  createdAt: string;
  emotion?: EmotionCategory;
};

async function getPosts(): Promise<Post[]> {
  const snapshot = await db
    .collection("posts")
    .orderBy("createdAt", "desc")
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
        <section className="relative w-full h-64 sky-gradient overflow-hidden flex flex-col justify-center items-center px-6 border border-black">

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
            <h2 className="text-2xl md:text-4xl [font-family:var(--font-display)] font-bold text-white/90 leading-tight drop-shadow-lg" style={{ textShadow: "0 2px 24px rgba(80,60,160,0.5)" }}>
              คุณไม่ได้อยู่คนเดียวนะ🌟
            </h2>
            <p className="text-white/60 text-lg [font-family:var(--font-display)] leading-relaxed" style={{ textShadow: "0 1px 12px rgba(60,40,120,0.4)" }}>
              พื้นที่ตรงนี้จะเป็นไหล่ให้คุณพักพิง <br/> ในวันที่โลกข้างนอกมันใจร้ายเกินไป
            </p>
          </div>
        </section>

        {/* Mood Entry Card */}
        <div className="max-w-4xl mx-auto -mt-10 relative z-20 px-6">
          <div className="bg-white rounded-xl p-8 border border-black shadow-[0_4px_32px_rgba(78,124,95,0.12)]">
            <MoodEntryForm />
          </div>
        </div>

        <HomeFeed posts={posts} />
      </main>

      <BottomNav />
    </>
  );
}
