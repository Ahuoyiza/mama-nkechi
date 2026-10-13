/**
 * redact(): blanks out personal details people type into free text.
 *
 * The AI pre-review only ever receives recipe fields, never the submitter's
 * name or email. But cooks write things like "call me on 0803 123 4567 if
 * unsure" straight into a step. Run every text field through this before it
 * leaves our server.
 *
 * Order matters: phone numbers are matched before bare 11-digit ID numbers
 * (NIN, BVN), because 08031234567 is both 11 digits and a phone number.
 */
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}/gi;

// +234 or 0, then a mobile prefix (70, 80, 81, 90, 91…), then 8 more digits.
// Spaces, dots, dashes and brackets are allowed between digit groups.
const NG_PHONE = /(?:\+?\s?234[\s.-]?\(?0?\)?|\b0)[789][01](?:[\s.-]?\d){8}\b/g;

// Any other run of exactly 11 digits (NIN and BVN are 11 digits long).
const ID_NUMBER = /\b\d{11}\b/g;

export function redact(text: string): string {
  return text.replace(EMAIL, "[EMAIL]").replace(NG_PHONE, "[PHONE]").replace(ID_NUMBER, "[ID_NUMBER]");
}
