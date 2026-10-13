import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { requireAdmin } from "@/lib/auth/admin";
import { recipeImageUrl } from "@/lib/recipes/image-url";
import { rowToRecipe } from "@/lib/recipes/map";

export default async function EditRecipePage({ params }: PageProps<"/admin/recipes/[id]/edit">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const { data: row } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (!row) notFound();
  const recipe = rowToRecipe(row);

  return (
    <>
      <Link href="/admin/recipes" className="back-link">
        <ArrowLeft aria-hidden="true" strokeWidth={1.8} /> All recipes
      </Link>
      <div className="admin-title">
        <div className="eyebrow">EDIT</div>
        <h1>{recipe.title}</h1>
      </div>
      <RecipeForm
        recipeId={recipe.id}
        currentImageUrl={recipeImageUrl(recipe.imagePath)}
        defaultValues={{
          title: recipe.title,
          slug: recipe.slug,
          description: recipe.description,
          tag: recipe.tag,
          category: recipe.category,
          effort: recipe.effort,
          totalMinutes: String(recipe.totalMinutes),
          serves: String(recipe.serves),
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          allergens: recipe.allergens,
          cardColour: recipe.cardColour,
          imageStyle: recipe.imageStyle,
          published: row.published,
          creditName: recipe.creditName ?? "",
        }}
      />
    </>
  );
}
