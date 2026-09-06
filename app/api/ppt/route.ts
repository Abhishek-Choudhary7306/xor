import { generatePPT } from "@/lib/agents/ppt";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const prompt = body.prompt;

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const ppt = await generatePPT(prompt);

    return new Response(ppt as BodyInit, {
      status: 200,

      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",

        "Content-Disposition":
          'attachment; filename="ai-studio-presentation.pptx"',
      },
    });
  } catch (error) {
    console.error("PPT generation error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate presentation",
      },
      { status: 500 }
    );
  }
}