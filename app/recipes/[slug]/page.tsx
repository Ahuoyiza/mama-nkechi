import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Asterisk, Clock, Users } from "lucide-react";
import { Footer } from "@/components/Footer";
import { RecipeImage } from "@/components/RecipeImage";
import { RecipeMethod } from "@/components/RecipeMethod";
import { SaveRecipeButton } from "@/components/SaveRecipeButton";
import { SiteHeader } from "@/components/SiteHeader";
import { surfaceClass } from "@/components/RecipeCard";
import { Sparkle } from "@/components/doodles";
import { allergenLabels, categoryLabels, effortLabels } from "@/lib/recipes/labels";
import { getPublishedRecipe, getPublishedRecipes } from "@/lib/recipes/queries";

export async function generateStaticParams() {
  const recipes = await getPublishedRecipes();
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/recipes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getPublishedRecipe(slug);
  if (!found) return { title: "Recipe not found | Mama Nkechi’s Pot" };
  return {
    title: `${found.recipe.title} | Mama Nkechi’s Pot`,
    description: found.recipe.description,
  };
}

export default async function RecipePage({ params }: PageProps<"/recipes/[slug]">) {
  const { slug } = await params;
  const found = await getPublishedRecipe(slug);
  if (!found) notFound();
  const { recipe, number } = found;

  return (
    <>
      <SiteHeader current={recipe.fromYard ? "yard" : "recipes"} />
      <main className="recipe-page">
        <Link href={recipe.fromYard ? "/yard" : "/recipes"} className="back-link">
          <ArrowLeft aria-hidden="true" strokeWidth={1.8} /> {recipe.fromYard ? "Back to the yard" : "Back to the pot"}
        </Link>

        <article>
          <div className="recipe-page-top">
            <div className={`recipe-page-picture ${surfaceClass[recipe.cardColour]}`}>
              <span className="recipe-tag">{recipe.tag}</span>
              <SaveRecipeButton slug={recipe.slug} title={recipe.title} />
              <RecipeImage
                path={recipe.imagePath}
                style={recipe.imageStyle}
                alt={`Illustration of ${recipe.title}`}
                sizes="(max-width: 700px) 90vw, 520px"
              />
              <span className="dish-number">{String(number).padStart(2, "0")}</span>
            </div>

            <div className="recipe-page-intro">
              <div className="eyebrow">{categoryLabels[recipe.category].toUpperCase()}</div>
              <h1>{recipe.title}</h1>
              <p className="recipe-page-description">{recipe.description}</p>
              <ul className="recipe-page-facts" aria-label="At a glance">
                <li>
                  <Clock aria-hidden="true" strokeWidth={1.6} /> {recipe.totalMinutes} mins
                </li>
                <li>
                  <Asterisk aria-hidden="true" strokeWidth={1.8} /> {effortLabels[recipe.effort]}
                </li>
                <li>
                  <Users aria-hidden="true" strokeWidth={1.6} /> Serves {recipe.serves}
                </li>
              </ul>
              {recipe.allergens.length > 0 && (
                <p className="allergen-note">
                  <strong>Heads up:</strong> contains{" "}
                  {recipe.allergens.map((a) => allergenLabels[a].toLowerCase()).join(", ")}.
                </p>
              )}
              {recipe.creditName && (
                <p className="recipe-credit">
                  <Sparkle aria-hidden="true" /> Shared by {recipe.creditName}
                </p>
              )}
            </div>
          </div>

          <RecipeMethod ingredients={recipe.ingredients} steps={recipe.steps} />
        </article>
      </main>
      <Footer />
    </>
  );
}
