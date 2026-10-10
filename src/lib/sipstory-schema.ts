import { z } from "zod";

export const CATEGORIES = ["Coffee", "Tea", "Matcha", "Smoothies", "Milkshakes", "Other"] as const;
export const PLATFORMS = ["Instagram Reels", "YouTube Shorts", "TikTok"] as const;
export const DURATIONS = [15, 30, 45, 60] as const;
export const AESTHETICS = [
  "Aesthetic & Cinematic",
  "Cozy Café",
  "Cute & Playful",
  "Minimalist",
  "Luxury",
  "Trendy & Energetic",
] as const;
export const AUDIENCES = ["Coffee lovers", "Students", "Café visitors", "Lifestyle audiences", "General audience"] as const;
export const FORMATS = ["Voiceover", "Text on Screen", "ASMR / No Talking", "Talking to Camera"] as const;

export const inputSchema = z.object({
  drinkName: z.string().trim().min(2, "Please tell us your drink's name").max(80),
  category: z.enum(CATEGORIES),
  platform: z.enum(PLATFORMS),
  duration: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60)]),
  aesthetic: z.enum(AESTHETICS),
  audience: z.enum(AUDIENCES),
  format: z.enum(FORMATS),
  extras: z.string().max(500),
});
export type PlanInput = z.infer<typeof inputSchema>;

export type RegenMode = "full" | "hooks" | "script" | "caption" | "aesthetic";

export const planSchema = z.object({
  concept: z.object({
    title: z.string(),
    oneLiner: z.string(),
    mood: z.string(),
    visualStyle: z.string(),
    whyItWorks: z.string(),
  }),
  hooks: z.array(z.object({ type: z.string(), text: z.string() })),
  script: z.array(z.object({ cue: z.string(), line: z.string() })),
  shots: z.array(
    z.object({
      start: z.number(),
      end: z.number(),
      onScreen: z.string(),
      camera: z.string(),
      action: z.string(),
      voiceOrText: z.string(),
      soundOrTransition: z.string(),
    }),
  ),
  caption: z.object({ text: z.string(), hashtags: z.array(z.string()) }),
  productionNotes: z.object({
    lighting: z.string(),
    props: z.string(),
    setting: z.string(),
    cameraAngles: z.string(),
    transitions: z.string(),
    music: z.string(),
    filmingTips: z.array(z.string()),
  }),
  alternatives: z.array(z.object({ title: z.string(), idea: z.string() })),
});
export type Plan = z.infer<typeof planSchema>;
