import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { db } from "@/lib/firebase-admin";
import Anthropic from "@anthropic-ai/sdk";

type EmotionCategory =
  | "HAPPY"
  | "SAD"
  | "ANGRY"
  | "ANXIOUS"
  | "BURNOUT"
  | "NEUTRAL"
  | "CRITICAL_RISK";

const emotionConfig: Record<
  EmotionCategory,
  { label: string; icon: string; color: string; chartColor: string }
> = {
  HAPPY:         { label: "มีความสุข",              icon: "sentiment_very_satisfied",    color: "#c8960a", chartColor: "#f0c832" },
  SAD:           { label: "เศร้า",                   icon: "sentiment_sad",               color: "#3063b8", chartColor: "#3880e8" },
  ANGRY:         { label: "โกรธ",                    icon: "sentiment_very_dissatisfied", color: "#c03020", chartColor: "#e85d4a" },
  ANXIOUS:       { label: "กังวล",                   icon: "warning",                     color: "#b86010", chartColor: "#f0883a" },
  BURNOUT:       { label: "หมดแรง",                  icon: "battery_0_bar",               color: "#703aa0", chartColor: "#9048d0" },
  NEUTRAL:       { label: "เฉยๆ",                    icon: "sentiment_neutral",           color: "#4a6b45", chartColor: "#4e7c5f" },
  CRITICAL_RISK: { label: "ต้องการความช่วยเหลือ",   icon: "emergency",                   color: "#c00000", chartColor: "#e82828" },
};

const moodColorMap: Record<string, { hex: string; thaiName: string; meaning: string; icon: string }> = {
  red:    { hex: "#e85d4a", thaiName: "แดง",         meaning: "ความมีพลังและความกล้าหาญ",  icon: "local_fire_department" },
  orange: { hex: "#f0883a", thaiName: "ส้ม",         meaning: "ความอบอุ่นและความสนุกสนาน", icon: "wb_sunny" },
  yellow: { hex: "#f0c832", thaiName: "เหลือง",      meaning: "ความสดใสและความหวัง",        icon: "star" },
  lime:   { hex: "#7ed040", thaiName: "เขียวมะนาว", meaning: "ความสดชื่นและพลังงานใหม่",   icon: "eco" },
  green:  { hex: "#38b86a", thaiName: "เขียว",       meaning: "ความสงบและการเยียวยา",       icon: "spa" },
  teal:   { hex: "#20b8a8", thaiName: "เขียวอมฟ้า", meaning: "ความสมดุลและความชัดเจน",    icon: "water_drop" },
  cyan:   { hex: "#20a8d8", thaiName: "ฟ้าอมเขียว", meaning: "ความผ่อนคลายและอิสระ",      icon: "air" },
  blue:   { hex: "#3880e8", thaiName: "น้ำเงิน",     meaning: "ความสงบนิ่งและความน่าเชื่อถือ", icon: "water" },
  indigo: { hex: "#5858d8", thaiName: "คราม",        meaning: "ความลึกซึ้งและสติปัญญา",    icon: "psychology" },
  purple: { hex: "#9048d0", thaiName: "ม่วง",        meaning: "ความสร้างสรรค์และจินตนาการ", icon: "auto_awesome" },
  pink:   { hex: "#e050a0", thaiName: "ชมพู",        meaning: "ความรักและความอ่อนโยน",      icon: "favorite" },
  gray:   { hex: "#909090", thaiName: "เทา",         meaning: "ความสงบเงียบและการพักผ่อน",  icon: "cloud" },
};

type PostData = { content: string; mood: string; emotion: EmotionCategory };

async function getWeeklyPosts(): Promise<PostData[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const snapshot = await db
    .collection("posts")
    .where("createdAt", ">=", sevenDaysAgo)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      content: data.content ?? "",
      mood: data.mood ?? "blue",
      emotion: (data.emotion ?? "NEUTRAL") as EmotionCategory,
    };
  });
}

