import type { Metadata } from "next";
import Link from "next/link";
import { CandyLink } from "@/components/CandyButton";
import { EmptyPot } from "@/components/EmptyPot";
import { Footer } from "@/components/Footer";
import { RecipeCard } from "@/components/RecipeCard";
import { SiteHeader } from "@/components/SiteHeader";
import { Squiggle } from "@/components/doodles";
import { Users } from "lucide-react";
import { getPublishedRecipes } from "@/lib/recipes/queries";

export const metadata: Metadata = {
  title: "From the yard | Mama Nkechi’s Pot",
  description: "Recipes from the Mama Nkechi’s Pot community, tasted and approved by Mama.",
};

/** Community recipes: submissions Mama has approved and published. */
export default async function YardPage() {
  const yard = (await getPublishedRecipes()).filter((r) => r.fromYard);

  return (
    <>
      <SiteHeader current="yard" />
      <main className="recipes-section page-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">COOKED BY YARD PEOPLE</div>
            <h1 className="page-title">
              From the yard
              <span className="title-doodle" aria-hidden="true">
                <Squiggle />
              </span>
            </h1>
            <p>Recipes from our community, tasted and approved by Mama. Every pot here has a cook behind it.</p>
          </div>
          <span className="kitchen-label">
            <Users aria-hidden="true" strokeWidth={1.6} /> Shared with love
          </span>
        </div>

        <div className="page-body">
          {yard.length > 0 ? (
            <div className="recipe-grid">
              {yard.map((recipe, i) => (
                <RecipeCard key={recipe.id} recipe={recipe} number={i + 1} />
              ))}
            </div>
          ) : (
            <EmptyPot title="The yard is quiet… for now">
              <p>
                No community recipes yet. Yours could be the first! Or browse{" "}
                <Link href="/#recipes">Mama’s recipes</Link> while you wait.
              </p>
            </EmptyPot>
          )}
        </div>

        <div className="yard-cta">
          <p>Got a pot the whole yard should taste?</p>
          <CandyLink href="/submit" variant="sweet">
            Share your pot →
          </CandyLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
