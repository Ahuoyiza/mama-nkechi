/**
 * recipeSubmissionSchema: guards the public "Share your pot" form.
 *
 * Anyone on the internet can send anything to this form, with or without our
 * page (DevTools, curl, Postman). So the SAME schema runs twice:
 *   1. in the browser, through React Hook Form, for instant friendly errors;
 *   2. in the server action, because browser checks can be skipped.
 */
import { z } from "zod";
import { cleanText, emailField, nigerianPhone, optionalEmail, optionalText } from "./helpers";
import { recipeCoreSchema } from "./recipe";

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const IMAGE_ERROR = "Photo must be a JPG, PNG or WebP under 3 MB";

/**
 * Checks the type the browser reports and the size. That's enough for the
 * form, but the type comes from the file name, so the server re-checks the
 * real bytes too (lib/images/verify.ts).
 */
export const imageFileSchema = z
  .file({ error: "Add a photo of your dish" })
  .mime([...IMAGE_TYPES], IMAGE_ERROR)
  .max(MAX_IMAGE_BYTES, IMAGE_ERROR);

const submissionFields = recipeCoreSchema.extend({
  image: imageFileSchema,

  submitterName: cleanText(2, 60, "Tell us your name (2 to 60 characters)"),
  submitterEmail: emailField("Enter an email so Mama can reach you"),
  submitterPhone: nigerianPhone,
  creditName: optionalText(2, 40, "Credit name needs 2 to 40 characters"),

  // A radio button sends "yes" or "no"; the app works with a boolean.
  isAdult: z.enum(["yes", "no"], { error: "Please tell us if you’re 18 or older" }).transform((v) => v === "yes"),
  guardianEmail: optionalEmail("Enter your parent or guardian’s email"),

  // z.literal(true): unticked (false) fails, ticked (true) passes.
  consentPublish: z.literal(true, { error: "Tick this so Mama can share your recipe" }),
  consentPrivacy: z.literal(true, { error: "Please accept the privacy notice" }),

  // Honeypot: hidden from people, but bots fill in every box they find.
  // The server action checks it first and quietly pretends to succeed.
  website: z.string().max(0).default(""),
});

/**
 * Under-18s must give a guardian's email. This rule needs two fields
 * (isAdult and guardianEmail), so it can't live on either field alone.
 *
 * Gotcha: object-level checks (.refine on the object) normally run only after
 * EVERY field has passed. A student would fix the title, press submit, and
 * only THEN see "guardian email required". The `when` option below tells Zod
 * to run this check as soon as just these two fields are valid.
 */
const GUARDIAN_FIELDS: PropertyKey[] = ["isAdult", "guardianEmail"];

export const recipeSubmissionSchema = submissionFields.refine((data) => data.isAdult || !!data.guardianEmail, {
  path: ["guardianEmail"],
  message: "Under 18? Add a parent or guardian’s email so they know",
  // Run when neither of these two fields has its own error yet.
  // (Careful: payload.value is already transformed, so isAdult is a boolean
  // here. Re-parsing it with the "yes"/"no" input schema would always fail
  // and silently skip this rule. A test catches that.)
  when: (payload) => !payload.issues.some((issue) => GUARDIAN_FIELDS.includes(issue.path?.[0] as PropertyKey)),
});

/** What the form holds (strings from inputs, "yes"/"no", maybe-File). */
export type RecipeSubmissionInput = z.input<typeof recipeSubmissionSchema>;
/** What the server gets after parsing (numbers, booleans, normalised text). */
export type RecipeSubmission = z.output<typeof recipeSubmissionSchema>;
