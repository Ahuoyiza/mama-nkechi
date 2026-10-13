import { Asterisk } from "lucide-react";
import { categoryLabels } from "@/lib/recipes/labels";
import { getPublishedRecipes } from "@/lib/recipes/queries";
import type { Category } from "@/lib/recipes/types";
import { CandyLink } from "./CandyButton";
import { FilterChip } from "./FilterChip";
import { RecipeCard } from "./RecipeCard";
import { RecipeSearch } from "./RecipeSearch";

const HOME_LIMIT = 6;
const CHIPS: Category[] = ["rice", "soups_stews", "small_chops"];

/**
 * The home page's taste of the pot: Mama's newest recipes. The chips and the
 * search box open the full /recipes page with that filter already applied.
 */
export async function HomeRecipes() {
  const mamas = (await getPublishedRecipes()).filter((r) => !r.fromYard);
  // Keep each card's number from the full list (01 = Mama's first recipe).
  const newest = mamas.map((recipe, i) => ({ recipe, number: i + 1 })).slice(-HOME_LIMIT);

  return (
    <>
      <nav className="recipe-toolbar" aria-label="Recipe categories">
        <div className="filters">
          <FilterChip href="/recipes" selected>
            <Asterisk aria-hidden="true" strokeWidth={2} /> All recipes
          </FilterChip>
          {CHIPS.map((c) => (
            <FilterChip key={c} href={`/recipes?category=${c}`} selected={false}>
              {categoryLabels[c]}
            </FilterChip>
          ))}
        </div>
      </nav>

      <RecipeSearch query="" category={null} />

      <div className="recipe-grid">
        {newest.map(({ recipe, number }) => (
          <RecipeCard key={recipe.id} recipe={recipe} number={number} />
        ))}
      </div>

      <div className="see-all">
        <CandyLink href="/recipes" variant="sweet">
          See all of Mama’s recipes →
        </CandyLink>
      </div>
    </>
  );
}
