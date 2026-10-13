/**
 * homeSearchParamsSchema: guards the URL of the home page (?category=&q=).
 *
 * Anyone can type anything into a URL. Each field uses .catch() so a bad
 * value falls back to a safe default instead of crashing the page:
 *   /?category=pizza      -> all recipes
 *   /?q=a&q=b             -> uses the first q
 *   /?q=<600 characters>  -> ignored
 */
import { z } from "zod";
import { CATEGORIES } from "@/lib/recipes/types";

// Next.js gives string | string[] | undefined. Keep the first value only.
const firstValue = (v: unknown) => (Array.isArray(v) ? v[0] : v);

export const homeSearchParamsSchema = z.object({
  category: z.preprocess(firstValue, z.enum(CATEGORIES).optional()).catch(undefined),
  q: z.preprocess(firstValue, z.string().trim().normalize("NFC").max(60).default("")).catch(""),
});

export type HomeSearchParams = z.output<typeof homeSearchParamsSchema>;
