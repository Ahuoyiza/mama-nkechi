/**
 * What the AI pre-review is allowed to see.
 *
 * Right now it sees EVERYTHING in the submission row: the cook's name, email,
 * phone, guardian's email, IP hash and photo path, all sent to a model run
 * outside Nigeria. Open the Network tab, ask Mama's helper, and look.
 */
import { z } from "zod";
import type { Tables } from "@/lib/supabase/database.types";

// TODO (Activity 4): Replace this with an ALLOWLIST using z.strictObject({...})
// containing ONLY: title, description, category, effort, totalMinutes, serves,
// ingredients ([{ text }]), steps ([{ text }]) and allergens.
// z.strictObject rejects any other key, so personal data can't slip in later.
export const reviewContextSchema = z.looseObject({});

export type ReviewContext = z.output<typeof reviewContextSchema>;

export function buildReviewContext(submission: Tables<"recipe_submissions">): ReviewContext {
  // TODO (Activity 4): Build the object field by field (title, description, …),
  // run every text field (title, description, each ingredient and step) through
  // redact() from lib/privacy/redact.ts, then reviewContextSchema.parse() it.
  return reviewContextSchema.parse({ ...submission });
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
