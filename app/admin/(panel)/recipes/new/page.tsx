import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { requireAdmin } from "@/lib/auth/admin";

export default async function NewRecipePage() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/recipes" className="back-link">
        <ArrowLeft aria-hidden="true" strokeWidth={1.8} /> All recipes
      </Link>
      <div className="admin-title">
        <div className="eyebrow">FROM MAMA’S KITCHEN</div>
        <h1>Add a recipe</h1>
      </div>
      <RecipeForm recipeId={null} />
    </>
  );
}
