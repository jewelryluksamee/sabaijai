"use server";

import { db, auth } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";

async function getSessionUserId(): Promise<string | null> {
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
  | "gray"
  | "black"
  | "white";

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
  black:  "ดำ",
  white:  "ขาว"
};

export async function submitPost(formData: FormData): Promise<{ aiText: string; triggerPopup: boolean }> {
  const content = (formData.get("content") as string)?.trim();
  const mood = formData.get("mood") as MoodColor;

  if (!content || !mood) return { aiText: "", triggerPopup: false };

  // Detect emotion + generate AI response in a single Gemini call
  let emotion: string | null = null;
  let emotionScore: number | null = null;
  let triggerPopup = false;
  let aiText = "";
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
      aiText = data.aiText ?? "";
    }
  } catch {
    // emotion stays null — not blocking
  }

  const userId = await getSessionUserId();

  await db.collection("posts").add({
    content,
    mood,
    moodLabel: moodLabels[mood] ?? mood,
    candles: 0,
    createdAt: FieldValue.serverTimestamp(),
    ...(userId ? { userId } : {}),
    ...(emotion ? { emotion, emotionScore, triggerPopup } : {}),
    ...(aiText ? { aiResponse: aiText } : {}),
  });

  revalidatePath("/home");
  return { aiText, triggerPopup };
}

export async function lightCandle(postId: string) {
  await db.collection("posts").doc(postId).update({
    candles: FieldValue.increment(1),
  });

  revalidatePath("/home");
}

export async function submitFeedback(formData: FormData): Promise<{ ok: boolean }> {
  const rating = parseInt(formData.get("rating") as string, 10);
  const category = (formData.get("category") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!rating || !category) return { ok: false };

  const userId = await getSessionUserId();

  await db.collection("feedback").add({
    rating,
    category,
    message: message || null,
    createdAt: FieldValue.serverTimestamp(),
    ...(userId ? { userId } : {}),
  });

  return { ok: true };
}
