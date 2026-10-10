import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { planSchema, type PlanInput, type Plan, type RegenMode } from "./sipstory-schema";

const MODEL = "openai/gpt-6-astra";

export class GatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function buildPrompt(input: PlanInput, mode: RegenMode, previous?: Plan | null) {
  const base = `Create a short-form beverage video content plan.
Drink: ${input.drinkName}
Category: ${input.category}
Platform: ${input.platform}
Duration: ${input.duration} seconds
Aesthetic: ${input.aesthetic}
Audience: ${input.audience}
Format: ${input.format}
Extra details: ${input.extras || "none"}

Rules:
- hooks: exactly 3 — types "Curiosity", "Relatable / Funny", "Aesthetic / Emotional"; each under 15 words, for the first 1-3 seconds.
- script: tailored to the format. Voiceover → spoken narration lines. Text on Screen → exact overlay text. ASMR → visual + sound cues, no narration. Talking to Camera → conversational dialogue. Fit naturally in ${input.duration}s.
- shots: 5-9 shots; first starts at 0, each starts where previous ended, last ends at exactly ${input.duration}. No gaps or overlaps. Customize to this drink.
- caption: natural, a few emojis, clear call to action. hashtags: 8-12 items, each starting with #.
- alternatives: exactly 2 different concepts.
- productionNotes.filmingTips: 3-5 beginner tips.`;
  if (mode === "full" || !previous) return base;
  const what = {
    hooks: "three completely NEW hooks (different from the previous ones)",
    script: "a completely NEW script and matching shot breakdown",
    caption: "a completely NEW caption and hashtag set",
    aesthetic: "",
  }[mode];
  return `${base}\n\nPrevious plan (JSON): ${JSON.stringify(previous)}\nGenerate ${what}. Keep the other sections close to the previous plan.`;
}

export async function runPlan(input: PlanInput, mode: RegenMode, previous?: Plan | null): Promise<Plan> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new GatewayError(401, "AI is not configured.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    instructions:
      "You are SipStory AI, a creative director for café and beverage short-form video. Write vivid, specific, ready-to-film content.",
    prompt: buildPrompt(input, mode, previous),
    output: Output.object({ schema: planSchema }),
    onError: ({ error }) => {
      failure = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  try {
    const plan = (await result.output) as Plan;
    return normalize(plan, input.duration);
  } catch (e) {
    const err = (failure ?? e) as { statusCode?: number; message?: string };
    if (err?.statusCode === 402) throw new GatewayError(402, "AI credits ran out. Please add credits to continue.");
    if (err?.statusCode === 429) throw new GatewayError(429, "Too many requests — please wait a moment and try again.");
    if (err?.statusCode === 403) throw new GatewayError(403, "AI access is blocked for this workspace.");
    if (NoObjectGeneratedError.isInstance(e)) throw new GatewayError(500, "The AI response was incomplete. Please try again.");
    throw new GatewayError(err?.statusCode ?? 500, "Generation failed. Please try again.");
  }
}

function normalize(plan: Plan, duration: number): Plan {
  const shots = [...plan.shots].sort((a, b) => a.start - b.start);
  for (let i = 0; i < shots.length; i++) {
    shots[i] = { ...shots[i], start: i === 0 ? 0 : shots[i - 1].end };
    if (shots[i].end <= shots[i].start) shots[i].end = shots[i].start + 1;
  }
  if (shots.length) shots[shots.length - 1].end = duration;
  const hashtags = plan.caption.hashtags
    .map((h) => (h.startsWith("#") ? h : `#${h.replace(/\s+/g, "")}`))
    .slice(0, 12);
  return { ...plan, shots, caption: { ...plan.caption, hashtags } };
}
