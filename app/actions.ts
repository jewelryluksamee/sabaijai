"use server";

import { db } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

export type MoodColor =
  | "red"
  | "orange"
  | "yellow"
  | "lime"
  | "green"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "gray";

const moodLabels: Record<MoodColor, string> = {
  red:    "แดง",
  orange: "ส้ม",
  yellow: "เหลือง",
  lime:   "เขียวมะนาว",
  green:  "เขียว",
  teal:   "เขียวอมฟ้า",
  cyan:   "ฟ้าอมเขียว",
  blue:   "น้ำเงิน",
  indigo: "คราม",
  purple: "ม่วง",
  pink:   "ชมพู",
  gray:   "เทา",
};

export async function submitPost(formData: FormData) {
  const content = (formData.get("content") as string)?.trim();
  const mood = formData.get("mood") as MoodColor;

  if (!content || !mood) return;

  // Detect emotion with AI (fire-and-forget on failure)
  let emotion: string | null = null;
  let emotionScore: number | null = null;
  let triggerPopup = false;
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/detect-emotion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const data = await res.json();
      emotion = data.category ?? null;
      emotionScore = data.score ?? null;
      triggerPopup = data.trigger_popup ?? false;
    }
  } catch {
    // emotion stays null — not blocking
  }

  await db.collection("posts").add({
    content,
    mood,
    moodLabel: moodLabels[mood] ?? mood,
    candles: 0,
    createdAt: FieldValue.serverTimestamp(),
    ...(emotion ? { emotion, emotionScore, triggerPopup } : {}),
  });

  revalidatePath("/home");
}

export async function lightCandle(postId: string) {
  await db.collection("posts").doc(postId).update({
    candles: FieldValue.increment(1),
  });

  revalidatePath("/home");
}
