/**
 * Logging for AI calls.
 *
 * Logs are copied to dashboards, shared in bug reports and kept for months.
 */
export type AiCallLog = Record<string, unknown>;

export function aiLogEntry(input: {
  route: string;
  adminId: string;
  salt: string;
  model: string;
  ok: boolean;
  totalTokens?: number;
  durationMs: number;
}): AiCallLog {
  // TODO (Activity 4): Log only what we need to watch cost and speed:
  // { event: "ai_call", route, admin, model, ok, totalTokens, durationMs }.
  // `admin` must be a salted SHA-256 hash of adminId (first 12 characters),
  // never the raw id. Never log prompts, replies or recipe text.
  return { event: "ai_call", ...input };
}

export function logAiCall(entry: AiCallLog) {
  console.info(JSON.stringify(entry));
}
