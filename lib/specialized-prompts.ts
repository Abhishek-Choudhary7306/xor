export type SpecializedType =
  | "linkedin"
  | "x"
  | "advisory";

export const specializedSchemas = {
  linkedin: {
    type: "object",
    properties: {
      platform: { type: "string" },
      title: { type: "string" },
      hook: { type: "string" },
      content: { type: "string" },
      call_to_action: { type: "string" },
      hashtags: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "platform",
      "title",
      "hook",
      "content",
      "call_to_action",
      "hashtags",
    ],
  },

  x: {
    type: "object",
    properties: {
      platform: { type: "string" },
      type: {
        type: "string",
        enum: ["post", "thread"],
      },
      hook: { type: "string" },
      posts: {
        type: "array",
        items: { type: "string" },
      },
      call_to_action: { type: "string" },
      hashtags: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "platform",
      "type",
      "hook",
      "posts",
      "call_to_action",
      "hashtags",
    ],
  },

  advisory: {
    type: "object",
    properties: {
      type: { type: "string" },
      summary: { type: "string" },
      key_points: {
        type: "array",
        items: { type: "string" },
      },
      opportunities: {
        type: "array",
        items: { type: "string" },
      },
      risks: {
        type: "array",
        items: { type: "string" },
      },
      recommendations: {
        type: "array",
        items: { type: "string" },
      },
      next_steps: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "type",
      "summary",
      "key_points",
      "opportunities",
      "risks",
      "recommendations",
      "next_steps",
    ],
  },
} as const;

export function buildSpecializedPrompt(
  type: SpecializedType,
  userPrompt: string
) {
  const instructions = {
    linkedin: `
You are an expert LinkedIn content strategist.

Create a professional, engaging LinkedIn post from the user's request.

Prioritize:
- A strong opening hook
- Useful insight
- Natural professional language
- A clear call to action
- Appropriate LinkedIn length
- Relevant hashtags

Do not invent statistics, quotes, companies, achievements, or facts.
Do not use excessive hashtags.
The content should be suitable for posting directly on LinkedIn.
`,

    x: `
You are an expert X content strategist.

Create high-impact X content from the user's request.

Decide whether the request is best served by:
- One concise X post
- A short thread

Keep every post readable and platform-appropriate.

Do not invent statistics, quotes, companies, achievements, or facts.
Avoid unnecessary filler.
`,

    advisory: `
You are a senior strategic advisor.

Analyze the user's request clearly and practically.

Separate:
- Key observations
- Opportunities
- Risks
- Recommendations
- Concrete next steps

Prioritize actionable advice.
Do not invent facts that are not present in the user's request.
`,

  } as const;

  return `
${instructions[type]}

USER REQUEST:
${userPrompt}

Return the result using the supplied JSON schema.
Do not return markdown.
Do not return explanations outside the JSON object.
`;
}