/**
 * aiReviewSchema: the exact shape we ask the AI model to return.
 *
 * The model's reply is untrusted input like any other. Passing this schema to
 * the AI SDK means the reply is validated before our code ever touches it,
 * and we store and render only these fields.
 */
import { z } from "zod";
import { allergenEnum, categoryEnum } from "./recipe";

export const aiReviewSchema = z.object({
  completeness: z.enum(["ready", "needs_work"]).describe("Is the recipe complete enough to publish?"),
  issues: z
    .array(z.string().max(200))
    .max(8)
    .describe("Short, specific problems, e.g. 'Step 3 mentions crayfish but it isn't in the ingredients'"),
  likelyAllergens: z.array(allergenEnum).describe("Allergens the ingredients or steps suggest"),
  suggestedCategory: categoryEnum,
  suggestedTag: z.string().max(30).describe("A short upper-case card tag in the house style, e.g. 'SWEET AND STICKY!'"),
  timeLooksRealistic: z.boolean().describe("Does the total time fit the steps?"),
});

export type AiReview = z.output<typeof aiReviewSchema>;
