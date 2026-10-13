/**
 * Moving the admin recipe form between the browser and the server action.
 * Same idea as lib/submissions/form-data.ts: lists travel as JSON, booleans
 * as "true"/"false". This only reshapes; recipeSchema does the checking.
 */
import type { RecipeFormInput } from "@/lib/schemas/recipe";

const TEXT_FIELDS = [
  "title",
  "description",
  "category",
  "effort",
  "totalMinutes",
  "serves",
  "slug",
  "tag",
  "cardColour",
  "imageStyle",
  "creditName",
] as const;
const LIST_FIELDS = ["ingredients", "steps", "allergens"] as const;

export type RecipeFormExtras = { image: File | null; paint: boolean };

export function toRecipeFormData(values: RecipeFormInput, extras: RecipeFormExtras): FormData {
  const fd = new FormData();
  for (const key of TEXT_FIELDS) {
    const value = values[key];
    if (value !== undefined && value !== null) fd.set(key, String(value));
  }
  for (const key of LIST_FIELDS) fd.set(key, JSON.stringify(values[key] ?? []));
  fd.set("published", values.published === true ? "true" : "false");
  if (extras.image) fd.set("image", extras.image);
  fd.set("paint", extras.paint ? "true" : "false");
  return fd;
}

export function fromRecipeFormData(fd: FormData): { values: Record<string, unknown> } & RecipeFormExtras {
  const values: Record<string, unknown> = {};
  for (const key of TEXT_FIELDS) {
    const value = fd.get(key);
    if (typeof value === "string") values[key] = value;
  }
  for (const key of LIST_FIELDS) {
    const value = fd.get(key);
    if (typeof value !== "string") continue;
    try {
      values[key] = JSON.parse(value);
    } catch {
      values[key] = value; // not JSON: let the schema reject it
    }
  }
  values.published = fd.get("published") === "true";

  const image = fd.get("image");
  return {
    values,
    image: image instanceof File && image.size > 0 ? image : null,
    paint: fd.get("paint") === "true",
  };
}
