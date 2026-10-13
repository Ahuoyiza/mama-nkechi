import { z } from "zod";
import { clientEnvSchema } from "./schemas/env";

/**
 * Browser-safe configuration. Only NEXT_PUBLIC_ variables are allowed here.
 * Each one is referenced by its full name so Next.js can inline it at build time.
 */
const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  throw new Error(`Invalid public environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const clientEnv = parsed.data;
