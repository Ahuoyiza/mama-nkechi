import { FlavourStrip } from "@/components/FlavourStrip";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { KitchenNote } from "@/components/KitchenNote";
import { HomeRecipes } from "@/components/HomeRecipes";
import { SiteHeader } from "@/components/SiteHeader";
import { Sparkle, Squiggle, SteamingPot } from "@/components/doodles";

export default function Home() {
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

          <HomeRecipes />

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
