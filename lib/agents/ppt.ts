import pptxgen from "pptxgenjs";
import { ai } from "@/lib/gemini";

type Slide = {
  title: string;
  bullets: string[];
};

type PresentationPlan = {
  title: string;
  subtitle: string;
  slides: Slide[];
};

export async function generatePPT(prompt: string): Promise<Buffer> {
  // Ask Gemini to create the presentation content
  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",

    input: `
Create a PowerPoint presentation based on this request:

"${prompt}"

The presentation must contain EXACTLY 6 slides TOTAL.

The first slide should be the title/introduction slide.

The remaining 5 slides should explain the topic logically.

Return ONLY valid JSON in this exact format:

{
  "title": "Presentation title",
  "subtitle": "Short subtitle",
  "slides": [
    {
      "title": "Slide title",
      "bullets": [
        "Point one",
        "Point two",
        "Point three"
      ]
    }
  ]
}

Rules:
- Exactly 6 slides.
- 3-5 concise bullet points per slide.
- Slide 1 should introduce the topic.
- Make the content useful and logically structured.
- Do not use markdown.
`,
  });

  const raw = interaction.output_text.trim();

  console.log("PPT GEMINI RESPONSE:");
  console.log(raw);

  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const plan: PresentationPlan = JSON.parse(cleaned);

  if (!plan.slides || plan.slides.length !== 6) {
    throw new Error(
      `Expected 6 slides but Gemini generated ${plan.slides?.length ?? 0}.`
    );
  }

  // Create PowerPoint
  const pptx = new pptxgen();

  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "AI Studio";
  pptx.company = "AI Studio";
  pptx.subject = prompt;
  pptx.title = plan.title;

  // Generate all 6 slides
  for (let i = 0; i < plan.slides.length; i++) {
    const slide = plan.slides[i];

    const pptSlide = pptx.addSlide();

    pptSlide.background = {
      color: "050505",
    };

    // Slide number
    pptSlide.addText(`${i + 1} / 6`, {
      x: 11.5,
      y: 0.35,
      w: 1,
      h: 0.3,
      fontSize: 10,
      color: "777777",
      align: "right",
    });

    // Title
    pptSlide.addText(slide.title, {
      x: 0.8,
      y: i === 0 ? 2.2 : 0.8,
      w: 11.7,
      h: 0.7,
      fontSize: i === 0 ? 32 : 26,
      bold: true,
      color: "FFFFFF",
      align: i === 0 ? "center" : "left",
    });

    // Subtitle on first slide
    if (i === 0) {
      pptSlide.addText(plan.subtitle, {
        x: 1.2,
        y: 3.2,
        w: 10.6,
        h: 0.5,
        fontSize: 16,
        color: "AAAAAA",
        align: "center",
      });
    }

    // Bullet points
    const bulletText = slide.bullets.map((bullet) => ({
      text: bullet,
      options: {
        bullet: {
          indent: 18,
        },
        hanging: 4,
      },
    }));

    pptSlide.addText(bulletText, {
      x: 1,
      y: i === 0 ? 4.2 : 1.9,
      w: 10.8,
      h: 4,
      fontSize: 18,
      color: "DDDDDD",
      breakLine: true,
      paraSpaceAfterPt: 16,
    });
  }

  const buffer = await pptx.write({
    outputType: "nodebuffer",
  });

  return buffer as Buffer;
}