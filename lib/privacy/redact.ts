/**
 * redact(): blanks out personal details people type into free text.
 *
 * Cooks write things like "call me on 0803 123 4567 if unsure" straight into
 * a step. Every text field goes through this before it's sent to the AI.
 */
export function redact(text: string): string {
  // TODO (Activity 4): Replace, in this order:
  //   1. email addresses           -> "[EMAIL]"
  //   2. Nigerian phone numbers    -> "[PHONE]"   (0803 123 4567, +234 803 123 4567, 08031234567…)
  //   3. any other 11-digit number -> "[ID_NUMBER]" (NIN and BVN are 11 digits)
  // Phones must come before ID numbers: 08031234567 is 11 digits too.
  // Leave ordinary recipe numbers ("45 minutes", "2 cups") alone.
  // The tests in lib/privacy/__tests__/redact.test.ts show every case.
  return text;
}
