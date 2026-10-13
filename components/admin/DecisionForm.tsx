"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type FieldPath, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { decideSubmission } from "@/app/admin/actions";
import { CandyButton } from "@/components/CandyButton";
import { FieldError, Hint, a11y } from "@/components/submit/Field";
import { CARD_COLOURS } from "@/lib/recipes/types";
import { reviewDecisionSchema } from "@/lib/schemas/review-decision";

/**
 * The form holds every field at once, flat. The schema is a discriminated
 * union, so on submit it only keeps (and checks) the fields that belong to
 * the chosen decision: approve -> colour, tag, style; reject -> a reason.
 */
type DecisionValues = {
  decision: "approve" | "reject";
  cardColour: (typeof CARD_COLOURS)[number];
  tag: string;
  imageStyle: "illustration" | "photo";
  reviewNote: string;
};

export function DecisionForm({
  submissionId,
  suggestedTag,
  hasPainted,
}: {
  submissionId: string;
  suggestedTag?: string;
  hasPainted: boolean;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DecisionValues>({
    resolver: zodResolver(reviewDecisionSchema) as unknown as Resolver<DecisionValues>,
    defaultValues: {
      decision: "approve",
      cardColour: "peach",
      tag: suggestedTag ?? "",
      imageStyle: hasPainted ? "illustration" : "photo",
      reviewNote: "",
    },
  });
  const decision = useWatch({ control, name: "decision" });

  const onValid = async (values: DecisionValues) => {
    setFormError(null);
    const result = await decideSubmission(submissionId, values);
    if (result.ok) {
      router.push("/admin/submissions");
      router.refresh();
      return;
    }
    if (result.formError) setFormError(result.formError);
    Object.entries(result.fieldErrors ?? {}).forEach(([name, messages], i) => {
      if (messages?.[0]) setError(name as FieldPath<DecisionValues>, { message: messages[0] }, { shouldFocus: i === 0 });
    });
  };

  return (
    <form className="form-panel submit-form decision-form" noValidate onSubmit={handleSubmit(onValid)}>
      <h2>Your decision</h2>
      {formError && (
        <p className="form-banner" role="alert">
          {formError}
        </p>
      )}

      <div className="radio-row" role="radiogroup" aria-label="Decision">
        <label className="check-chip">
          <input type="radio" value="approve" {...register("decision")} /> Approve and publish
        </label>
        <label className="check-chip">
          <input type="radio" value="reject" {...register("decision")} /> Not this time
        </label>
      </div>

      {decision === "approve" ? (
        <>
          <div className="field">
            <span className="field-label" id="colour-label">
              Card colour
            </span>
            <div className="radio-row" role="radiogroup" aria-labelledby="colour-label">
              {CARD_COLOURS.map((c) => (
                <label key={c} className={`check-chip swatch swatch-${c}`}>
                  <input type="radio" value={c} {...register("cardColour")} /> {c}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="tag">Card tag</label>
            <input type="text" maxLength={30} placeholder="SWEET AND STICKY!" {...register("tag")} {...a11y("tag", { error: errors.tag?.message, hint: true })} />
            <Hint id="tag">Shown in small capitals on the card. 2 to 30 characters.</Hint>
            <FieldError id="tag-error" message={errors.tag?.message} />
          </div>
          <div className="field">
            <span className="field-label" id="style-label">
              Picture style
            </span>
            <div className="radio-row" role="radiogroup" aria-labelledby="style-label">
              <label className="check-chip">
                <input type="radio" value="photo" {...register("imageStyle")} /> Photo (polaroid)
              </label>
              <label className="check-chip">
                <input type="radio" value="illustration" disabled={!hasPainted} {...register("imageStyle")} /> Painted, Mama’s style
              </label>
            </div>
            {!hasPainted && <p className="field-hint">Press “Paint it Mama’s way” above to unlock the painted option.</p>}
            <FieldError id="imageStyle-error" message={errors.imageStyle?.message} />
          </div>
        </>
      ) : (
        <div className="field">
          <label htmlFor="reviewNote">Why not this time?</label>
          <textarea rows={4} {...register("reviewNote")} {...a11y("reviewNote", { error: errors.reviewNote?.message, hint: true })} />
          <Hint id="reviewNote">Kept with the submission. Rejected submissions and their photos are deleted after 30 days.</Hint>
          <FieldError id="reviewNote-error" message={errors.reviewNote?.message} />
        </div>
      )}

      <div>
        <CandyButton type="submit" disabled={isSubmitting} variant={decision === "approve" ? "primary" : "sweet"}>
          {isSubmitting ? "Saving…" : decision === "approve" ? "Publish to the yard →" : "Send back"}
        </CandyButton>
      </div>
    </form>
  );
}
