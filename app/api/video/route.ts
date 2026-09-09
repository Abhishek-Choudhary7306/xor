import { NextResponse } from "next/server";

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

    if (prompt.length > 10000) {
      return NextResponse.json(
        { error: "Prompt is too long" },
        { status: 400 }
      );
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        {
          error: "Cloudflare credentials are not configured",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "lightricks/ltx-2-5-fast",
          input: {
            prompt,
            duration: 8,
            resolution: "1280x720",
            fps: 24,
            generate_audio: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Cloudflare video API error:",
        errorText
      );

      return NextResponse.json(
        {
          error: "Cloudflare video generation failed",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log("Cloudflare video response:", data);

    const videoUrl = data?.result?.video;

    if (!videoUrl) {
      throw new Error(
        "Cloudflare returned no video URL."
      );
    }

    return NextResponse.json({
      success: true,
      video: videoUrl,
    });
  } catch (error) {
    console.error(
      "Video generation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate video",
      },
      { status: 500 }
    );
  }
}