"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { CandyButton } from "@/components/CandyButton";
import { allergenLabels, categoryLabels } from "@/lib/recipes/labels";
import type { Allergen, Category } from "@/lib/recipes/types";
import { aiReviewSchema, type AiReview } from "@/lib/schemas/ai-review";

type Props = {
  submissionId: string;
  initialReview: AiReview | null;
  tickedAllergens: Allergen[];
  category: Category;
  onSuggestTag?: (tag: string) => void;
};

/** "Ask Mama's helper": calls the AI pre-review and shows its suggestions. */
export function AiReviewPanel({ submissionId, initialReview, tickedAllergens, category, onSuggestTag }: Props) {
  const [review, setReview] = useState<AiReview | null>(initialReview);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ai-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const body: unknown = await res.json();
      // Even our own API's reply is checked before we trust its shape.
      const parsed = aiReviewSchema.safeParse((body as { review?: unknown })?.review);
      if (!res.ok || !parsed.success) {
        setError((body as { error?: string })?.error ?? "Mama’s helper couldn’t answer this time.");
      } else {
        setReview(parsed.data);
        onSuggestTag?.(parsed.data.suggestedTag);
      }
    } catch {
      setError("Couldn’t reach Mama’s helper. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Where the AI and the cook disagree about allergens, flag it.
  const missed = review ? review.likelyAllergens.filter((a) => !tickedAllergens.includes(a)) : [];
  const extra = review ? tickedAllergens.filter((a) => !review.likelyAllergens.includes(a)) : [];

  return (
    <section className="form-panel ai-panel" aria-labelledby="ai-title" aria-busy={loading}>
      <h2 id="ai-title">
        <Sparkles aria-hidden="true" /> Mama’s helper
      </h2>
      <p className="field-hint">
        An AI pre-check of the recipe text only. It never sees the cook’s name, email, phone or photo, and personal
        details typed into the recipe are blanked out first. <strong>Suggestions only: you decide.</strong>
      </p>

      <div>
        <CandyButton variant="sweet" onClick={ask} disabled={loading}>
          {loading ? "Mama’s helper is reading…" : review ? "Ask again" : "Ask Mama’s helper"}
        </CandyButton>
      </div>

      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}

      {review && (
        <div className="ai-result" role="status">
          <p>
            <span className={`status-chip ${review.completeness === "ready" ? "status-approved" : "status-rejected"}`}>
              {review.completeness === "ready" ? "Looks ready" : "Needs work"}
            </span>{" "}
            {review.timeLooksRealistic ? "Cooking time looks right." : "⚠ The cooking time doesn’t look right."}
          </p>

          {(missed.length > 0 || extra.length > 0) && (
            <div className="allergen-note" role="alert">
              {missed.length > 0 && (
                <p>
                  <strong>Allergen check:</strong> the helper thinks it may contain{" "}
                  {missed.map((a) => allergenLabels[a].toLowerCase()).join(", ")}, but the cook didn’t tick{" "}
                  {missed.length > 1 ? "them" : "it"}.
                </p>
              )}
              {extra.length > 0 && (
                <p>
                  The cook ticked {extra.map((a) => allergenLabels[a].toLowerCase()).join(", ")}, which the helper didn’t
                  spot. Keep it if the cook says so.
                </p>
              )}
            </div>
          )}

          {review.issues.length > 0 ? (
            <ul className="ai-issues">
              {review.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          ) : (
            <p>No issues spotted.</p>
          )}

          <p className="field-hint">
            Suggested tag: <strong>{review.suggestedTag}</strong>
            {review.suggestedCategory !== category && (
              <> · Suggested category: <strong>{categoryLabels[review.suggestedCategory]}</strong></>
            )}
          </p>
        </div>
      )}
    </section>
  );
}
