/**
 * Moving a submission between the browser and the server action.
 *
 * FormData can only carry strings and files, so lists are sent as JSON and
 * booleans as "true"/"false". These helpers only reshape data. They do NOT
 * validate it: the server runs recipeSubmissionSchema on the result, because
 * anyone can post any FormData they like to a server action.
 */
import type { RecipeSubmissionInput } from "@/lib/schemas/submission";

const TEXT_FIELDS = [
  "title",
  "description",
  "category",
  "effort",
  "totalMinutes",
  "serves",
  "submitterName",
  "submitterEmail",
  "submitterPhone",
  "creditName",
  "isAdult",
  "guardianEmail",
  "website",
] as const;
const LIST_FIELDS = ["ingredients", "steps", "allergens"] as const;
const BOOLEAN_FIELDS = ["consentPublish", "consentPrivacy"] as const;

/** Browser side: the form's raw values -> FormData. */
export function toSubmissionFormData(values: RecipeSubmissionInput): FormData {
  const fd = new FormData();
  for (const key of TEXT_FIELDS) {
    const value = values[key];
    if (value !== undefined && value !== null) fd.set(key, String(value));
  }
  for (const key of LIST_FIELDS) fd.set(key, JSON.stringify(values[key] ?? []));
  for (const key of BOOLEAN_FIELDS) fd.set(key, values[key] === true ? "true" : "false");
  if (values.image instanceof File) fd.set("image", values.image);
  return fd;
}

/** Server side: FormData -> a plain object for safeParse. Unknown keys are dropped. */
export function fromSubmissionFormData(fd: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const key of TEXT_FIELDS) {
    const value = fd.get(key);
    if (typeof value === "string") out[key] = value;
  }

  for (const key of LIST_FIELDS) {
    const value = fd.get(key);
    if (typeof value !== "string") continue;
    try {
      out[key] = JSON.parse(value);
    } catch {
      out[key] = value; // not valid JSON: leave it for the schema to reject
    }
  }

  for (const key of BOOLEAN_FIELDS) out[key] = fd.get(key) === "true";

  const image = fd.get("image");
  if (image instanceof File && image.size > 0) out.image = image;

  return out;
}
