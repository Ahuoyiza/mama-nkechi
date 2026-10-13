import { Asterisk } from "lucide-react";
import { FilterChip } from "@/components/FilterChip";
import { FlavourStrip } from "@/components/FlavourStrip";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { KitchenNote } from "@/components/KitchenNote";
import { RecipeCard } from "@/components/RecipeCard";
import { SiteHeader } from "@/components/SiteHeader";
import { Sparkle, Squiggle, SteamingPot } from "@/components/doodles";
import { fixtureRecipes } from "@/lib/recipes/fixture";

export default function Home() {
  const recipes = fixtureRecipes;

  return (
    <>
      <SiteHeader current="recipes" />
      <main>
        <Hero />
        <FlavourStrip />

        <section className="recipes-section" id="recipes" aria-labelledby="recipes-title">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE GOOD STUFF</div>
              <h2 id="recipes-title">
                What’s cooking?
                <span className="title-doodle" aria-hidden="true">
                  <Squiggle />
                </span>
              </h2>
              <p>Familiar favourites. Happy bellies. Find your next favourite.</p>
            </div>
            <span className="kitchen-label">
              <SteamingPot /> Straight from the kitchen
            </span>
          </div>

          <nav className="recipe-toolbar" aria-label="Recipe categories">
            <div className="filters">
              <FilterChip href="/#recipes" selected>
                <Asterisk aria-hidden="true" strokeWidth={2} /> All recipes
              </FilterChip>
              <FilterChip href="/?category=rice#recipes" selected={false}>
                Rice dishes
              </FilterChip>
              <FilterChip href="/?category=soups_stews#recipes" selected={false}>
                Soups &amp; stews
              </FilterChip>
              <FilterChip href="/?category=small_chops#recipes" selected={false}>
                Small chops
              </FilterChip>
            </div>
          </nav>

          <div className="recipe-grid">
            {recipes.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} number={i + 1} />
            ))}
          </div>

          <div className="recipe-footnote">
            <Sparkle aria-hidden="true" /> A few favourites to start. So much goodness to come.
          </div>
        </section>

        <KitchenNote />
      </main>
      <Footer />
    </>
  );
}
