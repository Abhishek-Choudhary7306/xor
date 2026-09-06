import PDFDocument from "pdfkit";
import { ai } from "@/lib/gemini";

type PDFPlan = {
  title: string;
  subtitle: string;
  sections: {
    heading: string;
    body: string;
  }[];
};

function parseJSON(raw: string): PDFPlan {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const plan = JSON.parse(cleaned) as PDFPlan;

  if (!plan.title || !Array.isArray(plan.sections)) {
    throw new Error("Gemini returned an invalid PDF plan.");
  }

  return plan;
}

export async function generatePDF(prompt: string): Promise<Buffer> {
  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input: `
Create content for a professional PDF based on this request:

"${prompt}"

Return ONLY valid JSON in this format:

{
  "title": "Document title",
  "subtitle": "Short subtitle",
  "sections": [
    {
      "heading": "Section heading",
      "body": "Section content"
    }
  ]
}

Rules:
- Create 4-8 useful sections.
- Keep the writing clear and concise.
- Do not use markdown.
- Do not include code fences.
`,
  });

  const raw = interaction.output_text?.trim();

  if (!raw) {
    throw new Error("Gemini returned an empty PDF plan.");
  }

  const plan = parseJSON(raw);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "A4",
      margin: 56,
      info: {
        Title: plan.title,
        Author: "AI Studio",
        Subject: prompt,
      },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(26).font("Helvetica-Bold").text(plan.title);
    doc.moveDown(0.5);
    doc.fontSize(12).font("Helvetica").fillColor("666666").text(plan.subtitle);
    doc.fillColor("000000");
    doc.moveDown(1.5);

    for (const section of plan.sections) {
      doc.fontSize(17).font("Helvetica-Bold").text(section.heading);
      doc.moveDown(0.35);
      doc.fontSize(11).font("Helvetica").text(section.body, {
        align: "left",
        lineGap: 4,
      });
      doc.moveDown(1.1);
    }

    doc.end();
  });
}
