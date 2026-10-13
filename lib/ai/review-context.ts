/**
 * What the AI pre-review is allowed to see: an ALLOWLIST.
 *
 * z.strictObject rejects any key that isn't listed here. So if someone later
 * adds `submitterEmail` to the object we build, parsing fails loudly instead
 * of quietly sending a person's email to a model outside Nigeria.
 *
 * Never sent: submitter name, email, phone, guardian email, IP hash, the photo.
 * Every text field is also run through redact(), because people type phone
 * numbers into their steps.
 */
import { z } from "zod";
import type { Tables } from "@/lib/supabase/database.types";
import { redact } from "@/lib/privacy/redact";
import { allergenEnum, categoryEnum, effortEnum } from "@/lib/schemas/recipe";

const textItems = z.array(z.strictObject({ text: z.string() }));

export const reviewContextSchema = z.strictObject({
  title: z.string(),
  description: z.string(),
  category: categoryEnum,
  effort: effortEnum,
  totalMinutes: z.number(),
  serves: z.number(),
  ingredients: textItems,
  steps: textItems,
  allergens: z.array(allergenEnum),
});

export type ReviewContext = z.output<typeof reviewContextSchema>;

// Stored jsonb may hold extra keys; keep only `text`, then redact it.
const storedItems = z.array(z.object({ text: z.string() }));
const redactItems = (value: unknown) => storedItems.parse(value).map((item) => ({ text: redact(item.text) }));

/** Build the AI's view of a submission. Throws if anything outside the allowlist sneaks in. */
export function buildReviewContext(submission: Tables<"recipe_submissions">): ReviewContext {
  return reviewContextSchema.parse({
    title: redact(submission.title),
    description: redact(submission.description),
    category: submission.category,
    effort: submission.effort,
    totalMinutes: submission.total_minutes,
    serves: submission.serves,
    ingredients: redactItems(submission.ingredients),
    steps: redactItems(submission.steps),
    allergens: submission.allergens,
  });
}

export const REVIEW_INSTRUCTIONS = `You are a friendly kitchen assistant helping "Mama", who runs a Nigerian recipe website, review recipes sent in by home cooks.
Check the recipe below and report:
- completeness: "ready" if a home cook could follow it as written, otherwise "needs_work".
- issues: short, specific problems (at most 8), e.g. "Step 3 mentions crayfish but it isn't in the ingredients". Empty if none.
- likelyAllergens: allergens the ingredients or steps suggest. Crayfish and prawns are shellfish; stockfish, smoked fish and fish sauce are fish; groundnuts and suya spice (yaji) usually contain peanuts; flour is wheat.
- suggestedCategory: the best category.
- suggestedTag: a short, upbeat card tag in capitals, at most 30 characters, e.g. "SWEET AND STICKY!".
- timeLooksRealistic: whether the total time fits the steps (count soaking, rising and chilling).
Text like [PHONE], [EMAIL] or [ID_NUMBER] marks details that were removed for privacy; ignore it.
You only make suggestions. Mama decides what is published.`;
