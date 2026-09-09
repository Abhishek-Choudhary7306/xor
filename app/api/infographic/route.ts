import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

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
        {
          error:
            "Cloudflare credentials are not configured",
        },
        { status: 500 }
      );
    }

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: `
You are an expert infographic designer.

Create ONE concise image-generation prompt for this topic:

${prompt}

Choose the most appropriate infographic structure based on
the topic. Do NOT automatically use a bar chart.

Possible structures include:
- history → timeline
- process → flowchart
- comparison → side-by-side comparison
- statistics → appropriate chart
- hierarchy → tree/levels
- cycle → circular diagram
- concept → central concept with connections
- geography → map-style layout
- benefits/features → icon cards
- cause/effect → connected diagram
- categories → organized cards
- general → editorial infographic

The visual structure must match the topic.

Do not invent facts or statistics that the user did not provide.

Create a professional, readable infographic with:
- clear title
- concise labels
- strong hierarchy
- appropriate diagrams, icons, arrows or charts
- balanced spacing
- clean modern editorial design
- dark/neutral professional aesthetic
- high readability

IMPORTANT:
Return ONLY the image-generation prompt.

Keep the entire response UNDER 1500 characters.
      `,
    });

    const imagePrompt =
      interaction.output_text?.trim();

    if (!imagePrompt) {
      throw new Error(
        "Gemini did not return an infographic prompt."
      );
    }

    const safeImagePrompt =
      imagePrompt.slice(0, 2000);

    console.log(
      "Infographic prompt length:",
      safeImagePrompt.length
    );

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: safeImagePrompt,
          steps: 4,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Cloudflare infographic API error:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Cloudflare infographic generation failed",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data?.result?.image) {
      throw new Error(
        "Cloudflare returned no infographic image."
      );
    }

    return NextResponse.json({
      success: true,
      infographic: `data:image/jpeg;base64,${data.result.image}`,
    });
  } catch (error) {
    console.error(
      "Infographic generation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate infographic",
      },
      { status: 500 }
    );
  }
}