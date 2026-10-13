/**
 * reviewDecisionSchema: guards the admin's approve/reject form.
 */
import { z } from "zod";

// TODO (Homework): z.discriminatedUnion("decision", [
//   { decision: "approve", cardColour, tag, imageStyle },
//   { decision: "reject", reviewNote: 10 to 500 characters },
// ])
export const reviewDecisionSchema = z.any();

export type ReviewDecisionInput = z.input<typeof reviewDecisionSchema>;
export type ReviewDecision = z.output<typeof reviewDecisionSchema>;
