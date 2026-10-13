"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Brush } from "lucide-react";
import { paintSubmission } from "@/app/admin/actions";
import { CandyButton } from "@/components/CandyButton";

type Props = { submissionId: string; photoUrl: string | null; paintedUrl: string | null; title: string };

/** Original photo next to the painted version, with the "Paint it Mama's way" button. */
export function PaintPanel({ submissionId, photoUrl, paintedUrl, title }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const paint = () =>
    startTransition(async () => {
      setError(null);
      const result = await paintSubmission(submissionId);
      if (!result.ok) setError(result.formError ?? "Couldn’t paint this one.");
      router.refresh(); // fetch a fresh signed link for the new picture
    });

  return (
    <section className="form-panel paint-panel" aria-labelledby="paint-title" aria-busy={pending}>
      <h2 id="paint-title">
        <Brush aria-hidden="true" /> The picture
      </h2>
      <div className="paint-compare">
        <figure>
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL from the private bucket
            <img src={photoUrl} alt={`Photo sent with ${title}`} className="review-photo" />
          )}
          <figcaption>Photo (shown as a polaroid)</figcaption>
        </figure>
        <figure className="paint-result">
          {paintedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL from the private bucket
            <img src={paintedUrl} alt={`Painted version of ${title}`} />
          ) : (
            <span className="paint-empty">Not painted yet</span>
          )}
          <figcaption>Painted, Mama’s style</figcaption>
        </figure>
      </div>
      <p className="field-hint">
        Painted on our own server with plain image processing. The photo isn’t sent anywhere.
      </p>
      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}
      <div>
        <CandyButton variant="sweet" onClick={paint} disabled={pending}>
          {pending ? "Mixing the paints…" : paintedUrl ? "Paint again" : "Paint it Mama’s way"}
        </CandyButton>
      </div>
    </section>
  );
}
