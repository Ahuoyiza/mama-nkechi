import Link from "next/link";
import type { ReactNode } from "react";
import { Asterisk, Clock } from "lucide-react";
import { effortLabels } from "@/lib/recipes/labels";
import type { CardColour, Recipe } from "@/lib/recipes/types";
import { RecipeDetails } from "./RecipeDetails";
import { RecipeImage } from "./RecipeImage";

export const surfaceClass: Record<CardColour, string> = {
  peach: "recipe-peach",
  yellow: "recipe-yellow",
  herb: "recipe-green",
};

/** All user text renders as plain React text, never as HTML. */
export function RecipeCard({ recipe, number, saveButton }: { recipe: Recipe; number: number; saveButton?: ReactNode }) {
  return (
    <article className={`recipe-card ${surfaceClass[recipe.cardColour]}`}>
      <div className="recipe-picture">
        <span className="recipe-tag">{recipe.tag}</span>
        {saveButton}
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
          <Link href={`/recipes/${recipe.slug}`} className="recipe-title-link">
            {recipe.title}
          </Link>
        </h3>
        <p>{recipe.description}</p>
      </div>
      <RecipeDetails serves={recipe.serves} ingredients={recipe.ingredients} steps={recipe.steps} />
    </article>
  );
}
