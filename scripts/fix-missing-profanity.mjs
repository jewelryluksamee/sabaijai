// Run: node --env-file=.env.local scripts/fix-missing-profanity.mjs
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

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  systemInstruction: `ตรวจสอบว่าข้อความภาษาไทยนี้มีคำหยาบหรือไม่ คำหยาบ = คำด่า คำสาแช่ง หรือคำที่หยาบคายอย่างชัดเจน
ตอบเป็น JSON เท่านั้น: {"has_profanity":false}`,
});

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const snapshot = await db.collection("posts").get();
  const missing = snapshot.docs.filter((d) => d.data().hasProfanity === undefined);

  console.log(`พบโพสที่ไม่มี hasProfanity: ${missing.length} โพส`);

  let updated = 0;
  let failed = 0;

  for (const doc of missing) {
    const { content } = doc.data();
    if (!content) { failed++; continue; }

    try {
      const result = await model.generateContent(content);
      const raw = result.response.text().trim();
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
      const hasProfanity = parsed.has_profanity ?? false;

      await doc.ref.update({ hasProfanity });

      const flag = hasProfanity ? "🔴 มีคำหยาบ" : "⚪ ปกติ";
      console.log(`✓ ${doc.id}: ${flag} | ${content.slice(0, 50)}`);
      updated++;
      await sleep(200);
    } catch (err) {
      console.error(`✗ ${doc.id}:`, err.message);
      failed++;
    }
  }

  console.log(`\nเสร็จแล้ว: อัปเดต ${updated} | ผิดพลาด ${failed}`);
}

main().catch(console.error);
