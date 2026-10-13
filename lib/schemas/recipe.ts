/**
 * recipeCoreSchema: the parts every recipe has, whoever writes it.
 * recipeSchema: what the admin saves when creating or editing a published recipe.
 *
 * recipeSchema is built from recipeCoreSchema with .extend(), and so is the
 * public submission schema (./submission.ts). One set of recipe rules, used
 * by both forms and both server actions.
 */
import { z } from "zod";
import { ALLERGENS, CARD_COLOURS, CATEGORIES, EFFORTS, IMAGE_STYLES } from "@/lib/recipes/types";
import { cleanText, optionalText } from "./helpers";

export const categoryEnum = z.enum(CATEGORIES, { error: "Pick a category" });
export const effortEnum = z.enum(EFFORTS, { error: "How much stirring does it take?" });
export const allergenEnum = z.enum(ALLERGENS, { error: "Pick from the list" });
export const cardColourEnum = z.enum(CARD_COLOURS, { error: "Pick a card colour" });
export const imageStyleEnum = z.enum(IMAGE_STYLES, { error: "Pick an image style" });

const ingredientSchema = z.object({
  text: cleanText(2, 160, "Each ingredient needs 2 to 160 characters"),
});

const stepSchema = z.object({
  text: cleanText(10, 600, "Each step needs 10 to 600 characters"),
});

export const recipeCoreSchema = z.object({
  title: cleanText(3, 80, "Every pot needs a name (3 to 80 characters)"),
  description: cleanText(20, 200, "Tell us a little about it (20 to 200 characters)"),
  category: categoryEnum,
  effort: effortEnum,
  // Form inputs give strings ("45"); coerce turns them into numbers.
  // That's why forms use z.input (string in) and z.output (number out).
  totalMinutes: z.coerce
    .number({ error: "Cooking time should be between 5 minutes and 12 hours" })
    .int("Cooking time should be between 5 minutes and 12 hours")
    .min(5, "Cooking time should be between 5 minutes and 12 hours")
    .max(720, "Cooking time should be between 5 minutes and 12 hours"),
  serves: z.coerce
    .number({ error: "Serves between 1 and 30" })
    .int("Serves between 1 and 30")
    .min(1, "Serves between 1 and 30")
    .max(30, "Serves between 1 and 30"),
  ingredients: z
    .array(ingredientSchema)
    .min(2, "Add at least 2 ingredients")
    .max(30, "That’s a lot of ingredients! 30 at most"),
  steps: z.array(stepSchema).min(2, "Add at least 2 steps").max(20, "Keep it to 20 steps or fewer"),
  // Optional in the form; always an array afterwards.
  allergens: z.array(allergenEnum).default([]),
});

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const recipeSchema = recipeCoreSchema.extend({
  slug: z
    .string()
    .trim()
    .min(3, "Slug needs 3 to 80 characters")
    .max(80, "Slug needs 3 to 80 characters")
    .regex(SLUG, "Lowercase letters, numbers and single dashes only, like party-jollof-rice"),
  tag: cleanText(2, 30, "Tag needs 2 to 30 characters").transform((t) => t.toUpperCase()),
  cardColour: cardColourEnum,
  imageStyle: imageStyleEnum,
  published: z.boolean(),
  creditName: optionalText(2, 40, "Credit name needs 2 to 40 characters"),
});

export type RecipeCoreInput = z.input<typeof recipeCoreSchema>;
export type RecipeCore = z.output<typeof recipeCoreSchema>;
export type RecipeFormInput = z.input<typeof recipeSchema>;
export type RecipeFormOutput = z.output<typeof recipeSchema>;
