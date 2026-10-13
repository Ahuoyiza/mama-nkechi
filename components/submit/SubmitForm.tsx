"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitRecipe } from "@/app/submit/actions";
import { CandyButton } from "@/components/CandyButton";
import { allergenLabels, categoryLabels, effortLabels } from "@/lib/recipes/labels";
import { ALLERGENS, CATEGORIES, EFFORTS } from "@/lib/recipes/types";
import type { RecipeSubmissionInput } from "@/lib/schemas/submission";
import { toSubmissionFormData } from "@/lib/submissions/form-data";

/**
 * A plain HTML form: no validation, no field-level errors, fixed lists.
 *
 * TODO (Activity 2): Rebuild this with React Hook Form:
 *   - useForm<RecipeSubmissionInput, unknown, RecipeSubmission>({
 *       resolver: zodResolver(recipeSubmissionSchema), mode: "onTouched" })
 *   - useFieldArray for ingredients and steps (add, remove, move up/down;
 *     key each row with field.id, not the index)
 *   - <Controller> for the photo, with a preview (see ImagePicker.tsx)
 *   - accessible errors: aria-invalid, aria-describedby, role="alert"
 *     (see Field.tsx), and focus on the first error
 *   - show the guardian email box only when "Are you 18 or older?" is "No" (useWatch)
 *   - the button says "Sending to Mama…" while submitting
 */
export function SubmitForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setFormError(null);

    const fd = new FormData(event.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");
    const lines = (name: string) =>
      get(name)
        .split("\n")
        .map((text) => ({ text }))
        .filter((line) => line.text.trim() !== "");

    // Reshape into the same values the finished form sends.
    const values = {
      title: get("title"),
      description: get("description"),
      category: get("category"),
      effort: get("effort"),
      totalMinutes: get("totalMinutes"),
      serves: get("serves"),
      ingredients: lines("ingredients"),
      steps: lines("steps"),
      allergens: fd.getAll("allergens").map(String),
      image: fd.get("image"),
      submitterName: get("submitterName"),
      submitterEmail: get("submitterEmail"),
      submitterPhone: get("submitterPhone"),
      creditName: get("creditName"),
      isAdult: get("isAdult"),
      guardianEmail: get("guardianEmail"),
      consentPublish: fd.get("consentPublish") === "on",
      consentPrivacy: fd.get("consentPrivacy") === "on",
      website: get("website"),
    };

    // Nothing checks these values yet, so we just tell TypeScript to trust us.
    const result = await submitRecipe(toSubmissionFormData(values as unknown as RecipeSubmissionInput));
    if (result.ok) {
      router.push("/submit/thanks");
      return;
    }
    setSending(false);
    setFormError(result.formError ?? "Something went wrong. Please check your recipe and try again.");
  }

  return (
    <form className="submit-form" noValidate onSubmit={onSubmit}>
      {formError && (
        <div className="form-banner" role="alert">
          {formError}
        </div>
      )}

      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">1</span> The dish
        </legend>
        <div className="field">
          <label htmlFor="title">What do you call it?</label>
          <input id="title" name="title" type="text" placeholder="Ẹ̀fọ́ Rírò" />
        </div>
        <div className="field">
          <label htmlFor="description">Tell us a little about it</label>
          <textarea id="description" name="description" rows={3} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue="">
              <option value="" disabled>
                Pick one…
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="effort">How much stirring?</label>
            <select id="effort" name="effort" defaultValue="">
              <option value="" disabled>
                Pick one…
              </option>
              {EFFORTS.map((e) => (
                <option key={e} value={e}>
                  {effortLabels[e]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="totalMinutes">Total time (minutes)</label>
            <input id="totalMinutes" name="totalMinutes" type="number" />
          </div>
          <div className="field">
            <label htmlFor="serves">Serves</label>
            <input id="serves" name="serves" type="number" defaultValue={4} />
          </div>
        </div>
      </fieldset>

      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">2</span> Into the pot
        </legend>
        <div className="field">
          <label htmlFor="ingredients">Ingredients, one per line</label>
          <textarea id="ingredients" name="ingredients" rows={6} />
        </div>
      </fieldset>

      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">3</span> Let’s cook!
        </legend>
        <div className="field">
          <label htmlFor="steps">Steps, one per line</label>
          <textarea id="steps" name="steps" rows={6} />
        </div>
        <div className="field">
          <span className="field-label">Contains any of these?</span>
          <div className="check-grid">
            {ALLERGENS.map((a) => (
              <label key={a} className="check-chip">
                <input type="checkbox" name="allergens" value={a} /> {allergenLabels[a]}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">4</span> A photo
        </legend>
        <div className="field">
          <label htmlFor="image">Photo of your dish</label>
          <input id="image" name="image" type="file" accept="image/*" />
        </div>
      </fieldset>

      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">5</span> About you
        </legend>
        <div className="field-row">
          <div className="field">
            <label htmlFor="submitterName">Your name</label>
            <input id="submitterName" name="submitterName" type="text" />
          </div>
          <div className="field">
            <label htmlFor="submitterEmail">Email</label>
            <input id="submitterEmail" name="submitterEmail" type="email" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="submitterPhone">Phone (optional)</label>
            <input id="submitterPhone" name="submitterPhone" type="tel" />
          </div>
          <div className="field">
            <label htmlFor="creditName">Credit me as (optional)</label>
            <input id="creditName" name="creditName" type="text" />
          </div>
        </div>
        <div className="field">
          <span className="field-label">Are you 18 or older?</span>
          <div className="radio-row">
            <label className="check-chip">
              <input type="radio" name="isAdult" value="yes" /> Yes
            </label>
            <label className="check-chip">
              <input type="radio" name="isAdult" value="no" /> No
            </label>
          </div>
        </div>
        <div className="field">
          <label htmlFor="guardianEmail">Under 18? Parent or guardian’s email</label>
          <input id="guardianEmail" name="guardianEmail" type="email" />
        </div>
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </fieldset>

      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">6</span> The fine print
        </legend>
        <label className="consent">
          <input type="checkbox" name="consentPublish" />
          <span>Mama can edit and publish my recipe and photo on Mama Nkechi’s Pot.</span>
        </label>
        <label className="consent">
          <input type="checkbox" name="consentPrivacy" />
          <span>
            I’ve read the{" "}
            <Link href="/privacy" target="_blank">
              privacy notice
            </Link>
            .
          </span>
        </label>
        {turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />}
      </fieldset>

      <div className="form-actions">
        <CandyButton type="submit" disabled={sending}>
          {sending ? "Sending to Mama…" : "Send to Mama →"}
        </CandyButton>
      </div>
    </form>
  );
}
