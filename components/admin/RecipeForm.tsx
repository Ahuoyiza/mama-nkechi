"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch, type DefaultValues, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { saveRecipe } from "@/app/admin/actions";
import { CandyButton } from "@/components/CandyButton";
import { FieldError, Hint, a11y } from "@/components/submit/Field";
import { RowTools } from "@/components/submit/RowTools";
import { allergenLabels, categoryLabels, effortLabels } from "@/lib/recipes/labels";
import { toRecipeFormData } from "@/lib/recipes/form-data";
import { ALLERGENS, CARD_COLOURS, CATEGORIES, EFFORTS } from "@/lib/recipes/types";
import { recipeSchema, type RecipeFormInput, type RecipeFormOutput } from "@/lib/schemas/recipe";
import { slugify } from "@/lib/slugify";

type Props = {
  recipeId: string | null; // null = a new recipe
  defaultValues?: DefaultValues<RecipeFormInput>;
  currentImageUrl?: string | null;
};

const EMPTY: DefaultValues<RecipeFormInput> = {
  title: "",
  slug: "",
  description: "",
  tag: "",
  totalMinutes: "",
  serves: "4",
  ingredients: [{ text: "" }, { text: "" }],
  steps: [{ text: "" }, { text: "" }],
  allergens: [],
  cardColour: "peach",
  imageStyle: "photo",
  published: true,
  creditName: "",
};

