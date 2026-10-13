/**
 * Safe logging for AI calls.
 *
 * Logs are copied to dashboards, shared in bug reports and kept for months.
 * So we log only what we need to watch cost and speed: which route, WHO (as a
 * hash, not an id), how many tokens, how long. Never the prompt, the model's
 * reply or any recipe text.
 */
import { createHash } from "node:crypto";

export type AiCallLog = {
  event: "ai_call";
  route: string;
  admin: string; // salted hash, first 12 characters
  model: string;
  ok: boolean;
  totalTokens: number | null;
  durationMs: number;
};

export function aiLogEntry(input: {
  route: string;
  adminId: string;
  salt: string;
  model: string;
  ok: boolean;
  totalTokens?: number;
  durationMs: number;
}): AiCallLog {
  return {
    event: "ai_call",
    route: input.route,
    admin: createHash("sha256").update(`${input.salt}:${input.adminId}`).digest("hex").slice(0, 12),
    model: input.model,
    ok: input.ok,
    totalTokens: input.totalTokens ?? null,
    durationMs: Math.round(input.durationMs),
  };
}

export function logAiCall(entry: AiCallLog) {
  console.info(JSON.stringify(entry));
}
