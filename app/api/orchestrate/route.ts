import { NextResponse } from "next/server";
import { detectIntent } from "@/lib/orchestrator";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const prompt = body.prompt;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const result = await detectIntent(prompt);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Orchestrator error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process request",
      },
      { status: 500 }
    );
  }
}