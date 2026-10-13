/**
 * reviewDecisionSchema: guards the admin's approve/reject form.
 *
 * A discriminated union: the "decision" field decides which other fields
 * are required.
 *   approve -> needs cardColour, tag, imageStyle (how it will look on the site)
 *   reject  -> needs a reviewNote (why), and nothing else
 * TypeScript narrows the type too: after `if (d.decision === "reject")`,
 * d.reviewNote exists and d.tag doesn't.
 */
import { z } from "zod";
import { cleanText } from "./helpers";
import { cardColourEnum, imageStyleEnum } from "./recipe";

export const reviewDecisionSchema = z.discriminatedUnion(
  "decision",
  [
    z.object({
      decision: z.literal("approve"),
      cardColour: cardColourEnum,
      tag: cleanText(2, 30, "Tag needs 2 to 30 characters").transform((t) => t.toUpperCase()),
      imageStyle: imageStyleEnum.default("photo"),
    }),
    z.object({
      decision: z.literal("reject"),
      reviewNote: cleanText(10, 500, "Tell the cook why (10 to 500 characters)"),
    }),
  ],
  { error: "Choose approve or reject" },
);

export type ReviewDecisionInput = z.input<typeof reviewDecisionSchema>;
export type ReviewDecision = z.output<typeof reviewDecisionSchema>;
