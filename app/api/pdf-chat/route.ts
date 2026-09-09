import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const prompt = formData.get("prompt");
    const file = formData.get("file");

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          error: "Prompt is required",
        },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "PDF file is required",
        },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error: "Only PDF files are supported",
        },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 50 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "PDF must be smaller than 50 MB",
        },
        { status: 400 }
      );
    }

    console.log("Uploading PDF to Gemini:", file.name);

    const pdfBuffer = Buffer.from(
      await file.arrayBuffer()
    );

    const pdfBase64 = pdfBuffer.toString("base64");

    console.log("Sending PDF directly to Gemini...");

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: [
        {
          type: "text",
          text: prompt,
        },
        {
          type: "document",
          data: pdfBase64,
          mime_type: "application/pdf",
        },
      ],
    });

    const text = interaction.output_text?.trim();

    if (!text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (error) {
    console.error(
      "PDF Gemini error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process PDF",
      },
      { status: 500 }
    );
  }
}