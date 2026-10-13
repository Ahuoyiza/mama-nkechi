/**
 * reviewDecisionSchema: guards the admin's approve/reject form.
 *
 * A discriminated union: the "decision" field decides which other fields are
 * required. (Not part of the class activities. On this branch it doesn't use
 * the helpers, because those are still stubs for Activity 1.)
 */
import { z } from "zod";
import { CARD_COLOURS, IMAGE_STYLES } from "@/lib/recipes/types";

export const reviewDecisionSchema = z.discriminatedUnion(
  "decision",
  [
    z.object({
      decision: z.literal("approve"),
      cardColour: z.enum(CARD_COLOURS, { error: "Pick a card colour" }),
      tag: z
        .string()
        .trim()
        .min(2, "Tag needs 2 to 30 characters")
        .max(30, "Tag needs 2 to 30 characters")
        .transform((t) => t.toUpperCase()),
      imageStyle: z.enum(IMAGE_STYLES).default("photo"),
    }),
    z.object({
      decision: z.literal("reject"),
      reviewNote: z.string().trim().min(10, "Tell the cook why (10 to 500 characters)").max(500, "Tell the cook why (10 to 500 characters)"),
    }),
  ],
  { error: "Choose approve or reject" },
);

export type ReviewDecisionInput = z.input<typeof reviewDecisionSchema>;
export type ReviewDecision = z.output<typeof reviewDecisionSchema>;
