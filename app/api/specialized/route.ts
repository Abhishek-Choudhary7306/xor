import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import {
  buildSpecializedPrompt,
  specializedSchemas,
  type SpecializedType,
} from "@/lib/specialized-prompts";

const VALID_TYPES: SpecializedType[] = [
  "linkedin",
  "x",
  "advisory",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const type = body.type;
    const prompt = body.prompt;

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid specialized action" },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (prompt.length > 10000) {
      return NextResponse.json(
        { error: "Prompt is too long" },
        { status: 400 }
      );
    }

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",

      input: buildSpecializedPrompt(
        type,
        prompt
      ),

      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: specializedSchemas[type],
      },
    });

    const text = interaction.output_text?.trim();

    if (!text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    let structured;

    try {
      structured = JSON.parse(text);
    } catch {
      throw new Error(
        "Gemini returned invalid structured output."
      );
    }

    return NextResponse.json({
      success: true,
      type,
      data: structured,
    });
  } catch (error) {
    console.error(
      "Specialized Gemini error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate specialized content",
      },
      { status: 500 }
    );
  }
}