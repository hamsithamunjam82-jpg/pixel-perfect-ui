import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { inputSchema, planSchema } from "./sipstory-schema";

const bodySchema = z.object({
  input: inputSchema,
  mode: z.enum(["full", "hooks", "script", "caption", "aesthetic"]),
  previous: planSchema.nullable(),
});

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bodySchema.parse(d))
  .handler(async ({ data }) => {
    const { runPlan, GatewayError } = await import("./sipstory.server");
    try {
      return { ok: true as const, plan: await runPlan(data.input, data.mode, data.previous) };
    } catch (e) {
      const msg = e instanceof GatewayError ? e.message : "Generation failed. Please try again.";
      return { ok: false as const, error: msg };
    }
  });
