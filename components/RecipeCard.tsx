import Link from "next/link";
import { Asterisk, Clock, Play } from "lucide-react";
import { effortLabels } from "@/lib/recipes/labels";
import type { CardColour, Recipe } from "@/lib/recipes/types";
import { RecipeImage } from "./RecipeImage";
import { SaveRecipeButton } from "./SaveRecipeButton";

export const surfaceClass: Record<CardColour, string> = {
  peach: "recipe-peach",
  yellow: "recipe-yellow",
  herb: "recipe-green",
};

/** All user text renders as plain React text, never as HTML. */
export function RecipeCard({ recipe, number }: { recipe: Recipe; number: number }) {
  const href = `/recipes/${recipe.slug}`;

  return (
    <article className={`recipe-card ${surfaceClass[recipe.cardColour]}`}>
      <div className="recipe-picture">
        <span className="recipe-tag">{recipe.tag}</span>
        <SaveRecipeButton slug={recipe.slug} title={recipe.title} />
        <RecipeImage path={recipe.imagePath} style={recipe.imageStyle} alt={`Illustration of ${recipe.title}`} />
        <span className="dish-number">{String(number).padStart(2, "0")}</span>
      </div>
      <div className="recipe-info">
        <div className="recipe-meta">
          <span>
            <Clock aria-hidden="true" strokeWidth={1.6} /> {recipe.totalMinutes} mins
          </span>
          <span>
            <Asterisk aria-hidden="true" strokeWidth={1.8} /> {effortLabels[recipe.effort]}
          </span>
        </div>
        <h3>
          <Link href={href} className="recipe-title-link">
            {recipe.title}
          </Link>
        </h3>
        <p>{recipe.description}</p>
      </div>
      <div className="recipe-cta">
        <Link href={href} aria-label={`Let’s cook ${recipe.title}`}>
          <Play aria-hidden="true" fill="currentColor" strokeWidth={0} /> Let’s cook
        </Link>
      </div>
    </article>
  );
}
