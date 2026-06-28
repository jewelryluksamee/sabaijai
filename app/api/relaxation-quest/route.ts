import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `คุณคือ Sabaijai AI ผู้ช่วยด้านสุขภาพจิตที่อบอุ่นและเห็นอกเห็นใจ
ผู้ใช้เพิ่งทำเควสผ่อนคลายและตอบคำถามมา งานของคุณคือ:
- รับฟังสิ่งที่ผู้ใช้แชร์และตอบสนองอย่างอบอุ่น จริงใจ ไม่ตัดสิน
- ชื่นชมความพยายามของพวกเขาในการดูแลจิตใจ
- ต่อยอดจากสิ่งที่พวกเขาบอก ไม่ใช่แค่พูดกว้าง ๆ
- ใช้ภาษาไทยที่เป็นธรรมชาติ อ่อนโยน ไม่แข็งทื่อ
- ตอบสั้น ๆ 2-3 ประโยค อาจจบด้วยคำถามเปิดที่ชวนให้คิดต่อ
- ห้ามให้คำแนะนำทางการแพทย์หรือจิตวิทยาเชิงเทคนิค
- หากเนื้อหาบ่งชี้ความเสี่ยง ให้แนะนำสายด่วน 1323 อย่างอ่อนโยน`;

export async function POST(request: Request) {
  const { quest, answer } = await request.json();

  if (!quest || !answer || typeof answer !== "string" || !answer.trim()) {
    return Response.json({ error: "Missing quest or answer" }, { status: 400 });
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    systemInstruction: SYSTEM_PROMPT,
  });

  const prompt = `เควสที่ผู้ใช้ทำ: "${quest}"\nคำตอบของผู้ใช้: "${answer.trim()}"`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  return Response.json({ reply: text });
}
