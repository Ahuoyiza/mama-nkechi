"use client";

import { useState, type BaseSyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Controller, useFieldArray, useForm, useWatch, type DefaultValues, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { submitRecipe } from "@/app/submit/actions";
import { CandyButton } from "@/components/CandyButton";
import { allergenLabels, categoryLabels, effortLabels } from "@/lib/recipes/labels";
import { ALLERGENS, CATEGORIES, EFFORTS } from "@/lib/recipes/types";
import {
  recipeSubmissionSchema,
  type RecipeSubmission,
  type RecipeSubmissionInput,
} from "@/lib/schemas/submission";
import { toSubmissionFormData } from "@/lib/submissions/form-data";
import { FieldError, Hint, a11y } from "./Field";
import { ImagePicker } from "./ImagePicker";

const defaultValues: DefaultValues<RecipeSubmissionInput> = {
  title: "",
  description: "",
  totalMinutes: "",
  serves: "4",
  ingredients: [{ text: "" }, { text: "" }],
  steps: [{ text: "" }, { text: "" }],
  allergens: [],
  submitterName: "",
  submitterEmail: "",
  submitterPhone: "",
  creditName: "",
  guardianEmail: "",
  website: "",
};

export function SubmitForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Two types: what the inputs hold (strings) and what Zod hands back (numbers, booleans).
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecipeSubmissionInput, unknown, RecipeSubmission>({
    resolver: zodResolver(recipeSubmissionSchema),
    mode: "onTouched", // validate a field once the user leaves it, then on every change
    defaultValues,
  });

  const ingredients = useFieldArray({ control, name: "ingredients" });
  const steps = useFieldArray({ control, name: "steps" });
  // useWatch re-renders just for this field, so the guardian box can appear and disappear.
  const isAdult = useWatch({ control, name: "isAdult" });

  // Runs only after the client-side schema passed.
  const onValid = async (_data: RecipeSubmission, event?: BaseSyntheticEvent) => {
    setFormError(null);
    // Send the raw input values; the server parses them with the same schema.
    const formData = toSubmissionFormData(getValues());
    const form = event?.target instanceof HTMLFormElement ? event.target : null;
    const token = form ? new FormData(form).get("cf-turnstile-response") : null;
    if (typeof token === "string") formData.set("cf-turnstile-response", token);

    const result = await submitRecipe(formData);
    if (result.ok) {
      setSent(true);
      router.push("/submit/thanks");
      return;
    }

    if (result.formError) setFormError(result.formError);
    // Put the server's errors back on the fields they belong to.
    Object.entries(result.fieldErrors ?? {}).forEach(([name, messages], i) => {
      if (messages?.[0]) {
        setError(name as FieldPath<RecipeSubmissionInput>, { type: "server", message: messages[0] }, { shouldFocus: i === 0 });
      }
    });
  };

  const arrayError = (e: { message?: string; root?: { message?: string } } | undefined) => e?.message ?? e?.root?.message;
  const busy = isSubmitting || sent;

  return (
    <form className="submit-form" noValidate onSubmit={handleSubmit(onValid)}>
      {formError && (
        <div className="form-banner" role="alert">
          {formError}
        </div>
      )}

      {/* ---------- 1. The dish ---------- */}
      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">1</span> The dish
        </legend>

        <div className="field">
          <label htmlFor="title">What do you call it?</label>
          <input type="text" autoComplete="off" placeholder="Ẹ̀fọ́ Rírò" {...register("title")} {...a11y("title", { error: errors.title?.message })} />
          <FieldError id="title-error" message={errors.title?.message} />
        </div>

        <div className="field">
          <label htmlFor="description">Tell us a little about it</label>
          <textarea rows={3} {...register("description")} {...a11y("description", { error: errors.description?.message, hint: true })} />
          <Hint id="description">One or two sentences for the recipe card (20 to 200 characters).</Hint>
          <FieldError id="description-error" message={errors.description?.message} />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="category">Category</label>
            <select defaultValue="" {...register("category")} {...a11y("category", { error: errors.category?.message })}>
              <option value="" disabled>
                Pick one…
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
            <FieldError id="category-error" message={errors.category?.message} />
          </div>

          <div className="field">
            <label htmlFor="effort">How much stirring?</label>
            <select defaultValue="" {...register("effort")} {...a11y("effort", { error: errors.effort?.message })}>
              <option value="" disabled>
                Pick one…
              </option>
              {EFFORTS.map((e) => (
                <option key={e} value={e}>
                  {effortLabels[e]}
                </option>
              ))}
            </select>
            <FieldError id="effort-error" message={errors.effort?.message} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="totalMinutes">Total time (minutes)</label>
            <input type="number" inputMode="numeric" min={5} max={720} {...register("totalMinutes")} {...a11y("totalMinutes", { error: errors.totalMinutes?.message })} />
            <FieldError id="totalMinutes-error" message={errors.totalMinutes?.message} />
          </div>
          <div className="field">
            <label htmlFor="serves">Serves</label>
            <input type="number" inputMode="numeric" min={1} max={30} {...register("serves")} {...a11y("serves", { error: errors.serves?.message })} />
            <FieldError id="serves-error" message={errors.serves?.message} />
          </div>
        </div>
      </fieldset>

      {/* ---------- 2. Ingredients (useFieldArray) ---------- */}
      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">2</span> Into the pot
        </legend>
        <ol className="list-editor">
          {ingredients.fields.map((field, index) => {
            const error = errors.ingredients?.[index]?.text?.message;
            const id = `ingredients-${index}`;
            return (
              // field.id is a stable key. Using the index would mix up inputs when rows move.
              <li key={field.id}>
                <label htmlFor={id} className="sr-only">
                  Ingredient {index + 1}
                </label>
                <input type="text" placeholder={index === 0 ? "2 cups ground egusi" : ""} {...register(`ingredients.${index}.text`)} {...a11y(id, { error })} />
                <RowTools
                  label={`ingredient ${index + 1}`}
                  index={index}
                  count={ingredients.fields.length}
                  onMove={ingredients.move}
                  onRemove={() => ingredients.remove(index)}
                />
                <FieldError id={`${id}-error`} message={error} />
              </li>
            );
          })}
        </ol>
        <FieldError id="ingredients-error" message={arrayError(errors.ingredients)} />
        {ingredients.fields.length < 30 && (
          <button type="button" className="add-row" onClick={() => ingredients.append({ text: "" })}>
            <Plus aria-hidden="true" /> Add an ingredient
          </button>
        )}
      </fieldset>

      {/* ---------- 3. Steps (useFieldArray) ---------- */}
      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">3</span> Let’s cook!
        </legend>
        <ol className="list-editor">
          {steps.fields.map((field, index) => {
            const error = errors.steps?.[index]?.text?.message;
            const id = `steps-${index}`;
            return (
              <li key={field.id}>
                <label htmlFor={id} className="sr-only">
                  Step {index + 1}
                </label>
                <textarea rows={2} {...register(`steps.${index}.text`)} {...a11y(id, { error })} />
                <RowTools label={`step ${index + 1}`} index={index} count={steps.fields.length} onMove={steps.move} onRemove={() => steps.remove(index)} />
                <FieldError id={`${id}-error`} message={error} />
              </li>
            );
          })}
        </ol>
        <FieldError id="steps-error" message={arrayError(errors.steps)} />
        {steps.fields.length < 20 && (
          <button type="button" className="add-row" onClick={() => steps.append({ text: "" })}>
            <Plus aria-hidden="true" /> Add a step
          </button>
        )}

        <div className="field">
          <span className="field-label" id="allergens-label">
            Contains any of these?
          </span>
          <div className="check-grid" role="group" aria-labelledby="allergens-label">
            {ALLERGENS.map((a) => (
              <label key={a} className="check-chip">
                <input type="checkbox" value={a} {...register("allergens")} /> {allergenLabels[a]}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      {/* ---------- 4. Photo (Controller) ---------- */}
      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">4</span> A photo
        </legend>
        <Controller
          name="image"
          control={control}
          render={({ field, fieldState }) => (
            <ImagePicker value={field.value} onChange={field.onChange} onBlur={field.onBlur} inputRef={field.ref} error={fieldState.error?.message} />
          )}
        />
        <Hint id="image">A JPG, PNG or WebP under 3 MB, at least 600 pixels on the short side. We remove location data from photos.</Hint>
        <FieldError id="image-error" message={errors.image?.message} />
      </fieldset>

      {/* ---------- 5. About you ---------- */}
      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">5</span> About you
        </legend>
        <div className="field-row">
          <div className="field">
            <label htmlFor="submitterName">Your name</label>
            <input type="text" autoComplete="name" {...register("submitterName")} {...a11y("submitterName", { error: errors.submitterName?.message })} />
            <FieldError id="submitterName-error" message={errors.submitterName?.message} />
          </div>
          <div className="field">
            <label htmlFor="submitterEmail">Email</label>
            <input type="email" autoComplete="email" {...register("submitterEmail")} {...a11y("submitterEmail", { error: errors.submitterEmail?.message, hint: true })} />
            <Hint id="submitterEmail">Only Mama sees this, never the public.</Hint>
            <FieldError id="submitterEmail-error" message={errors.submitterEmail?.message} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="submitterPhone">
              Phone <span className="optional">(optional)</span>
            </label>
            <input type="tel" autoComplete="tel" placeholder="0803 123 4567" {...register("submitterPhone")} {...a11y("submitterPhone", { error: errors.submitterPhone?.message })} />
            <FieldError id="submitterPhone-error" message={errors.submitterPhone?.message} />
          </div>
          <div className="field">
            <label htmlFor="creditName">
              Credit me as <span className="optional">(optional)</span>
            </label>
            <input type="text" placeholder="Mama Ada" {...register("creditName")} {...a11y("creditName", { error: errors.creditName?.message, hint: true })} />
            <Hint id="creditName">Shown on the recipe if Mama publishes it. Leave blank to stay anonymous.</Hint>
            <FieldError id="creditName-error" message={errors.creditName?.message} />
          </div>
        </div>

        <div className="field">
          <span className="field-label" id="isAdult-label">
            Are you 18 or older?
          </span>
          <div className="radio-row" role="radiogroup" aria-labelledby="isAdult-label" aria-describedby={errors.isAdult ? "isAdult-error" : undefined}>
            <label className="check-chip">
              <input type="radio" value="yes" {...register("isAdult")} /> Yes
            </label>
            <label className="check-chip">
              <input type="radio" value="no" {...register("isAdult")} /> No
            </label>
          </div>
          <FieldError id="isAdult-error" message={errors.isAdult?.message} />
        </div>

        {isAdult === "no" && (
          <div className="field">
            <label htmlFor="guardianEmail">Parent or guardian’s email</label>
            <input type="email" {...register("guardianEmail")} {...a11y("guardianEmail", { error: errors.guardianEmail?.message, hint: true })} />
            <Hint id="guardianEmail">We’ll only use it to let them know you shared a recipe.</Hint>
            <FieldError id="guardianEmail-error" message={errors.guardianEmail?.message} />
          </div>
        )}

        {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
      </fieldset>

      {/* ---------- 6. The fine print ---------- */}
      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">6</span> The fine print
        </legend>
        <div className="field">
          <label className="consent">
            <input type="checkbox" {...register("consentPublish")} {...a11y("consentPublish", { error: errors.consentPublish?.message })} />
            <span>Mama can edit and publish my recipe and photo on Mama Nkechi’s Pot.</span>
          </label>
          <FieldError id="consentPublish-error" message={errors.consentPublish?.message} />
        </div>
        <div className="field">
          <label className="consent">
            <input type="checkbox" {...register("consentPrivacy")} {...a11y("consentPrivacy", { error: errors.consentPrivacy?.message })} />
            <span>
              I’ve read the{" "}
              <Link href="/privacy" target="_blank">
                privacy notice
              </Link>
              .
            </span>
          </label>
          <FieldError id="consentPrivacy-error" message={errors.consentPrivacy?.message} />
        </div>

        {turnstileSiteKey && (
          <>
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
            <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
          </>
        )}
      </fieldset>

      <div className="form-actions">
        <CandyButton type="submit" disabled={busy} aria-live="polite">
          {busy ? "Sending to Mama…" : "Send to Mama →"}
        </CandyButton>
        <p className="field-hint">Nothing is public until Mama has a look.</p>
      </div>
    </form>
  );
}

/** Move up / move down / remove buttons for a list row. */
function RowTools({
  label,
  index,
  count,
  onMove,
  onRemove,
}: {
  label: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  return (
    <span className="row-tools">
      <button type="button" className="playful-icon" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ArrowUp aria-hidden="true" />
      </button>
      <button type="button" className="playful-icon" aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
        <ArrowDown aria-hidden="true" />
      </button>
      <button type="button" className="playful-icon" aria-label={`Remove ${label}`} disabled={count <= 1} onClick={onRemove}>
        <Trash2 aria-hidden="true" />
      </button>
    </span>
  );
}
