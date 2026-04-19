// Run: node --env-file=.env.local scripts/force-set-emotion.mjs
// Force-sets emotion fields directly without calling AI (use when API is down)
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

const TARGETS = [
  { fragment: "ผมเองที่อยากปลอบคนคุยผมที่ยังลืมคนเก่าไม่ได้", emotion: "ANXIOUS" },
  { fragment: "สุขภาพแย่ลงมากๆ เมื่อวานเกือบวูบ", emotion: "ANXIOUS" },
];

async function main() {
  const snapshot = await db.collection("posts").orderBy("createdAt", "desc").limit(100).get();

  for (const target of TARGETS) {
    const doc = snapshot.docs.find((d) => (d.data().content ?? "").includes(target.fragment));
    if (!doc) {
      console.log(`✗ ไม่พบโพส: "${target.fragment.slice(0, 40)}..."`);
      continue;
    }
    const old = doc.data().emotion ?? "ไม่มี";
    await doc.ref.update({
      emotion: target.emotion,
      emotionScore: 0.85,
      triggerPopup: false,
    });
    console.log(`✓ ${doc.id}: ${old} → ${target.emotion}`);
    console.log(`  "${doc.data().content.slice(0, 70)}"`);
  }

  console.log("\nเสร็จแล้ว");
}

main().catch(console.error);
