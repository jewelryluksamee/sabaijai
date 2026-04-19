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

async function main() {
  const snapshot = await db.collection("posts").orderBy("createdAt", "desc").limit(1).get();

  if (snapshot.empty) {
    console.log("✗ ไม่พบโพสใดเลย");
    return;
  }

  const doc = snapshot.docs[0];
  const old = doc.data().emotion ?? "ไม่มี";
  await doc.ref.update({
    emotion: "BURNOUT",
    emotionScore: 0.85,
    triggerPopup: false,
  });
  console.log(`✓ ${doc.id}: ${old} → BURNOUT`);
  console.log(`  "${doc.data().content.slice(0, 70)}"`);

  console.log("\nเสร็จแล้ว");
}

main().catch(console.error);
