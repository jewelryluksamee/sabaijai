import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase-admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `คุณคือ Sabaijai AI ผู้ช่วยด้านสุขภาพจิตที่อบอุ่น เห็นอกเห็นใจ และพูดภาษาไทยเป็นหลัก
งานของคุณคือตอบสนองต่อความรู้สึกที่ผู้ใช้แชร์มา โดย:
- ไม่ต้องพิมพ์ว่าเข้าใจแล้ว เชิงนี้
- ยอมรับและรับฟังความรู้สึกของพวกเขาโดยไม่ตัดสิน
- ให้กำลังใจอย่างจริงใจและอ่อนโยน
- ใช้ภาษาที่อ่อนโยน อบอุ่น เป็นธรรมชาติ ไม่แข็งทื่อ
- ตอบสั้นๆ 2-3 ประโยค ไม่ต้องยาวเกินไป
- ห้ามให้คำแนะนำทางการแพทย์หรือจิตวิทยาเชิงเทคนิค
- หากเป็น CRITICAL_RISK ให้แนะนำให้ติดต่อสายด่วนสุขภาพจิต 1323 อย่างอ่อนโยน`;

export async function POST(request: Request) {
  const { postId, content, emotion } = await request.json();

  if (!content || typeof content !== "string") {
    return Response.json({ error: "Missing content" }, { status: 400 });
  }

  // Return cached response from Firestore if available
  if (postId) {
    const doc = await db.collection("posts").doc(postId).get();
    const cached = doc.data()?.aiResponse;
    if (cached) {
      return Response.json({ text: cached });
    }
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    systemInstruction: SYSTEM_PROMPT,
  });

  const prompt = `ผู้ใช้รู้สึก: ${emotion ?? "NEUTRAL"}\nข้อความ: "${content}"`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Persist so future loads skip generation
  if (postId) {
    await db.collection("posts").doc(postId).update({ aiResponse: text });
  }

  return Response.json({ text });
}
