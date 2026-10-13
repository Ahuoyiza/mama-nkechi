import { RecipeAdminRow } from "@/components/admin/RecipeAdminRow";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminRecipesPage() {
  const { supabase } = await requireAdmin();
  // As an admin, RLS lets us see unpublished recipes too.
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, slug, title, published, credit_name, source_submission_id")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="admin-title">
        <div className="eyebrow">THE WHOLE POT</div>
        <h1>Recipes</h1>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Recipe</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(recipes ?? []).map((r) => (
              <RecipeAdminRow
                key={r.id}
                id={r.id}
                slug={r.slug}
                title={r.title}
                published={r.published}
                fromYard={r.source_submission_id !== null}
                credit={r.credit_name}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
