import Anthropic from "@anthropic-ai/sdk";

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
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a specialized Emotion Detection Engine. Analyze the user's input and classify it into exactly one of these categories:

[HAPPY]: Joy, success, or satisfaction.
[SAD]: Disappointment, grief, or low mood.
[ANGRY]: Frustration, annoyance, or rage.
[ANXIOUS]: Worry, stress, or uncertainty.
[BURNOUT]: Chronic exhaustion, loss of motivation, or feeling "empty."
[NEUTRAL]: Facts, general info, or no clear emotion.
[CRITICAL_RISK]: Thoughts of self-harm, suicide, or extreme hopelessness.

Output Requirements:
Return ONLY a JSON object.
If the category is CRITICAL_RISK, set trigger_popup to true.
Include a score (0.0 to 1.0) and a brief reason.

Example output:
{"category":"SAD","score":0.82,"reason":"Expresses grief and low mood.","trigger_popup":false}`;

export async function POST(request: Request) {
  const { content } = await request.json();

  if (!content || typeof content !== "string") {
    return Response.json({ error: "Missing content" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();

  // Extract JSON even if model wraps it in markdown fences
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: "Invalid AI response" }, { status: 502 });
  }

  const result: EmotionResult = JSON.parse(jsonMatch[0]);
  return Response.json(result);
}
