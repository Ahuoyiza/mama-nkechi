/**
 * recipeCoreSchema: the parts every recipe has, whoever writes it.
 * recipeSchema: what the admin saves (built from recipeCoreSchema with .extend()).
 */
import { z } from "zod";

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

// TODO (Activity 1, stretch): recipeCoreSchema.extend({ slug, tag, cardColour, imageStyle, published, creditName })
export const recipeSchema = z.any();

export type RecipeCoreInput = z.input<typeof recipeCoreSchema>;
export type RecipeCore = z.output<typeof recipeCoreSchema>;
export type RecipeFormInput = z.input<typeof recipeSchema>;
export type RecipeFormOutput = z.output<typeof recipeSchema>;
