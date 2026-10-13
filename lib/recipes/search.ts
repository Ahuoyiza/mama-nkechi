import type { Category, Recipe } from "./types";

/**
 * Folds text for matching: NFD + strip tonal marks + lowercase.
 * So "efo riro" finds "Ẹ̀fọ́ Rírò", and "EGUSI" finds "Egusi".
 */
export function foldText(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export type RecipeFilter = { category?: Category; q: string };

/** Each recipe paired with its card number (01, 02...) so numbers stay stable when filtering. */
export function filterRecipes(recipes: Recipe[], { category, q }: RecipeFilter) {
  const words = foldText(q).split(/\s+/).filter(Boolean);

  return recipes
    .map((recipe, i) => ({ recipe, number: i + 1 }))
    .filter(({ recipe }) => !category || recipe.category === category)
    .filter(({ recipe }) => {
      if (words.length === 0) return true;
      const haystack = foldText(
        [recipe.title, recipe.description, recipe.tag, ...recipe.ingredients.map((i) => i.text)].join(" "),
      );
      return words.every((word) => haystack.includes(word));
    });
}
