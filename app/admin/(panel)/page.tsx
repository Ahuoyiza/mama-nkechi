import Link from "next/link";
import { CandyLink } from "@/components/CandyButton";
import { requireAdmin } from "@/lib/auth/admin";
import { categoryLabels } from "@/lib/recipes/labels";

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();

  const count = async (table: "recipe_submissions" | "recipes", column: string, value: string | boolean) => {
    const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).eq(column, value);
    return count ?? 0;
  };

  const [pending, published, recent] = await Promise.all([
    count("recipe_submissions", "status", "pending"),
    count("recipes", "published", true),
    supabase
      .from("recipe_submissions")
      .select("id, title, category, submitter_name, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <>
      <div className="admin-title">
        <div className="eyebrow">MAMA’S KITCHEN</div>
        <h1>Welcome back, Mama</h1>
      </div>

      <div className="admin-stats">
        <Link href="/admin/submissions?status=pending" className="admin-stat stat-peach">
          <strong>{pending}</strong> waiting for review
        </Link>
        <Link href="/admin/recipes" className="admin-stat stat-herb">
          <strong>{published}</strong> recipes in the pot
        </Link>
      </div>

      <section className="form-panel">
        <h2>Fresh from the yard</h2>
        {recent.data && recent.data.length > 0 ? (
          <ul className="admin-list">
            {recent.data.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/submissions/${s.id}`}>
                  <strong>{s.title}</strong>
                  <span>
                    {categoryLabels[s.category]} · from {s.submitter_name} · {new Date(s.created_at).toLocaleDateString("en-GB")}
                  </span>
                  <span className="admin-list-cta" aria-hidden="true">
                    Review →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="field-hint">Nothing waiting. The pot is all caught up!</p>
        )}
        <div>
          <CandyLink href="/admin/submissions" variant="sweet">
            All submissions →
          </CandyLink>
        </div>
      </section>
    </>
  );
}
