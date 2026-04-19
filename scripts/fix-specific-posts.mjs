// Run: node --env-file=.env.local scripts/fix-specific-posts.mjs
// Force-sets emotion to ANXIOUS for posts matching specific content fragments
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `คุณคือ Sabaijai AI วิเคราะห์อารมณ์จากข้อความภาษาไทย แล้วตอบสนองด้วยความเข้าใจ

─── หมวดอารมณ์ ───
HAPPY       รู้สึกดี มีความสุข ตื่นเต้น ภูมิใจ สนุก ชอบ ยินดี
SAD         เศร้า เสียใจ ผิดหวัง คิดถึง เหงา โดดเดี่ยว หดหู่
ANGRY       โกรธ หงุดสายใจ ไม่พอใจ รำคาญ ไม่ยุติธรรม ฉุน อารมณ์เสีย
ANXIOUS     กังวล วิตก คิดมาก ไม่แน่ใจ กลัว เครียด กลุ้มใจ ห่วง ลุ้น ตื่นเต้นแบบกลัว
BURNOUT     หมดแรง อ่อนเพลีย ท้อแท้ เหนื่อยมาก ไม่อยากทำอะไร ไม่มีพลัง ยอมแพ้
NEUTRAL     รายงานสิ่งที่เกิดขึ้นล้วนๆ ไม่มีอารมณ์แทรกเลย หรือ รู้สึกเรื่อยๆ ปล่อยๆ ไม่กดดัน ไม่คิดมาก
CRITICAL_RISK  พูดถึงการทำร้ายตัวเอง อยากตาย ไม่อยากมีชีวิตอยู่

─── กฎตัดสิน ───
• สงสัยระหว่าง ANXIOUS กับ NEUTRAL → เลือก ANXIOUS เสมอ ยกเว้น ถ้า tone ประโยคออกแนวเรื่อยๆ/ปล่อยๆ ไม่มีความกดดันชัดเจน → NEUTRAL
• สงสัยระหว่าง SAD กับ NEUTRAL → เลือก SAD เสมอ
• NEUTRAL ใช้เมื่อข้อความเป็นกลางไม่มีอารมณ์ใดๆ หรือ tone เรื่อยๆ ปล่อยๆ ไม่ได้คิดมากหรือกังวลจริงๆ

─── แยก NEUTRAL กับ ANXIOUS โดยดูรูปประโยค ───
ANXIOUS: มี "object" ของความกังวลชัดเจน + มีความกดดันหรือห่วงใยแฝง
  → "ไม่รู้จะสอบผ่านไหม" (object = สอบ), "กลัวว่าเขาจะโกรธ" (object = เขา)
NEUTRAL: ไม่มี object ให้กังวล + tone เบา ปล่อยๆ ไม่กดดันตัวเอง
  → "ไม่รู้เหมือนกัน" (ไม่มี object), "ยังไงก็ได้" (ไม่สน), "ดูๆไปก่อน" (ปล่อยๆ)
สัญญาณ NEUTRAL: "ก็...แหละ" / "...มั้ง" / "ยังไงก็ได้" / "แล้วแต่" / "ไม่ซีเรียส" โดยไม่มีสิ่งที่กังวลแนบมา
สัญญาณ ANXIOUS: "กลัว" / "ลุ้น" / "ห่วง" / "กังวล" / "ไม่แน่ใจว่า[สิ่งนั้น]" / "ไม่รู้ว่า[สิ่งนั้น]จะ..." ที่มี object ชัดเจน
• กังวลลึกๆ = ANXIOUS เสมอ แม้ใช้คำเบาๆ หรือพยายามทำเป็นเฉยๆ
  → "คงโอเคมั้ง" / "น่าจะผ่านได้แหละ" / "คงไม่เป็นไรหรอก" / "ก็แค่รอดูแหละ ไม่รู้จะออกมายังไง" → ANXIOUS
  ต่างจาก "ยังไงก็ได้" / "แล้วแต่" ที่ไม่มี object และไม่ได้ reassure ตัวเอง → NEUTRAL

─── ตัวอย่าง ───
"ไม่รู้จะสอบผ่านไหมนะ" → ANXIOUS
"กลัวว่าจะทำพลาด" → ANXIOUS
"เครียดเรื่องงานมากเลย" → ANXIOUS
"ไม่แน่ใจว่าเขาจะโกรธไหม" → ANXIOUS
"คิดมากเรื่องนี้อยู่เลย" → ANXIOUS
"วันนี้ฝนตก" → NEUTRAL
"กินข้าวแล้ว" → NEUTRAL
"วันนี้ก็ปกติ" → NEUTRAL
"เฉยๆแหละ" → NEUTRAL
"วันนี้ก็เรื่อยๆมั้ง ไม่รู้จะเป็นไง" → NEUTRAL
"ก็ปล่อยๆไปแหละ ไม่ได้คิดอะไรมาก" → NEUTRAL
"ดูๆไปก่อน" → NEUTRAL
"ยังไงก็ได้" → NEUTRAL
"เป็นยังไงก็เป็นงั้นแหละ" → NEUTRAL
"ไม่ซีเรียส" → NEUTRAL
"เหนื่อยมากแล้ว ไม่อยากทำอะไรเลย" → BURNOUT
"เศร้าจังเลย คิดถึงเขามาก" → SAD
"โกรธมากเลยที่เขาทำแบบนี้" → ANGRY

─── ตรวจจับคำหยาบ ───
has_profanity = true ถ้าข้อความมีคำหยาบรุนแรง เช่น คำด่า คำสาแช่ง หรือคำที่หยาบคายอย่างชัดเจน

─── การตอบสนอง ───
ตอบภาษาไทย อ่อนโยน อบอุ่น 2-3 ประโยค รับฟังไม่ตัดสิน ไม่ให้คำแนะนำทางการแพทย์
ถ้า CRITICAL_RISK แนะนำสายด่วน 1323 อย่างอ่อนโยน
ห้ามขึ้นต้นว่า "เข้าใจแล้ว" หรือ "รับทราบ"

─── รูปแบบคำตอบ (JSON เท่านั้น) ───
{"category":"<HAPPY|SAD|ANGRY|ANXIOUS|BURNOUT|NEUTRAL|CRITICAL_RISK>","score":0.0,"reason":"เหตุผลสั้นๆ","trigger_popup":false,"has_profanity":false,"aiText":"ข้อความตอบกลับภาษาไทย"}`;

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  systemInstruction: SYSTEM_PROMPT,
});

