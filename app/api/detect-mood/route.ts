import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a music mood analyzer. Given a song title (and optionally a channel name), classify the song into exactly one mood category:

healing   - calming, comforting, soothing, gentle, lullaby
sad       - melancholic, heartbreak, emotional, tearful, lonely
happy     - upbeat, joyful, cheerful, fun, feel-good, celebratory
calm      - peaceful, relaxing, mellow, ambient, lo-fi, meditative
hype      - energetic, pump-up, intense, powerful, dance, EDM, rock anthem
nostalgic - throwback, memory-evoking, classic, vintage feel

Consider the song title language (Thai, English, etc.) and common music vibes.

Respond ONLY with valid JSON in this exact format, nothing else:
{"mood":"<category>"}`;

export async function POST(request: Request) {
  const { title, channel } = await request.json();
  if (!title || typeof title !== "string") {
    return Response.json({ error: "Missing title" }, { status: 400 });
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    systemInstruction: SYSTEM_PROMPT,
  });

  const prompt = channel ? `Song: "${title}" by ${channel}` : `Song: "${title}"`;
  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return Response.json({ error: "Invalid AI response" }, { status: 502 });

  const parsed = JSON.parse(jsonMatch[0]);
  const validMoods = ["healing", "sad", "happy", "calm", "hype", "nostalgic"];
  if (!validMoods.includes(parsed.mood)) {
    return Response.json({ mood: "calm" });
  }

  return Response.json(parsed);
}
