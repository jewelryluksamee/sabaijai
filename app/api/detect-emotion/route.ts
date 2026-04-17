import { GoogleGenerativeAI } from "@google/generative-ai";

export type EmotionCategory =
  | "HAPPY"
  | "SAD"
  | "ANGRY"
  | "ANXIOUS"
  | "BURNOUT"
  | "NEUTRAL"
  | "CRITICAL_RISK";

export type EmotionResult = {
  category: EmotionCategory;
  score: number;
  reason: string;
  trigger_popup: boolean;
  aiText: string;
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `คุณคือ Sabaijai AI ทำสองหน้าที่พร้อมกันในคำตอบเดียว:

1. วิเคราะห์อารมณ์จากข้อความ และจำแนกเป็นหนึ่งในนี้:
   HAPPY | SAD | ANGRY | ANXIOUS | BURNOUT | NEUTRAL | CRITICAL_RISK

2. ตอบสนองด้วย 2-3 ประโยคที่อ่อนโยนและอบอุ่น
   - ตรวจสอบภาษาของข้อความที่ user ส่งมา แล้วตอบกลับด้วยภาษาเดียวกัน (ถ้า user พิมพ์ภาษาอังกฤษ ให้ตอบเป็นภาษาอังกฤษ / ถ้า user พิมพ์ภาษาไทย ให้ตอบเป็นภาษาไทย)
   - รับฟังโดยไม่ตัดสิน
   - ห้ามให้คำแนะนำทางการแพทย์
   - หาก CRITICAL_RISK ให้แนะนำสายด่วน 1323 อย่างอ่อนโยน
   - ไม่ต้องขึ้นต้นว่า "เข้าใจแล้ว" หรือ "รับทราบ" หรือ "I understand" หรือ "Noted"

ตอบเป็น JSON เท่านั้น:
{"category":"NEUTRAL","score":0.0,"reason":"brief reason","trigger_popup":false,"aiText":"response in the same language as the user's message"}`;

export async function POST(request: Request) {
  const { content } = await request.json();

  if (!content || typeof content !== "string") {
    return Response.json({ error: "Missing content" }, { status: 400 });
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent(content);
  const raw = result.response.text().trim();

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: "Invalid AI response" }, { status: 502 });
  }

  const parsed: EmotionResult = JSON.parse(jsonMatch[0]);
  return Response.json(parsed);
}
