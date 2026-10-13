/**
 * recipeCoreSchema: the parts every recipe has, whoever writes it.
 * recipeSchema: what the admin saves (built from recipeCoreSchema with .extend()).
 */
import { z } from "zod";
import { ALLERGENS, CARD_COLOURS, CATEGORIES, EFFORTS, IMAGE_STYLES } from "@/lib/recipes/types";

// TODO (Activity 1): enums for category, effort, allergens, card colour and image style
// (the values are in lib/recipes/types.ts). Give each a friendly error, e.g. "Pick a category".
export const categoryEnum = z.any();
export const effortEnum = z.any();
export const allergenEnum = z.any();
export const cardColourEnum = z.any();
export const imageStyleEnum = z.any();

// TODO (Activity 1): title 3–80, description 20–200, category, effort,
// totalMinutes (z.coerce, 5–720), serves (z.coerce, 1–30),
// ingredients (2–30 of { text: 2–160 }), steps (2–20 of { text: 10–600 }), allergens.
export const recipeCoreSchema = z.any();

// The admin form's schema is written out in full here so the admin area works
// on this branch. TODO (Activity 1, stretch): once recipeCoreSchema is built,
// replace this with recipeCoreSchema.extend({ slug, tag, cardColour, imageStyle, published, creditName }).
const text = (min: number, max: number, message: string) => z.string().trim().normalize("NFC").min(min, message).max(max, message);
const items = (min: number, max: number, message: string) => z.array(z.object({ text: text(min, max, message) }));

export const recipeSchema = z.object({
  title: text(3, 80, "Every pot needs a name (3 to 80 characters)"),
  description: text(20, 200, "Tell us a little about it (20 to 200 characters)"),
  category: z.enum(CATEGORIES, { error: "Pick a category" }),
  effort: z.enum(EFFORTS, { error: "How much stirring does it take?" }),
  totalMinutes: z.coerce.number().int().min(5).max(720),
  serves: z.coerce.number().int().min(1).max(30),
  ingredients: items(2, 160, "Each ingredient needs 2 to 160 characters").min(2, "Add at least 2 ingredients").max(30),
  steps: items(10, 600, "Each step needs 10 to 600 characters").min(2, "Add at least 2 steps").max(20),
  allergens: z.array(z.enum(ALLERGENS)).default([]),
  slug: z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and single dashes only"),
  tag: text(2, 30, "Tag needs 2 to 30 characters").transform((t) => t.toUpperCase()),
  cardColour: z.enum(CARD_COLOURS),
  imageStyle: z.enum(IMAGE_STYLES),
  published: z.boolean(),
  creditName: z.string().trim().max(40).transform((v) => v || undefined).optional(),
});

export type RecipeCoreInput = z.input<typeof recipeCoreSchema>;
export type RecipeCore = z.output<typeof recipeCoreSchema>;
export type RecipeFormInput = z.input<typeof recipeSchema>;
export type RecipeFormOutput = z.output<typeof recipeSchema>;
