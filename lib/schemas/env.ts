/**
 * envSchema: guards the app's configuration.
 *
 * Environment variables are always strings (or missing). A schema turns them
 * into typed values and fails fast at startup with a clear message.
 */
import { z } from "zod";

/**
 * TODO (Activity 3): Describe the browser-safe variables:
 * NEXT_PUBLIC_SUPABASE_URL (a URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (a non-empty string).
 */
export const clientEnvSchema = z.any();

/**
 * TODO (Activity 3): Extend clientEnvSchema with the server-only variables:
 * SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GENERATIVE_AI_API_KEY, IP_HASH_SALT (32+ chars),
 * TURNSTILE_ENABLED (z.stringbool, default false), TURNSTILE_SECRET_KEY (required only
 * when Turnstile is on) and SUBMISSIONS_PER_DAY (z.coerce.number, default 3).
 */
export const envSchema = z.any();

export type Env = z.output<typeof envSchema>;
