"use client";

import { Heart } from "lucide-react";
import { useSavedRecipes } from "@/lib/saved";

/** Heart in the corner of a recipe card. */
export function SaveRecipeButton({ slug, title }: { slug: string; title: string }) {
  const { saved, toggle } = useSavedRecipes();
  const isSaved = saved.includes(slug);

  return (
    <button
      type="button"
      className="save-recipe playful-icon"
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${title} from saved recipes` : `Save ${title}`}
      onClick={() => toggle(slug)}
    >
      <Heart aria-hidden="true" strokeWidth={1.6} />
    </button>
  );
}
