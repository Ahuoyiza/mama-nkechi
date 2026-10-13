import Link from "next/link";
import { Asterisk } from "lucide-react";
import { categoryLabels } from "@/lib/recipes/labels";
import { getPublishedRecipes } from "@/lib/recipes/queries";
import { filterRecipes } from "@/lib/recipes/search";
import type { Category } from "@/lib/recipes/types";
import { homeSearchParamsSchema } from "@/lib/schemas/search-params";
import { EmptyPot } from "./EmptyPot";
import { FilterChip } from "./FilterChip";
import { RecipeCard } from "./RecipeCard";
import { RecipeSearch } from "./RecipeSearch";

// The three chips from the reference always show; other categories appear once they have a recipe.
const ALWAYS_SHOWN: Category[] = ["rice", "soups_stews", "small_chops"];

function hrefFor(category: Category | undefined, q: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const query = params.toString();
  return `/${query ? `?${query}` : ""}#recipes`;
}

/** Filters, search and the recipe grid. Reads ?category= and ?q= through a Zod schema. */
export async function RecipeBrowser({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { category, q } = homeSearchParamsSchema.parse(await searchParams);
  const recipes = await getPublishedRecipes();
  const results = filterRecipes(recipes, { category, q });

  const categories = [...new Set<Category>([...ALWAYS_SHOWN, ...recipes.map((r) => r.category)])];

  return (
    <>
      <nav className="recipe-toolbar" aria-label="Recipe categories">
        <div className="filters">
          <FilterChip href={hrefFor(undefined, q)} selected={!category}>
            <Asterisk aria-hidden="true" strokeWidth={2} /> All recipes
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c} href={hrefFor(c, q)} selected={category === c}>
              {categoryLabels[c]}
            </FilterChip>
          ))}
        </div>
      </nav>

      <RecipeSearch query={q} category={category ?? null} />

      {results.length > 0 ? (
        <div className="recipe-grid">
          {results.map(({ recipe, number }) => (
            <RecipeCard key={recipe.id} recipe={recipe} number={number} />
          ))}
        </div>
      ) : (
        <EmptyPot title="Nothing in this pot yet!">
          <p>
            {q ? <>We couldn’t find “{q}”. </> : null}
            Try another search, or <Link href="/#recipes">see all recipes</Link>.
          </p>
        </EmptyPot>
      )}
    </>
  );
}

/** Shown while recipes load: the chips row and three empty cards, so nothing jumps. */
export function RecipeBrowserSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading recipes">
      <div className="recipe-toolbar">
        <div className="filters">
          <span className="recipe-filter is-selected">
            <Asterisk aria-hidden="true" strokeWidth={2} /> All recipes
          </span>
        </div>
      </div>
      <div className="recipe-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="recipe-card recipe-skeleton" />
        ))}
      </div>
    </div>
  );
}
