import { ai } from "@/lib/gemini";

export type Intent =
  | "chat"
  | "ppt"
  | "image"
  | "pdf"
  | "unknown";

export type OrchestratorResult = {
  intent: Intent;
  reasoning: string;
};

export async function detectIntent(
  prompt: string
): Promise<OrchestratorResult> {
  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",

    input: `
You are an intent classifier.

Classify the user request into exactly one of these categories:

chat
ppt
image
pdf
unknown

Rules:

ppt = creating/generating a PowerPoint presentation.

image = generating/creating/editing an image.

pdf = analyzing, summarizing, extracting from, or converting a PDF.

chat = normal questions, explanations, coding help, or conversation.

unknown = anything that doesn't clearly fit.

Return ONLY this JSON:

{
  "intent": "ppt",
  "reasoning": "The user wants a PowerPoint presentation."
}

User request:
${prompt}
`,
  });

  const raw = interaction.output_text?.trim();

  console.log("ORCHESTRATOR RAW RESPONSE:");
  console.log(raw);

  if (!raw) {
    throw new Error("Gemini returned an empty response.");
  }

  // Remove markdown code fences if Gemini adds them
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const result = JSON.parse(cleaned);

    const validIntents: Intent[] = [
      "chat",
      "ppt",
      "image",
      "pdf",
      "unknown",
    ];

    if (!validIntents.includes(result.intent)) {
      throw new Error(`Invalid intent: ${result.intent}`);
    }

    return {
      intent: result.intent,
      reasoning: result.reasoning || "",
    };
  } catch (error) {
    console.error("Failed to parse Gemini classification.");
    console.error("Raw Gemini response:", raw);

    throw new Error(
      `Gemini classification could not be parsed. Raw response: ${raw}`
    );
  }
}