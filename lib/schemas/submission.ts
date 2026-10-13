/**
 * recipeSubmissionSchema: guards the public "Share your pot" form.
 *
 * Right now it accepts ANYTHING. Activity 1: open DevTools (or Postman) and
 * send the server nonsense. What gets through? What does the database stop?
 */
import { z } from "zod";

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// TODO (Activity 1): z.file() that only allows IMAGE_TYPES and MAX_IMAGE_BYTES:
// "Photo must be a JPG, PNG or WebP under 3 MB"
export const imageFileSchema = z.any();

// TODO (Activity 1): recipeCoreSchema.extend({ image, submitterName, submitterEmail,
// submitterPhone, creditName, isAdult ("yes" | "no" -> boolean), guardianEmail,
// consentPublish: z.literal(true), consentPrivacy: z.literal(true), website (honeypot) }),
// then a guardian-email rule for under-18s. Use the `when` option so it can show at
// the same time as other field errors. The error messages are in the lesson notes.
export const recipeSubmissionSchema = z.any();

export type RecipeSubmissionInput = z.input<typeof recipeSubmissionSchema>;
export type RecipeSubmission = z.output<typeof recipeSubmissionSchema>;
