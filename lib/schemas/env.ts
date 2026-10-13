/**
 * envSchema: guards the app's configuration.
 *
 * Environment variables are always strings (or missing). This schema turns
 * them into typed values and fails fast at startup with a clear message,
 * instead of crashing later with "cannot read properties of undefined".
 *
 * It lives in lib/schemas so it can be unit-tested; lib/env.ts does the
 * actual parsing and is server-only.
 */
import { z } from "zod";

// An empty "KEY=" line in .env should count as "not set".
const optionalString = z.preprocess((v) => (v === "" ? undefined : v), z.string().optional());

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({ protocol: /^https?$/, error: "Must be your Supabase project URL" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, "Looks too short to be a Supabase key"),
});

export const envSchema = clientEnvSchema
  .extend({
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, "Looks too short to be a Supabase key"),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(20),
    // Google retires and overloads models often; switch without a code change.
    GEMINI_MODEL: z.preprocess((v) => (v === "" ? undefined : v), z.string().default("gemini-3.1-flash-lite")),
    IP_HASH_SALT: z.string().min(32, "Use at least 32 random characters (openssl rand -hex 32)"),
    // Careful: z.coerce.boolean() would turn the string "false" into true,
    // because any non-empty string is truthy. z.stringbool() reads
    // "true"/"false"/"1"/"0"/"yes"/"no" the way a human means them.
    TURNSTILE_ENABLED: z.stringbool().default(false),
    TURNSTILE_SECRET_KEY: optionalString,
    SUBMISSIONS_PER_DAY: z.coerce.number().int().min(1).max(100).default(3),
  })
  // Object-level rule: the secret is only required when Turnstile is on.
  // Note: object-level checks run only after every field above has passed,
  // so this message won't appear while another variable is still invalid.
  .refine((env) => !env.TURNSTILE_ENABLED || !!env.TURNSTILE_SECRET_KEY, {
    path: ["TURNSTILE_SECRET_KEY"],
    message: "Required when TURNSTILE_ENABLED is true",
  });

export type Env = z.output<typeof envSchema>;
