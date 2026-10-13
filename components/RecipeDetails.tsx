import type { Recipe } from "@/lib/recipes/types";

type Props = Pick<Recipe, "serves" | "ingredients" | "steps">;

/** "Serves N", "Into the pot" and "Let's cook!": shared by the card and the full recipe page. */
export function RecipeMethod({ serves, ingredients, steps }: Props) {
  return (
    <>
      <p className="dialog-meta">Serves {serves}</p>
      <h4>Into the pot</h4>
      <ul>
        {ingredients.map((item, i) => (
          <li key={i}>{item.text}</li>
        ))}
      </ul>
      <h4>Let’s cook!</h4>
      <ol>
        {steps.map((step, i) => (
          <li key={i}>{step.text}</li>
        ))}
      </ol>
    </>
  );
}

/** Inline expander on the card. A native <details>, so it works without JavaScript. */
export function RecipeDetails(props: Props) {
  return (
    <details className="recipe-details">
      <summary>Let’s cook</summary>
      <RecipeMethod {...props} />
    </details>
  );
}
