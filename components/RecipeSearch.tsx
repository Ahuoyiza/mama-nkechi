import { Search } from "lucide-react";

/**
 * Ink-bordered search bar. A plain GET form, so it works without JavaScript
 * and the search lives in the URL (?q=jollof).
 */
export function RecipeSearch({ query, category }: { query: string; category: string | null }) {
  return (
    <form className="recipe-search" role="search" action="/#recipes" method="get">
      <Search aria-hidden="true" strokeWidth={1.6} />
      <label htmlFor="recipe-search-input" className="sr-only">
        Search recipes
      </label>
      <input
        id="recipe-search-input"
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search the pot… jollof, egusi, suya"
        maxLength={60}
      />
      {category && <input type="hidden" name="category" value={category} />}
    </form>
  );
}
