import "server-only";
import { z } from "zod";
import { envSchema } from "./schemas/env";

/**
 * Server configuration, parsed once when the server starts.
 * `import "server-only"` makes the build fail if a client component imports this,
 * so the service role key and AI key can never reach the browser bundle.
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Only variable names and rules are printed, never the secret values.
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
