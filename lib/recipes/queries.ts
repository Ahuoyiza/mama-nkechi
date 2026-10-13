import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { rowToRecipe } from "./map";
import type { Recipe } from "./types";

/** Cache tag for every public recipe read. Admin actions call updateTag(RECIPES_TAG). */
export const RECIPES_TAG = "recipes";

/** Published recipes, oldest first so the launch three keep numbers 01 to 03. */
export async function getPublishedRecipes(): Promise<Recipe[]> {
  "use cache";
  cacheTag(RECIPES_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient()
    .from("recipes")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: true });

  if (error) throw new Error(`Could not load recipes: ${error.message}`);
  return data.map(rowToRecipe);
}

export async function getPublishedRecipe(slug: string): Promise<{ recipe: Recipe; number: number } | null> {
  const recipes = await getPublishedRecipes();
  const index = recipes.findIndex((r) => r.slug === slug);
  return index === -1 ? null : { recipe: recipes[index], number: index + 1 };
}
