import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "@/lib/env";

/**
 * The model used for the pre-review. Google retires model versions and has
 * busy spells ("high demand"), so it's set by GEMINI_MODEL (see lib/schemas/env.ts)
 * and can be changed on Vercel without touching code.
 */
export const AI_MODEL = env.GEMINI_MODEL;

const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });

export const reviewModel = google(AI_MODEL);
