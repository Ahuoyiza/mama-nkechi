"use client";

import Link from "next/link";
import { useSavedRecipes } from "@/lib/saved";
import type { Recipe } from "@/lib/recipes/types";
import { EmptyPot } from "./EmptyPot";
import { RecipeCard } from "./RecipeCard";

/** Shows the published recipes whose slugs are saved in this browser. */
export function SavedRecipes({ recipes }: { recipes: Recipe[] }) {
  const { saved } = useSavedRecipes();
  const items = recipes
    .map((recipe, i) => ({ recipe, number: i + 1 }))
    .filter(({ recipe }) => saved.includes(recipe.slug));

  if (items.length === 0) {
    return (
      <EmptyPot title="No saved recipes yet">
        <p>
          Tap the heart on any recipe to keep it here. <Link href="/#recipes">Find something tasty →</Link>
        </p>
      </EmptyPot>
    );
  }

  return (
    <div className="recipe-grid">
      {items.map(({ recipe, number }) => (
        <RecipeCard key={recipe.id} recipe={recipe} number={number} />
      ))}
    </div>
  );
}