async function generateAIInsight(posts: PostData[]): Promise<{ summary: string; tips: string[] }> {
  if (posts.length === 0) {
    return {
      summary:
        "ยังไม่มีข้อมูลในสัปดาห์นี้ เริ่มบันทึกความรู้สึกของคุณเพื่อรับการวิเคราะห์เชิงลึก",
      tips: [
        "เริ่มบันทึกความรู้สึกประจำวันเพื่อติดตามรูปแบบอารมณ์ของตัวเอง",
        "แบ่งปันความรู้สึกกับชุมชนเพื่อรับกำลังใจ",
      ],
    };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const postsText = posts
    .slice(0, 20)
    .map((p, i) => `${i + 1}. [${p.emotion}] "${p.content}"`)
    .join("\n");

  const systemPrompt = `You are a compassionate Thai mental wellness AI assistant named Sabaijai.
Analyze the weekly mood posts and provide a supportive weekly insight in Thai language.
Return ONLY a JSON object with exactly these keys:
- "summary": A 2-3 sentence empathetic insight about the week's overall emotional patterns (in Thai, warm and encouraging tone)
- "tips": Array of exactly 2 specific, actionable coping strategies (in Thai, each under 80 characters)`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: `Posts from this week:\n${postsText}` }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      summary: "สัปดาห์นี้มีความรู้สึกหลากหลาย ทุกอารมณ์ล้วนมีคุณค่าและเป็นส่วนหนึ่งของการเติบโต",
      tips: [
        "ให้เวลากับตัวเองในการรับรู้และยอมรับความรู้สึก",
        "พูดคุยกับคนที่ไว้วางใจเพื่อแบ่งเบาความรู้สึก",
      ],
    };
  }

  const result = JSON.parse(jsonMatch[0]);
  return {
    summary:
      typeof result.summary === "string"
        ? result.summary
        : "สัปดาห์นี้มีความรู้สึกหลากหลาย",
    tips: Array.isArray(result.tips)
      ? result.tips.slice(0, 2).map(String)
      : ["ดูแลสุขภาพจิตของตัวเอง", "พักผ่อนให้เพียงพอ"],
  };
}

