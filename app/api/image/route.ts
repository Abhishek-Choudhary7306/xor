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

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "Cloudflare credentials are not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          steps: 4,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Cloudflare image API error:", errorText);

      return NextResponse.json(
        {
          error: "Cloudflare image generation failed",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data?.result?.image) {
      throw new Error("Cloudflare returned no image.");
    }

    return NextResponse.json({
      success: true,
      image: `data:image/jpeg;base64,${data.result.image}`,
    });
  } catch (error) {
    console.error("Image generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate image",
      },
      { status: 500 }
    );
  }
}