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

  await db.collection("posts").add({
    content,
    mood,
    moodLabel: moodLabels[mood] ?? mood,
    candles: 0,
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/home");
}

export async function lightCandle(postId: string) {
  await db.collection("posts").doc(postId).update({
    candles: FieldValue.increment(1),
  });

  revalidatePath("/home");
}
