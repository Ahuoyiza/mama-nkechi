import { z } from "zod";
import type { Tables } from "@/lib/supabase/database.types";
import { ALLERGENS, type Recipe } from "./types";

/**
 * jsonb columns come back typed as `Json`, which could be anything.
 * Parse them with Zod instead of casting, so a bad row fails loudly here
 * rather than as a blank list on the page.
 */
const textItemsSchema = z.array(z.object({ text: z.string() }));
const allergensSchema = z.array(z.enum(ALLERGENS));

export function rowToRecipe(row: Tables<"recipes">): Recipe {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    tag: row.tag,
    category: row.category,
    effort: row.effort,
    totalMinutes: row.total_minutes,
    serves: row.serves,
    ingredients: textItemsSchema.parse(row.ingredients),
    steps: textItemsSchema.parse(row.steps),
    allergens: allergensSchema.parse(row.allergens),
    imagePath: row.image_path,
    cardColour: row.card_colour,
    imageStyle: row.image_style,
    creditName: row.credit_name,
    fromYard: row.source_submission_id !== null,
  };
}
