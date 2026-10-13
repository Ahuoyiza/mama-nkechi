import "server-only";

/**
 * Server configuration.
 *
 * TODO (Activity 3): Replace this with envSchema.safeParse(process.env) from
 * lib/schemas/env.ts and throw a clear error listing what's wrong, so a
 * missing key fails at startup instead of crashing later. Watch out:
 * z.coerce.boolean() turns the string "false" into true. Use z.stringbool().
 */
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
  IP_HASH_SALT: process.env.IP_HASH_SALT ?? "",
  TURNSTILE_ENABLED: Boolean(process.env.TURNSTILE_ENABLED), // bug on purpose: "false" is truthy!
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  SUBMISSIONS_PER_DAY: Number(process.env.SUBMISSIONS_PER_DAY ?? 3),
};
