import type { Recipe } from "@/lib/recipes/types";

type Props = Pick<Recipe, "ingredients" | "steps">;

/** "Into the pot" (ingredients) and "Let's cook!" (numbered steps). Plain text only. */
export function RecipeMethod({ ingredients, steps }: Props) {
  return (
    <div className="recipe-method">
      <section aria-labelledby="into-the-pot">
        <h2 id="into-the-pot">Into the pot</h2>
        <ul>
          {ingredients.map((item, i) => (
            <li key={i}>{item.text}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="lets-cook">
        <h2 id="lets-cook">Let’s cook!</h2>
        <ol>
          {steps.map((step, i) => (
            <li key={i}>{step.text}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
