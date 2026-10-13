import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { RecipeBrowser, RecipeBrowserSkeleton } from "@/components/RecipeBrowser";
import { SiteHeader } from "@/components/SiteHeader";
import { Squiggle, SteamingPot } from "@/components/doodles";

export const metadata: Metadata = {
  title: "Mama’s recipes | Mama Nkechi’s Pot",
  description: "Every recipe from Mama Nkechi’s kitchen. Filter by category or search for your next favourite.",
};

export default function RecipesPage({ searchParams }: PageProps<"/recipes">) {
  return (
    <>
      <SiteHeader current="recipes" />
      <main className="recipes-section page-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">THE WHOLE POT</div>
            <h1 className="page-title">
              Mama’s recipes
              <span className="title-doodle" aria-hidden="true">
                <Squiggle />
              </span>
            </h1>
            <p>Every recipe from Mama’s kitchen. Filter, search, and find your next favourite.</p>
          </div>
          <span className="kitchen-label">
            <SteamingPot /> Straight from the kitchen
          </span>
        </div>

        {/* ?category= and ?q= are request data, so this part streams in. */}
        <Suspense fallback={<RecipeBrowserSkeleton />}>
          <RecipeBrowser searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
