/**
 * Shared building blocks for every schema in the app.
 * These run in the browser AND on the server, so nothing here may import server-only code.
 */
import { z } from "zod";

/**
 * TODO (Activity 1): z.string().trim().normalize("NFC") with min/max length rules
 * and the friendly message. Why NFC? "Ẹ̀fọ́" can be typed two ways that look the
 * same but compare as different strings.
 */
export function cleanText(_min: number, _max: number, _message?: string) {
  return z.any();
}

/** TODO (Activity 1): like cleanText, but an empty box becomes undefined. */
export function optionalText(_min: number, _max: number, _message?: string) {
  return z.any();
}

/** TODO (Activity 1): trim + lowercase, then z.email(). */
export function emailField(_message?: string) {
  return z.any();
}

/** TODO (Activity 1): emailField, but an empty box becomes undefined. */
export function optionalEmail(_message?: string) {
  return z.any();
}

/**
 * TODO (Activity 1): optional Nigerian mobile number. Accept "0803 123 4567"
 * and "+2348031234567" (ignore spaces and dashes); always output "+234…".
 */
export const nigerianPhone = z.any();
