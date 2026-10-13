import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SavedRecipes } from "@/components/SavedRecipes";
import { SiteHeader } from "@/components/SiteHeader";
import { Squiggle } from "@/components/doodles";
import { getPublishedRecipes } from "@/lib/recipes/queries";

export const metadata: Metadata = { title: "Saved recipes | Mama Nkechi’s Pot" };

export default async function SavedPage() {
  const recipes = await getPublishedRecipes();

  return (
    <>
      <SiteHeader current="saved" />
      <main className="recipes-section page-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">KEPT FOR LATER</div>
            <h1 className="page-title">
              Your saved pots
              <span className="title-doodle" aria-hidden="true">
                <Squiggle />
              </span>
            </h1>
            <p>Saved on this device only. Nothing is sent to Mama.</p>
          </div>
        </div>
        <div className="page-body">
          <SavedRecipes recipes={recipes} />
        </div>
      </main>
      <Footer />
    </>
  );
}
