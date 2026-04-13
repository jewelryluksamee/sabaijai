import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MoodEntryForm from "@/components/MoodEntryForm";
import CandleButton from "@/components/CandleButton";
import { db } from "@/lib/firebase-admin";

type Post = {
  id: string;
  content: string;
  mood: string;
  moodLabel: string;
  candles: number;
  createdAt: string;
};

const moodColors: Record<string, { bg: string; text: string; accent: string }> = {
  yellow: { bg: "bg-yellow-400/10", text: "text-yellow-800", accent: "bg-yellow-400/20 text-yellow-800" },
  blue: { bg: "bg-blue-400/10", text: "text-blue-800", accent: "bg-blue-400/20 text-[#0e5881]" },
  red: { bg: "bg-red-400/10", text: "text-red-800", accent: "bg-red-400/20 text-red-800" },
  purple: { bg: "bg-purple-400/10", text: "text-purple-800", accent: "bg-purple-400/20 text-[#4b386e]" },
  green: { bg: "bg-green-400/10", text: "text-green-800", accent: "bg-green-400/20 text-[#2f5b36]" },
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
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url(https://lh3.googleusercontent.com/aida-public/AB6AXuBaUKoZHVwRk9rzvgVWEwzBladU0EcbQhTrhOV5ArvFKouGbUJKUr7w4Du6DOUYUAyYwfFo4WHuzK1Rbvp3w-pI_HHYDkhMBuOxrzFWGDViPrcm_MVZySyzz_WwsT8APx0G-hIgBh0i2kxAQXd2ZYwYPIB0ecxppOw44lvyhaW8HpCpdPAgIRiaeImQRJpmw9JD6MoBV6s5jgacVtYOp9pvVOnN3yjnXv0lV5nNH6QVvrfPxHZZh2_mTFD46Tjs6WcTwTWl5E3ZW7vC)",
            }}
          />
          {/* Floating Stars */}
          <div className="absolute top-20 left-[15%] w-2 h-2 bg-white rounded-full blur-[1px] opacity-60" />
          <div className="absolute top-40 left-[40%] w-1 h-1 bg-white rounded-full blur-[0.5px] opacity-80" />
          <div className="absolute top-10 right-[25%] w-2 h-2 bg-white rounded-full blur-[1px] opacity-40" />
          <div className="absolute top-32 right-[10%] w-1 h-1 bg-white rounded-full blur-[0.5px] opacity-70" />
          <div className="absolute bottom-20 left-[30%] w-1.5 h-1.5 bg-[#d6beff] rounded-full blur-[1px] opacity-50" />

          <div className="relative z-10 text-center space-y-6 max-w-xl">
            <h2 className="text-4xl md:text-5xl [font-family:var(--font-headline)] font-extrabold text-white leading-tight">
              ความรู้สึกของคุณ
              <br />
              เปรียบดั่งดวงดาว
            </h2>
            <p className="text-white/80 text-lg font-light leading-relaxed">
              พื้นที่ปลอดภัยที่คุณสามารถปลดปล่อยความในใจ
              <br />
              ท่ามกลางหมู่ดาวที่พร้อมรับฟัง
            </p>
          </div>
        </section>

        {/* Mood Entry Card */}
        <div className="max-w-4xl mx-auto -mt-10 relative z-20 px-6">
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_32px_rgba(105,85,142,0.12)]">
            <MoodEntryForm />
          </div>
        </div>

        {/* Feed Section */}
        <section className="max-w-4xl mx-auto mt-12 px-6 space-y-8">
          <div className="flex items-end justify-between border-b-2 border-[#f8f2f6] pb-4">
            <h3 className="text-2xl [font-family:var(--font-headline)] font-bold text-[#69558e]">
              ความรู้สึกจากผู้คน
            </h3>
            <span className="text-sm text-[#7e797e]">
              {posts.length > 0 ? `${posts.length} โพสต์` : "ยังไม่มีโพสต์"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {posts.length === 0 && (
              <div className="text-center py-16 text-[#7e797e]">
                <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">
                  auto_awesome
                </span>
                <p>เป็นคนแรกที่แบ่งปันความรู้สึก</p>
              </div>
            )}

            {posts.map((post) => {
              const colors = moodColors[post.mood] ?? moodColors.blue;
              return (
                <div
                  key={post.id}
                  className="bg-[#f8f2f6] rounded-xl p-8 space-y-6 relative overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} rounded-bl-[100%] transition-all group-hover:scale-110`} />
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full ${colors.accent} text-xs font-bold uppercase tracking-widest`}>
                      {post.moodLabel}
                    </span>
                    <span className="text-xs text-[#7e797e]">
                      {timeAgo(post.createdAt)} • ไม่ระบุตัวตน
                    </span>
                  </div>
                  <p className="text-lg leading-relaxed text-[#353136] font-light">
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
      <button className="fixed bottom-24 right-6 w-16 h-16 bg-linear-to-tr from-[#69558e] to-[#d6beff] text-[#fef7ff] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 md:hidden">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </>
  );
}
