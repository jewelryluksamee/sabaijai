import Header from "@/components/Header";
import PostHistory from "@/components/PostHistory";
import BottomNav from "@/components/BottomNav";
import { db, auth } from "@/lib/firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

import { type EmotionCategory, emotionChartConfig as emotionConfig, moodColorMap } from "@/lib/emotions";

type PostData = { content: string; mood: string; emotion: EmotionCategory; createdAt: Date; aiResponse?: string };
type AIInsight = { summary: string; tips: string[]; quote: string };
type DailyEmotionSummary = { dominant: EmotionCategory | null; counts: Partial<Record<EmotionCategory, number>>; total: number };

async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;
    if (!sessionCookie) return null;
    const decoded = await auth.verifySessionCookie(sessionCookie);
    return decoded.uid;
  } catch {
    return null;
  }
}

async function getUserPosts(userId: string, since?: Date): Promise<PostData[]> {
  let query = db
    .collection("posts")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc");

  if (since) query = query.where("createdAt", ">=", since) as typeof query;

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      content: data.content ?? "",
      mood: data.mood ?? "blue",
      emotion: (data.emotion ?? "NEUTRAL") as EmotionCategory,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      aiResponse: data.aiResponse ?? undefined,
    };
  });
}

function getDailyEmotionSummary(posts: PostData[], date: Date): DailyEmotionSummary {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const filtered = posts.filter((p) => p.createdAt >= dayStart && p.createdAt <= dayEnd);
  const counts: Partial<Record<EmotionCategory, number>> = {};
  for (const p of filtered) {
    counts[p.emotion] = (counts[p.emotion] ?? 0) + 1;
  }
  const total = filtered.length;
  const dominant = total > 0
    ? (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as EmotionCategory)
    : null;
  return { dominant, counts, total };
}

async function generateGeminiInsight(posts: PostData[]): Promise<AIInsight> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    systemInstruction: `You are a compassionate Thai mental wellness AI assistant named Sabaijai.
Analyze weekly mood posts and return ONLY a JSON object with exactly these keys:
- "summary": 2-3 sentence empathetic insight about the week's emotional patterns (Thai, warm encouraging tone)
- "tips": array of exactly 2 specific actionable coping strategies (Thai, each under 80 characters)
- "quote": one short inspirational quote in Thai (under 50 characters, no attribution)`,
  });

  const postsText = posts
    .slice(0, 20)
    .map((p, i) => `${i + 1}. [${p.emotion}] "${p.content}"`)
    .join("\n");

  const result = await model.generateContent(`Posts from this week:\n${postsText}`);
  const raw = result.response.text().trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Gemini response");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "สัปดาห์นี้มีความรู้สึกหลากหลาย",
    tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 2).map(String) : ["ดูแลสุขภาพจิตของตัวเอง", "พักผ่อนให้เพียงพอ"],
    quote: typeof parsed.quote === "string" ? parsed.quote : "ทุกความรู้สึกล้วนมีคุณค่า",
  };
}

