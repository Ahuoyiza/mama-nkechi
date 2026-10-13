import Link from "next/link";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { categoryLabels } from "@/lib/recipes/labels";

const STATUSES = ["pending", "approved", "rejected"] as const;

// Same idea as the home page: a bad ?status= falls back instead of crashing.
const paramsSchema = z.object({
  status: z.preprocess((v) => (Array.isArray(v) ? v[0] : v), z.enum([...STATUSES, "all"])).catch("pending"),
});

const statusLabels = { pending: "Waiting", approved: "Approved", rejected: "Not this time", all: "All" } as const;

export default async function SubmissionsPage({ searchParams }: PageProps<"/admin/submissions">) {
  const { supabase } = await requireAdmin();
  const { status } = paramsSchema.parse(await searchParams);

  let query = supabase
    .from("recipe_submissions")
    .select("id, title, category, status, submitter_name, created_at, ai_review")
    .order("created_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);
  const { data: submissions } = await query;

  return (
    <>
      <div className="admin-title">
        <div className="eyebrow">FROM THE YARD</div>
        <h1>Submissions</h1>
      </div>

      <nav className="filters admin-filters" aria-label="Filter by status">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/submissions?status=${s}`}
            className={s === status ? "recipe-filter is-selected" : "recipe-filter"}
            aria-current={s === status ? "true" : undefined}
          >
            {statusLabels[s]}
          </Link>
        ))}
      </nav>

      {submissions && submissions.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Recipe</th>
                <th scope="col">Cook</th>
                <th scope="col">Sent</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/admin/submissions/${s.id}`}>{s.title}</Link>
                    <span className="admin-sub">
                      {categoryLabels[s.category]}
                      {s.ai_review ? " · AI checked" : ""}
                    </span>
                  </td>
                  <td>{s.submitter_name}</td>
                  <td>{new Date(s.created_at).toLocaleDateString("en-GB")}</td>
                  <td>
                    <span className={`status-chip status-${s.status}`}>{statusLabels[s.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="field-hint">No submissions here.</p>
      )}
    </>
  );
}