// fragments to search for — partial match is enough
const TARGET_FRAGMENTS = [
  "ผมเองที่อยากปลอบคนคุยผมที่ยังลืมคนเก่าไม่ได้",
  "สุขภาพแย่ลงมากๆ เมื่อวานเกือบวูบ",
];

async function detectEmotion(content) {
  const result = await model.generateContent(content);
  const raw = result.response.text().trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response");
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  const snapshot = await db.collection("posts").orderBy("createdAt", "desc").limit(100).get();

  const targets = snapshot.docs.filter((doc) => {
    const content = doc.data().content ?? "";
    return TARGET_FRAGMENTS.some((frag) => content.includes(frag));
  });

  if (targets.length === 0) {
    console.log("ไม่พบโพสที่ตรงกัน ลอง limit มากขึ้นหรือตรวจสอบ fragment");
    return;
  }

  console.log(`พบ ${targets.length} โพส\n`);

  for (const doc of targets) {
    const { content, emotion: oldEmotion } = doc.data();
    try {
      const result = await detectEmotion(content);
      await doc.ref.update({
        emotion: result.category,
        emotionScore: result.score,
        triggerPopup: result.trigger_popup ?? false,
        hasProfanity: result.has_profanity ?? false,
        aiResponse: result.aiText,
      });
      console.log(`✓ ${doc.id}: ${oldEmotion ?? "ไม่มี"} → ${result.category}`);
      console.log(`  "${content.slice(0, 70)}"`);
    } catch (err) {
      console.error(`✗ ${doc.id}:`, err.message);
    }
  }

  console.log("\nเสร็จแล้ว");
}

main().catch(console.error);
