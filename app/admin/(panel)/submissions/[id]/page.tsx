import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { AiReviewPanel } from "@/components/admin/AiReviewPanel";
import { DecisionForm } from "@/components/admin/DecisionForm";
import { RecipeMethod } from "@/components/RecipeMethod";
import { requireAdmin } from "@/lib/auth/admin";
import { allergenLabels, categoryLabels, effortLabels } from "@/lib/recipes/labels";
import { ALLERGENS } from "@/lib/recipes/types";
import { aiReviewSchema } from "@/lib/schemas/ai-review";

const textItems = z.array(z.object({ text: z.string() }));
const allergenList = z.array(z.enum(ALLERGENS));

export default async function ReviewSubmissionPage({ params }: PageProps<"/admin/submissions/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const { data: s } = await supabase.from("recipe_submissions").select("*").eq("id", id).maybeSingle();
  if (!s) notFound();

  // The photo bucket is private: make a link that works for 10 minutes only.
  const { data: signed } = await supabase.storage.from("submission-images").createSignedUrl(s.image_path, 600);

  const allergens = allergenList.parse(s.allergens);
  const stored = aiReviewSchema.safeParse(s.ai_review); // stored JSON is checked too

  return (
    <>
      <Link href="/admin/submissions" className="back-link">
        <ArrowLeft aria-hidden="true" strokeWidth={1.8} /> All submissions
      </Link>

      <div className="admin-title">
        <div className="eyebrow">
          {categoryLabels[s.category].toUpperCase()} · {s.status.toUpperCase()}
        </div>
        <h1>{s.title}</h1>
        <p className="recipe-page-description">{s.description}</p>
      </div>

      <div className="review-grid">
        <div className="review-main">
          <div className="form-panel review-facts">
            {signed?.signedUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL from the private bucket
              <img src={signed.signedUrl} alt={`Photo sent with ${s.title}`} className="review-photo" />
            )}
            <ul className="recipe-page-facts">
              <li>{s.total_minutes} mins</li>
              <li>{effortLabels[s.effort]}</li>
              <li>Serves {s.serves}</li>
            </ul>
            <p className="field-hint">
              Allergens ticked by the cook:{" "}
              <strong>{allergens.length ? allergens.map((a) => allergenLabels[a]).join(", ") : "none"}</strong>
            </p>
          </div>

          <RecipeMethod ingredients={textItems.parse(s.ingredients)} steps={textItems.parse(s.steps)} />

          <section className="form-panel">
            <h2>The cook (private)</h2>
            <dl className="admin-dl">
              <dt>Name</dt>
              <dd>{s.submitter_name}</dd>
              <dt>Email</dt>
              <dd>{s.submitter_email}</dd>
              {s.submitter_phone && (
                <>
                  <dt>Phone</dt>
                  <dd>{s.submitter_phone}</dd>
                </>
              )}
              <dt>Credit as</dt>
              <dd>{s.credit_name ?? "Anonymous"}</dd>
              <dt>18 or older</dt>
              <dd>{s.is_adult ? "Yes" : `No (guardian: ${s.guardian_email})`}</dd>
              <dt>Sent</dt>
              <dd>{new Date(s.created_at).toLocaleString("en-GB")}</dd>
            </dl>
          </section>
        </div>

        <aside className="review-side">
          <AiReviewPanel
            submissionId={s.id}
            initialReview={stored.success ? stored.data : null}
            tickedAllergens={allergens}
            category={s.category}
          />
          {s.status === "pending" ? (
            <DecisionForm submissionId={s.id} suggestedTag={stored.success ? stored.data.suggestedTag : undefined} />
          ) : (
            <section className="form-panel">
              <h2>{s.status === "approved" ? "Approved and published" : "Sent back"}</h2>
              {s.review_note && <p>{s.review_note}</p>}
              {s.reviewed_at && <p className="field-hint">On {new Date(s.reviewed_at).toLocaleString("en-GB")}</p>}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