export default async function InsightPage() {
  const posts = await getWeeklyPosts();
  const total = posts.length;

  // --- Emotion distribution ---
  const emotionCounts: Partial<Record<EmotionCategory, number>> = {};
  for (const post of posts) {
    emotionCounts[post.emotion] = (emotionCounts[post.emotion] ?? 0) + 1;
  }

  // Top 3 emotions for the donut chart
  const top3 = (Object.entries(emotionCounts) as [EmotionCategory, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Stability = (HAPPY + NEUTRAL) / total — how "positive/balanced" the week is
  const stableCount = (emotionCounts.HAPPY ?? 0) + (emotionCounts.NEUTRAL ?? 0);
  const stabilityPct = total > 0 ? Math.round((stableCount / total) * 100) : 0;

  // --- Dominant emotion ---
  const dominantEntry = top3[0] ?? (["NEUTRAL", 0] as [EmotionCategory, number]);
  const dominantEmotion = dominantEntry[0] as EmotionCategory;
  const dominantConfig = emotionConfig[dominantEmotion];

  // --- Dominant mood color ---
  const moodCounts: Record<string, number> = {};
  for (const post of posts) {
    moodCounts[post.mood] = (moodCounts[post.mood] ?? 0) + 1;
  }
  const dominantMood =
    Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "green";
  const dominantMoodInfo = moodColorMap[dominantMood] ?? moodColorMap.green;

  // --- Donut chart segments ---
  const donutColors = ["#4a6b45", "#4e7c5f", "#8a7a50"];
  let cumulativePct = 0;
  const donutSegments = top3.map(([emotion, count], i) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const segment = {
      emotion,
      count,
      pct,
      offset: cumulativePct,
      color: donutColors[i],
    };
    cumulativePct += pct;
    return segment;
  });

  // --- AI insight ---
  let aiInsight: { summary: string; tips: string[] };
  try {
    aiInsight = await generateAIInsight(posts);
  } catch {
    aiInsight = {
      summary:
        "สัปดาห์นี้มีความรู้สึกหลากหลาย ทุกอารมณ์ล้วนมีคุณค่าและเป็นส่วนหนึ่งของการเติบโต",
      tips: [
        "ให้เวลากับตัวเองในการรับรู้และยอมรับความรู้สึก",
        "พูดคุยกับคนที่ไว้วางใจเพื่อแบ่งเบาความรู้สึก",
      ],
    };
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto space-y-10">
        {/* Hero */}
        <section className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-[var(--font-display)] font-extrabold tracking-tight text-[#332b1f]">
            Insight
          </h2>
          <p className="text-[#6b5e4d] text-lg max-w-lg leading-relaxed">
            สำรวจอารมณ์ของคุณผ่านข้อมูลและพลังของ AI
            เพื่อความเข้าใจตนเองที่ลึกซึ้งยิ่งขึ้น
          </p>
          {total > 0 && (
            <p className="text-[#9a8b7a] text-sm">
              วิเคราะห์จาก {total} บันทึกในช่วง 7 วันที่ผ่านมา
            </p>
          )}
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Mood Donut Chart */}
          <div className="md:col-span-8 bg-white rounded-xl p-8 flex flex-col md:flex-row items-center gap-10 border border-black shadow-[0_-4px_32px_rgba(78,124,95,0.06)] relative overflow-hidden grainy-texture">
            <div className="relative w-48 h-48 flex-shrink-0">
              {total === 0 ? (
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="stroke-[#e5e5e5]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeDasharray="100, 100"
                    strokeWidth="4"
                  />
                </svg>
              ) : (
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {donutSegments.map((seg) => (
                    <path
                      key={seg.emotion}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={seg.color}
                      strokeDasharray={`${seg.pct}, 100`}
                      strokeDashoffset={`-${seg.offset}`}
                      strokeWidth="4"
                    />
                  ))}
                </svg>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-[var(--font-display)] text-[#332b1f]">
                  {total === 0 ? "–" : `${stabilityPct}%`}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#6b5e4d] font-medium">
                  {total === 0 ? "No data" : "Stable"}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-bold font-[var(--font-display)] text-[#332b1f]">
                สัดส่วนอารมณ์ของคุณ
              </h3>
              {total === 0 ? (
                <p className="text-sm text-[#9a8b7a] italic">
                  ยังไม่มีบันทึกในสัปดาห์นี้
                </p>
              ) : (
                <div className="space-y-3">
                  {donutSegments.map((seg) => (
                    <div
                      key={seg.emotion}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-sm font-medium text-[#6b5e4d]">
                          {emotionConfig[seg.emotion].label}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#332b1f]">
                        {seg.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dominant Emotion */}
          <div className="md:col-span-4 bg-[#d4e8c8] rounded-xl p-8 flex flex-col justify-between border border-black relative overflow-hidden grainy-texture">
            <div className="relative z-10">
              <span className="bg-white/40 backdrop-blur-md px-3 py-1 rounded-full border border-black text-[10px] font-bold text-[#4a6b45] uppercase tracking-widest">
                Dominant
              </span>
              <h3 className="text-2xl font-bold font-[var(--font-display)] text-[#2a4d32] mt-4">
                อารมณ์หลัก:{" "}
                {total > 0 ? dominantConfig.label : "–"}
              </h3>
              <p className="text-[#2a4d32]/80 mt-2 text-sm">
                {total > 0
                  ? `อารมณ์ "${dominantConfig.label}" ปรากฏมากที่สุดในสัปดาห์นี้ (${dominantEntry[1]} ครั้ง)`
                  : "เริ่มบันทึกความรู้สึกเพื่อดูอารมณ์หลักของคุณ"}
              </p>
            </div>
            <div className="relative z-10 flex justify-end">
              <span
                className="material-symbols-outlined text-6xl text-[#4a6b45] opacity-40"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {total > 0 ? dominantConfig.icon : "spa"}
              </span>
            </div>
          </div>

          {/* Color of the Week */}
          <div
            className="md:col-span-4 rounded-xl p-8 text-white flex flex-col gap-6 border border-black shadow-xl relative overflow-hidden grainy-texture"
            style={{
              backgroundColor:
                total > 0 ? dominantMoodInfo.hex : "#4e7c5f",
            }}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 border border-black flex items-center justify-center">
              <span className="material-symbols-outlined text-white">
                {total > 0 ? dominantMoodInfo.icon : "palette"}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold font-[var(--font-display)]">
                สีประจำตัวสัปดาห์นี้
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {total > 0
                  ? `สี${dominantMoodInfo.thaiName}สื่อถึง${dominantMoodInfo.meaning}`
                  : "เริ่มบันทึกเพื่อดูสีประจำตัวของคุณ"}
              </p>
            </div>
            {total > 0 && (
              <div className="flex gap-2">
                <div className="w-full h-2 rounded-full bg-white/20">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{
                      width: `${Math.round(
                        ((moodCounts[dominantMood] ?? 0) / total) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* AI Insight */}
          <div className="md:col-span-8 bg-[#f5eed8] rounded-xl p-8 space-y-6 relative border border-black">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#c2e3c8]/40 rounded-lg border border-black">
                <span
                  className="material-symbols-outlined text-[#4e7c5f]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
              </div>
              <h3 className="text-xl font-bold font-[var(--font-display)] text-[#332b1f]">
                AI สรุปใจความสำคัญ
              </h3>
            </div>
            <div className="space-y-4">
              <p className="text-[#6b5e4d] leading-relaxed italic border-l-4 border-[#4e7c5f]/30 pl-4">
                &ldquo;{aiInsight.summary}&rdquo;
              </p>
              <div className="bg-white rounded-lg p-5 space-y-3 border border-black">
                <h4 className="text-sm font-bold text-[#4e7c5f] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    lightbulb
                  </span>
                  วิธีรับมือ (How to cope)
                </h4>
                <ul className="space-y-2">
                  {aiInsight.tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#6b5e4d]">
                      <span className="w-5 h-5 rounded-full bg-[#d4e8c8] border border-black text-[#4a6b45] flex items-center justify-center shrink-0 text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <section className="bg-[#e8d8a8]/20 rounded-xl p-10 text-center relative overflow-hidden group border border-black grainy-texture">
          <span className="material-symbols-outlined text-[#8a7a50] mb-4 text-4xl group-hover:scale-110 transition-transform duration-500 block">
            format_quote
          </span>
          <p className="text-2xl font-[var(--font-display)] font-semibold text-[#5a4a25] leading-snug">
            "ทุกความรู้สึกที่เกิดขึ้น คือสัญญาณของการมีอยู่{" "}
            <br className="hidden md:block" />
            และการเติบโตที่งดงามเสมอ"
          </p>
          <p className="mt-4 text-[#8a7a50] font-medium">- Sabaijai AI Buddy</p>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
