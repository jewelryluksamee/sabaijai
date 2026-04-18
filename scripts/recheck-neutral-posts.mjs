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

const SYSTEM_PROMPT = `คุณคือ Sabaijai AI ทำสองหน้าที่พร้อมกันในคำตอบเดียว:

1. วิเคราะห์อารมณ์จากข้อความ และจำแนกเป็นหนึ่งในนี้ โดยใช้เกณฑ์ด้านล่างอย่างเคร่งครัด:

   HAPPY — รู้สึกดี มีความสุข ตื่นเต้น ภูมิใจ สนุก ชอบ ยินดี
   SAD — เศร้า เสียใจ ผิดหวัง คิดถึง เหงา โดดเดี่ยว หดหู่
   ANGRY — โกรธ หงุดสายใจ ไม่พอใจ รำคาญ ไม่ยุติธรรม ฉุน
   ANXIOUS — กังวล วิตก คิดมาก ไม่แน่ใจ กลัว เครียด กลุ้มใจ ห่วง ไม่สบายใจ ลุ้น กลัวผิดพลาด
   BURNOUT — หมดแรง อ่อนเพลีย ท้อ เหนื่อยมาก ไม่อยากทำอะไร ไม่มีพลัง ยอมแพ้
   NEUTRAL — พูดถึงเรื่องทั่วไป รายงานสถานการณ์ ไม่แสดงอารมณ์ชัดเจน หรืออารมณ์ผสมที่ไม่โดดเด่น
   CRITICAL_RISK — พูดถึงการทำร้ายตัวเอง อยากตาย ไม่อยากมีชีวิตอยู่ สิ้นหวังอย่างรุนแรง

   หมายเหตุสำคัญ: ถ้าข้อความแสดงความกังวล ความไม่แน่ใจ ความเครียด หรือความกลัวแม้เพียงเล็กน้อย ให้เลือก ANXIOUS ไม่ใช่ NEUTRAL

2. ตอบสนองด้วยภาษาไทยที่อ่อนโยน อบอุ่น 2-3 ประโยค
   - รับฟังโดยไม่ตัดสิน
   - ห้ามให้คำแนะนำทางการแพทย์
   - หาก CRITICAL_RISK ให้แนะนำสายด่วน 1323 อย่างอ่อนโยน
   - ไม่ต้องขึ้นต้นว่า "เข้าใจแล้ว" หรือ "รับทราบ"

ตอบเป็น JSON เท่านั้น:
{"category":"NEUTRAL","score":0.0,"reason":"brief reason","trigger_popup":false,"aiText":"ข้อความตอบกลับภาษาไทย"}`;

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
