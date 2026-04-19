// Run: node --env-file=.env.local scripts/recheck-neutral-posts.mjs
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
NEUTRAL     รายงานสิ่งที่เกิดขึ้นล้วนๆ ไม่มีอารมณ์แทรกเลย
CRITICAL_RISK  พูดถึงการทำร้ายตัวเอง อยากตาย ไม่อยากมีชีวิตอยู่

─── กฎตัดสิน ───
• สงสัยระหว่าง ANXIOUS กับ NEUTRAL → เลือก ANXIOUS เสมอ
• สงสัยระหว่าง SAD กับ NEUTRAL → เลือก SAD เสมอ
• NEUTRAL ใช้เฉพาะเมื่อข้อความเป็นกลาง 100% ไม่มีอารมณ์ใดๆ

─── ตัวอย่าง ───
"ไม่รู้จะสอบผ่านไหมนะ" → ANXIOUS
"กลัวว่าจะทำพลาด" → ANXIOUS
"เครียดเรื่องงานมากเลย" → ANXIOUS
"ไม่แน่ใจว่าเขาจะโกรธไหม" → ANXIOUS
"คิดมากเรื่องนี้อยู่เลย" → ANXIOUS
"วันนี้ฝนตก" → NEUTRAL
"กินข้าวแล้ว" → NEUTRAL
"เหนื่อยมากแล้ว ไม่อยากทำอะไรเลย" → BURNOUT
"เศร้าจังเลย คิดถึงเขามาก" → SAD
"โกรธมากเลยที่เขาทำแบบนี้" → ANGRY

─── การตอบสนอง ───
ตอบภาษาไทย อ่อนโยน อบอุ่น 2-3 ประโยค รับฟังไม่ตัดสิน ไม่ให้คำแนะนำทางการแพทย์
ถ้า CRITICAL_RISK แนะนำสายด่วน 1323 อย่างอ่อนโยน
ห้ามขึ้นต้นว่า "เข้าใจแล้ว" หรือ "รับทราบ"

─── รูปแบบคำตอบ (JSON เท่านั้น) ───
{"category":"<HAPPY|SAD|ANGRY|ANXIOUS|BURNOUT|NEUTRAL|CRITICAL_RISK>","score":0.0,"reason":"เหตุผลสั้นๆ","trigger_popup":false,"aiText":"ข้อความตอบกลับภาษาไทย"}`;

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  systemInstruction: SYSTEM_PROMPT,
});

async function detectEmotion(content) {
  const result = await model.generateContent(content);
  const raw = result.response.text().trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response");
  return JSON.parse(jsonMatch[0]);
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const snapshot = await db
    .collection("posts")
    .where("emotion", "==", "NEUTRAL")
    .get();

  console.log(`พบโพส NEUTRAL ทั้งหมด ${snapshot.size} โพส`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of snapshot.docs) {
    const { content } = doc.data();
    if (!content) { skipped++; continue; }

    try {
      const result = await detectEmotion(content);
      if (result.category !== "NEUTRAL") {
        await doc.ref.update({
          emotion: result.category,
          emotionScore: result.score,
          triggerPopup: result.trigger_popup ?? false,
          aiResponse: result.aiText,
        });
        console.log(`✓ ${doc.id}: NEUTRAL → ${result.category}`);
        updated++;
      } else {
        skipped++;
      }
      await sleep(200); // rate limit
    } catch (err) {
      console.error(`✗ ${doc.id}:`, err.message);
      failed++;
    }
  }

  console.log(`\nเสร็จแล้ว: อัปเดต ${updated} | ยังเฉยๆ ${skipped} | ผิดพลาด ${failed}`);
}

main().catch(console.error);
