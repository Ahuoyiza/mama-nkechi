/**
 * Shared building blocks for every schema in the app.
 *
 * These run in the browser (React Hook Form) AND on the server (server
 * actions), so nothing here may import server-only code.
 */
import { z } from "zod";

/**
 * Text a person typed: trimmed, Unicode-normalised (NFC) and length-checked.
 *
 * Why NFC? "Ẹ̀fọ́" can be stored as one character per letter-with-marks, or as a
 * plain letter followed by separate combining marks. They look identical but
 * compare as different strings, which breaks search and duplicate checks.
 * NFC picks one form so equal-looking text is equal.
 */
export function cleanText(min: number, max: number, message?: string) {
  const error = message ?? `Use ${min} to ${max} characters`;
  return z.string({ error }).trim().normalize("NFC").min(min, error).max(max, error);
}

/** Like cleanText, but an empty box means "not given" (undefined). */
export function optionalText(min: number, max: number, message?: string) {
  return z
    .string()
    .trim()
    .pipe(z.union([z.literal("").transform(() => undefined), cleanText(min, max, message)]))
    .optional();
}

/** Email, trimmed and lowercased before it is checked, so Ada@Example.com and ada@example.com match. */
export function emailField(message = "Enter a valid email address") {
  return z.string({ error: message }).trim().toLowerCase().pipe(z.email({ error: message }).max(254, message));
}

/** Optional email: an empty box means "not given". */
export function optionalEmail(message = "Enter a valid email address") {
  return z
    .string()
    .trim()
    .pipe(z.union([z.literal("").transform(() => undefined), emailField(message)]))
    .optional();
}

/**
 * Optional Nigerian mobile number. Accepts 0803 123 4567, 08031234567 or
 * +2348031234567 (spaces, dashes and brackets are ignored) and always outputs
 * the international form: "+2348031234567". An empty box means "not given".
 */
const NG_MOBILE = /^(?:0|\+234)[789][01]\d{8}$/;

export const nigerianPhone = z
  .string()
  .transform((v) => v.replace(/[\s().-]/g, ""))
  .pipe(
    z.union([
      z.literal(""),
      z.string().regex(NG_MOBILE, "Use a Nigerian mobile number, like 0803 123 4567 or +234 803 123 4567"),
    ]),
  )
  .transform((v) => (v === "" ? undefined : `+234${v.slice(-10)}`))
  .optional();