async function getOrRefreshInsight(userId: string, posts: PostData[]): Promise<AIInsight> {
  const total = posts.length;
  const fallback: AIInsight = {
    summary: "ยังไม่มีข้อมูลในสัปดาห์นี้ เริ่มบันทึกความรู้สึกของคุณเพื่อรับการวิเคราะห์เชิงลึก",
    tips: [
      "เริ่มบันทึกความรู้สึกประจำวันเพื่อติดตามรูปแบบอารมณ์ของตัวเอง",
      "แบ่งปันความรู้สึกกับชุมชนเพื่อรับกำลังใจ",
    ],
    quote: "ทุกความรู้สึกที่เกิดขึ้น คือสัญญาณของการมีอยู่และการเติบโตที่งดงามเสมอ",
  };

  if (total === 0) return fallback;

  const insightRef = db.collection("insights").doc(userId);
  const insightDoc = await insightRef.get();
  const cached = insightDoc.data();
  const cachedCount: number = cached?.generatedAtCount ?? 0;

  // Regenerate every 3 new posts (at counts 3, 6, 9, …)
  const shouldRegenerate = Math.floor(total / 3) > Math.floor(cachedCount / 3);

  if (!shouldRegenerate && cached?.summary) {
    return {
      summary: cached.summary,
      tips: cached.tips ?? fallback.tips,
      quote: cached.quote ?? fallback.quote,
    };
  }

  if (total < 3 && !cached?.summary) {
    // Not yet enough posts for first generation
    return {
      ...fallback,
      summary: `มีบันทึก ${total} รายการแล้ว อีก ${3 - total} รายการจะได้รับการวิเคราะห์ AI ครั้งแรก`,
    };
  }

  const insight = await generateGeminiInsight(posts);

  await insightRef.set({
    ...insight,
    generatedAtCount: total,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return insight;
}

export default async function InsightPage() {
  const userId = await getCurrentUserId();

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [weeklyPosts, allPosts] = await Promise.all([
    userId ? getUserPosts(userId, sevenDaysAgo) : Promise.resolve([]),
    userId ? getUserPosts(userId) : Promise.resolve([]),
  ]);

  // stats always based on 7-day posts
  const posts = weeklyPosts;
  const todaySummary = getDailyEmotionSummary(posts, now);
  const yesterdaySummary = getDailyEmotionSummary(posts, yesterday);
  const total = posts.length;

  // --- Emotion distribution ---
  const emotionCounts: Partial<Record<EmotionCategory, number>> = {};
  for (const post of posts) {
    emotionCounts[post.emotion] = (emotionCounts[post.emotion] ?? 0) + 1;
  }

  // Separate critical risk before chart calculations
  const criticalRiskCount = emotionCounts.CRITICAL_RISK ?? 0;
  const emotionCountsWithoutCritical = Object.fromEntries(
    (Object.entries(emotionCounts) as [EmotionCategory, number][]).filter(
      ([key]) => key !== "CRITICAL_RISK"
    )
  ) as Partial<Record<EmotionCategory, number>>;
  const totalWithoutCritical = total - criticalRiskCount;

  // Top 3 emotions for the donut chart (excluding CRITICAL_RISK)
  const top3 = (Object.entries(emotionCountsWithoutCritical) as [EmotionCategory, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Stability = (HAPPY + NEUTRAL) / totalWithoutCritical
  const stableCount = (emotionCountsWithoutCritical.HAPPY ?? 0) + (emotionCountsWithoutCritical.NEUTRAL ?? 0);
  const stabilityPct = totalWithoutCritical > 0 ? Math.round((stableCount / totalWithoutCritical) * 100) : 0;

  // --- Dominant emotion (excluding CRITICAL_RISK) ---
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

  // --- Donut chart segments (excluding CRITICAL_RISK) ---
  const donutSegments = top3.map(([emotion, count], i) => ({
    emotion,
    count,
    pct: totalWithoutCritical > 0 ? Math.round((count / totalWithoutCritical) * 100) : 0,
    offset: top3.slice(0, i).reduce(
      (sum, [, c]) => sum + (totalWithoutCritical > 0 ? Math.round((c / totalWithoutCritical) * 100) : 0),
      0
    ),
    color: emotionConfig[emotion].chartColor,
  }));

  // --- AI insight (cached, refreshes every 3 posts) ---
  let aiInsight: AIInsight;
  if (!userId) {
    aiInsight = {
      summary: "กรุณาเข้าสู่ระบบเพื่อดูการวิเคราะห์ของคุณ",
      tips: ["ลงชื่อเข้าใช้ด้วย Google เพื่อเริ่มบันทึกความรู้สึก", "ข้อมูลของคุณจะถูกเก็บเป็นความลับ"],
      quote: "ทุกความรู้สึกที่เกิดขึ้น คือสัญญาณของการมีอยู่และการเติบโตที่งดงามเสมอ",
    };
  } else {
    try {
      aiInsight = await getOrRefreshInsight(userId, posts);
    } catch {
      aiInsight = {
        summary: "สัปดาห์นี้มีความรู้สึกหลากหลาย ทุกอารมณ์ล้วนมีคุณค่าและเป็นส่วนหนึ่งของการเติบโต",
        tips: [
          "ให้เวลากับตัวเองในการรับรู้และยอมรับความรู้สึก",
          "พูดคุยกับคนที่ไว้วางใจเพื่อแบ่งเบาความรู้สึก",
        ],
        quote: "ทุกความรู้สึกที่เกิดขึ้น คือสัญญาณของการมีอยู่และการเติบโตที่งดงามเสมอ",
      };
    }
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
                <div className="space-y-4">
                  {donutSegments.map((seg) => (
                    <div key={seg.emotion} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="material-symbols-outlined text-base"
                            style={{ color: seg.color, fontVariationSettings: "'FILL' 1", fontSize: "18px" }}
                          >
                            {emotionConfig[seg.emotion].icon}
                          </span>
                          <span className="text-sm font-medium text-[#6b5e4d]">
                            {emotionConfig[seg.emotion].label}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-[#332b1f]">
                          {seg.pct}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-black/8 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dominant Emotion + Critical Risk stacked */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div
              className="rounded-xl p-8 flex flex-col justify-between border border-black relative overflow-hidden grainy-texture flex-1"
              style={{ backgroundColor: total > 0 ? dominantConfig.chartColor + "30" : "#d4e8c8" }}
            >
              <div className="relative z-10">
                <span
                  className="px-3 py-1 rounded-full border border-black text-[10px] font-bold uppercase tracking-widest"
                  style={{ backgroundColor: total > 0 ? dominantConfig.chartColor + "40" : "#fff", color: total > 0 ? dominantConfig.color : "#4a6b45" }}
                >
                  Dominant
                </span>
                <h3 className="text-2xl font-bold text-[#332b1f] mt-4" style={{ fontFamily: "var(--font-display)" }}>
                  อารมณ์หลัก:{" "}
                  {total > 0 ? dominantConfig.label : "–"}
                </h3>
                <p className="text-[#332b1f]/70 mt-2 text-sm">
                  {total > 0
                    ? `อารมณ์ "${dominantConfig.label}" ปรากฏมากที่สุดในสัปดาห์นี้ (${dominantEntry[1]} ครั้ง)`
                    : "เริ่มบันทึกความรู้สึกเพื่อดูอารมณ์หลักของคุณ"}
                </p>
              </div>
              <div className="relative z-10 flex justify-end">
                <span
                  className="material-symbols-outlined text-6xl opacity-40"
                  style={{ fontVariationSettings: "'FILL' 1", color: total > 0 ? dominantConfig.chartColor : "#4a6b45" }}
                >
                  {total > 0 ? dominantConfig.icon : "spa"}
                </span>
              </div>
            </div>

            {criticalRiskCount > 0 && (
              <div className="rounded-xl p-6 border-2 border-red-600 relative overflow-hidden" style={{ background: "rgba(232,40,40,0.07)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="material-symbols-outlined text-3xl shrink-0"
                    style={{ color: "#c00000", fontVariationSettings: "'FILL' 1" }}
                  >
                    emergency
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-700">ต้องการความช่วยเหลือ</p>
                    <p className="text-xl  font-bold text-[#332b1f]">
                      <span style={{ color: "#c00000" }}> พบ {criticalRiskCount} รายการ</span> เสี่ยงสูง
                    </p>
                  </div>
                </div>
                <a
                  href="tel:1323"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold text-sm border border-red-800 active:scale-95 transition-transform"
                  style={{ background: "linear-gradient(135deg, #c00000, #e82828)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>call</span>
                  โทรกรมสุขภาพจิต · 1323
                </a>
              </div>
            )}
          </div>

          {/* Color of the Week — now shares row with Compare */}
          <div
            className="md:col-span-4 rounded-xl p-8 text-white flex flex-col gap-6 border border-black shadow-xl relative overflow-hidden grainy-texture"
            style={{ backgroundColor: total > 0 ? dominantMoodInfo.hex : "#4e7c5f" }}
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
                {total > 0 ? `สี${dominantMoodInfo.thaiName}` : "เริ่มบันทึกเพื่อดูสีประจำตัวของคุณ"}
              </p>
            </div>
            {total > 0 && (
              <div className="w-full h-2 rounded-full bg-white/20">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${Math.round(((moodCounts[dominantMood] ?? 0) / total) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Compare Yesterday vs Today */}
          <div className="md:col-span-8 bg-white rounded-xl p-8 border border-black grainy-texture">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#c2e3c8]/40 rounded-lg border border-black">
                <span className="material-symbols-outlined text-[#4e7c5f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  compare_arrows
                </span>
              </div>
              <h3 className="text-xl font-bold font-[var(--font-display)] text-[#332b1f]">
                เปรียบเทียบอารมณ์
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Yesterday */}
              <div className="rounded-xl p-6 border border-black bg-[#f5f0e8] flex flex-col items-center gap-3 text-center">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#9a8b7a]">เมื่อวาน</p>
                {yesterdaySummary.dominant ? (
                  <>
                    <span
                      className="material-symbols-outlined text-5xl"
                      style={{ color: emotionConfig[yesterdaySummary.dominant].chartColor, fontVariationSettings: "'FILL' 1" }}
                    >
                      {emotionConfig[yesterdaySummary.dominant].icon}
                    </span>
                    <p className="text-lg font-bold text-[#332b1f]">{emotionConfig[yesterdaySummary.dominant].label}</p>
                    <p className="text-xs text-[#9a8b7a]">{yesterdaySummary.total} บันทึก</p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-5xl text-[#ccc]">sentiment_neutral</span>
                    <p className="text-sm text-[#9a8b7a] italic">ไม่มีบันทึก</p>
                  </>
                )}
              </div>
              {/* Today */}
              <div className="rounded-xl p-6 border border-black bg-[#eaf3ec] flex flex-col items-center gap-3 text-center">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#4e7c5f]">วันนี้</p>
                {todaySummary.dominant ? (
                  <>
                    <span
                      className="material-symbols-outlined text-5xl"
                      style={{ color: emotionConfig[todaySummary.dominant].chartColor, fontVariationSettings: "'FILL' 1" }}
                    >
                      {emotionConfig[todaySummary.dominant].icon}
                    </span>
                    <p className="text-lg font-bold text-[#332b1f]">{emotionConfig[todaySummary.dominant].label}</p>
                    <p className="text-xs text-[#4e7c5f]">{todaySummary.total} บันทึก</p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-5xl text-[#ccc]">sentiment_neutral</span>
                    <p className="text-sm text-[#9a8b7a] italic">ยังไม่มีบันทึก</p>
                  </>
                )}
              </div>
            </div>
            {/* Change indicator */}
            {todaySummary.dominant && yesterdaySummary.dominant && (
              <div className="mt-4 text-center">
                {todaySummary.dominant === yesterdaySummary.dominant ? (
                  <p className="text-sm text-[#6b5e4d]">
                    <span className="font-bold">อารมณ์เหมือนเดิม</span> — คุณรู้สึก{emotionConfig[todaySummary.dominant].label}ต่อเนื่อง
                  </p>
                ) : (
                  <p className="text-sm text-[#6b5e4d]">
                    อารมณ์เปลี่ยนจาก <span className="font-bold">{emotionConfig[yesterdaySummary.dominant].label}</span>
                    {" → "}
                    <span className="font-bold">{emotionConfig[todaySummary.dominant].label}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* AI Insight */}
          <div className="md:col-span-12 bg-[#f5eed8] rounded-xl p-8 space-y-6 relative border border-black">
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

        {/* Post History */}
        <PostHistory posts={allPosts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))} />

        {/* AI Quote */}
        <section className="bg-[#e8d8a8]/20 rounded-xl p-10 text-center relative overflow-hidden group border border-black grainy-texture">
          <span className="material-symbols-outlined text-[#8a7a50] mb-4 text-4xl group-hover:scale-110 transition-transform duration-500 block">
            format_quote
          </span>
          <p className="text-2xl font-[var(--font-display)] font-semibold text-[#5a4a25] leading-snug">
            &ldquo;{aiInsight.quote}&rdquo;
          </p>
          <p className="mt-4 text-[#8a7a50] font-medium">- Sabaijai AI Buddy</p>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