/** Mama's own recipes: the same recipeSchema checks this form here and again on the server. */
export function RecipeForm({ recipeId, defaultValues = EMPTY, currentImageUrl = null }: Props) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [paint, setPaint] = useState(true);
  const [slugTouched, setSlugTouched] = useState(recipeId !== null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormInput, unknown, RecipeFormOutput>({
    resolver: zodResolver(recipeSchema),
    mode: "onTouched",
    defaultValues,
  });
  const ingredients = useFieldArray({ control, name: "ingredients" });
  const steps = useFieldArray({ control, name: "steps" });
  const imageStyle = useWatch({ control, name: "imageStyle" });
  const slug = useWatch({ control, name: "slug" });

  // A new recipe's web address follows its title until Mama edits it herself.
  const titleField = register("title", {
    onChange: (e: { target: { value: string } }) => {
      if (!slugTouched) setValue("slug", slugify(e.target.value), { shouldValidate: false });
    },
  });

  const onValid = async () => {
    setFormError(null);
    setImageError(null);
    if (!recipeId && !image) {
      setImageError("Add a photo or picture for the card");
      return;
    }
    const result = await saveRecipe(recipeId, toRecipeFormData(getValues(), { image, paint }));
    if (result.ok) {
      router.push("/admin/recipes");
      router.refresh();
      return;
    }
    if (result.formError) setFormError(result.formError);
    Object.entries(result.fieldErrors ?? {}).forEach(([name, messages], i) => {
      if (!messages?.[0]) return;
      if (name === "image") setImageError(messages[0]);
      else setError(name as FieldPath<RecipeFormInput>, { message: messages[0] }, { shouldFocus: i === 0 });
    });
  };

  const arrayError = (e: { message?: string; root?: { message?: string } } | undefined) => e?.message ?? e?.root?.message;

  return (
    <form className="submit-form" noValidate onSubmit={handleSubmit(onValid)}>
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
          <label htmlFor="title">Name</label>
          <input type="text" {...titleField} {...a11y("title", { error: errors.title?.message })} />
          <FieldError id="title-error" message={errors.title?.message} />
        </div>
        <div className="field">
          <label htmlFor="slug">Web address</label>
          <input
            type="text"
            {...register("slug", { onChange: () => setSlugTouched(true) })}
            {...a11y("slug", { error: errors.slug?.message, hint: true })}
          />
          <Hint id="slug">mama-nkechi.vercel.app/recipes/<strong>{slug || "…"}</strong></Hint>
          <FieldError id="slug-error" message={errors.slug?.message} />
        </div>
        <div className="field">
          <label htmlFor="description">Card description</label>
          <textarea rows={3} {...register("description")} {...a11y("description", { error: errors.description?.message })} />
          <FieldError id="description-error" message={errors.description?.message} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="category">Category</label>
            <select {...register("category")} {...a11y("category", { error: errors.category?.message })}>
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
            <select {...register("effort")} {...a11y("effort", { error: errors.effort?.message })}>
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
            <input type="number" inputMode="numeric" {...register("totalMinutes")} {...a11y("totalMinutes", { error: errors.totalMinutes?.message })} />
            <FieldError id="totalMinutes-error" message={errors.totalMinutes?.message} />
          </div>
          <div className="field">
            <label htmlFor="serves">Serves</label>
            <input type="number" inputMode="numeric" {...register("serves")} {...a11y("serves", { error: errors.serves?.message })} />
            <FieldError id="serves-error" message={errors.serves?.message} />
          </div>
        </div>
      </fieldset>

      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">2</span> Into the pot
        </legend>
        <ol className="list-editor">
          {ingredients.fields.map((field, index) => {
            const error = errors.ingredients?.[index]?.text?.message;
            const id = `ingredients-${index}`;
            return (
              <li key={field.id}>
                <label htmlFor={id} className="sr-only">
                  Ingredient {index + 1}
                </label>
                <input type="text" {...register(`ingredients.${index}.text`)} {...a11y(id, { error })} />
                <RowTools label={`ingredient ${index + 1}`} index={index} count={ingredients.fields.length} onMove={ingredients.move} onRemove={() => ingredients.remove(index)} />
                <FieldError id={`${id}-error`} message={error} />
              </li>
            );
          })}
        </ol>
        <FieldError id="ingredients-error" message={arrayError(errors.ingredients)} />
        <button type="button" className="add-row" onClick={() => ingredients.append({ text: "" })}>
          <Plus aria-hidden="true" /> Add an ingredient
        </button>
      </fieldset>

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
        <button type="button" className="add-row" onClick={() => steps.append({ text: "" })}>
          <Plus aria-hidden="true" /> Add a step
        </button>
        <div className="field">
          <span className="field-label" id="allergens-label">
            Contains
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

      <fieldset className="form-panel">
        <legend>
          <span className="panel-number">4</span> The card
        </legend>
        <div className="field">
          <label htmlFor="tag">Card tag</label>
          <input type="text" maxLength={30} placeholder="THE PARTY FAVOURITE" {...register("tag")} {...a11y("tag", { error: errors.tag?.message })} />
          <FieldError id="tag-error" message={errors.tag?.message} />
        </div>
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
          <label htmlFor="image">{recipeId ? "Replace the picture (optional)" : "Photo or picture"}</label>
          {currentImageUrl && !image && (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of the current card picture
            <img src={currentImageUrl} alt="Current card picture" className="admin-current-image" />
          )}
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-invalid={imageError ? true : undefined}
            aria-describedby={imageError ? "image-error" : "image-hint"}
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
          <Hint id="image">JPG, PNG or WebP under 3 MB, at least 600 pixels on the short side.</Hint>
          <FieldError id="image-error" message={imageError ?? undefined} />
          {image && (
            <label className="consent">
              <input type="checkbox" checked={paint} onChange={(e) => setPaint(e.target.checked)} />
              <span>Paint it Mama’s way (shown as an illustration on the card)</span>
            </label>
          )}
        </div>
        {!image && (
          <div className="field">
            <span className="field-label" id="style-label">
              Show the current picture as
            </span>
            <div className="radio-row" role="radiogroup" aria-labelledby="style-label">
              <label className="check-chip">
                <input type="radio" value="illustration" {...register("imageStyle")} /> Illustration
              </label>
              <label className="check-chip">
                <input type="radio" value="photo" {...register("imageStyle")} /> Photo (polaroid)
              </label>
            </div>
            {imageStyle === "photo" && <p className="field-hint">Transparent illustrations look best as “Illustration”.</p>}
          </div>
        )}
        <div className="field">
          <label htmlFor="creditName">
            Credit <span className="optional">(optional)</span>
          </label>
          <input type="text" {...register("creditName")} {...a11y("creditName", { error: errors.creditName?.message })} />
          <FieldError id="creditName-error" message={errors.creditName?.message} />
        </div>
        <label className="consent">
          <input type="checkbox" {...register("published")} />
          <span>Published (visible on the site)</span>
        </label>
      </fieldset>

      <div className="form-actions">
        <CandyButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : recipeId ? "Save changes" : "Add to the pot →"}
        </CandyButton>
      </div>
    </form>
  );
}
