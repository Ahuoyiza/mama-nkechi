"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/auth/admin";
import { paintDish, paintedPath } from "@/lib/images/paint";
import { verifyAndCleanImage } from "@/lib/images/verify";
import { fromRecipeFormData } from "@/lib/recipes/form-data";
import { RECIPES_TAG } from "@/lib/recipes/queries";
import { recipeSchema } from "@/lib/schemas/recipe";
import { reviewDecisionSchema } from "@/lib/schemas/review-decision";
import { slugify } from "@/lib/slugify";

export type ActionResult = { ok: true } | { ok: false; fieldErrors?: Record<string, string[] | undefined>; formError?: string };

const NOT_ADMIN: ActionResult = { ok: false, formError: "Please sign in again." };

/**
 * Approve or reject a submission.
 *
 * Every admin action checks is_admin() itself (getAdmin), even though the
 * proxy already guards /admin: actions are public endpoints like any other.
 * The decision is validated with reviewDecisionSchema, a discriminated union.
 */
export async function decideSubmission(submissionId: unknown, input: unknown): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return NOT_ADMIN;

  const id = z.uuid().safeParse(submissionId);
  if (!id.success) return { ok: false, formError: "Unknown submission." };

  const parsed = reviewDecisionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const decision = parsed.data;
  const { supabase } = admin;

  if (decision.decision === "reject") {
    // TypeScript knows reviewNote exists here, and cardColour doesn't.
    const { error } = await supabase
      .from("recipe_submissions")
      .update({ status: "rejected", review_note: decision.reviewNote, reviewed_at: new Date().toISOString() })
      .eq("id", id.data)
      .eq("status", "pending");
    if (error) return { ok: false, formError: "Couldn’t save the rejection. Please try again." };
    return { ok: true };
  }

  const { data: submission } = await supabase.from("recipe_submissions").select("*").eq("id", id.data).maybeSingle();
  if (!submission) return { ok: false, formError: "Submission not found." };
  if (submission.status !== "pending") return { ok: false, formError: "This one has already been reviewed." };

  // Copy the chosen picture from the private bucket to the public one:
  // the painted version for "illustration", the cleaned photo for "photo".
  const sourcePath = decision.imageStyle === "illustration" ? paintedPath(submission.id) : submission.image_path;
  const extension = sourcePath.split(".").pop() || "webp";
  const publicPath = `submissions/${submission.id}.${extension}`;
  const download = await supabase.storage.from("submission-images").download(sourcePath);
  if (download.error) {
    return decision.imageStyle === "illustration"
      ? { ok: false, fieldErrors: { imageStyle: ["Paint it first, or choose the photo"] } }
      : { ok: false, formError: "Couldn’t read the submitted photo." };
  }
  const upload = await supabase.storage
    .from("recipe-images")
    .upload(publicPath, download.data, { contentType: download.data.type || "image/webp", upsert: true });
  if (upload.error) return { ok: false, formError: "Couldn’t publish the photo." };

  // One database transaction: create the recipe AND mark the submission approved.
  const { error } = await supabase.rpc("approve_submission", {
    p_submission_id: submission.id,
    p_slug: slugify(submission.title) || "recipe",
    p_tag: decision.tag,
    p_card_colour: decision.cardColour,
    p_image_style: decision.imageStyle,
    p_image_path: publicPath,
  });
  if (error) {
    await supabase.storage.from("recipe-images").remove([publicPath]);
    return { ok: false, formError: error.message };
  }

  updateTag(RECIPES_TAG); // show the new recipe on the site straight away
  return { ok: true };
}

/**
 * "Paint it Mama's way": make a painted version of the submitted photo.
 * Plain image processing on our server (lib/images/paint.ts), so the photo is
 * never sent to an outside service. Saved privately until Mama approves.
 */
export async function paintSubmission(submissionId: unknown): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return NOT_ADMIN;
  const id = z.uuid().safeParse(submissionId);
  if (!id.success) return { ok: false, formError: "Unknown submission." };

  const { supabase } = admin;
  const { data: submission } = await supabase.from("recipe_submissions").select("id, image_path").eq("id", id.data).maybeSingle();
  if (!submission) return { ok: false, formError: "Submission not found." };

  const original = await supabase.storage.from("submission-images").download(submission.image_path);
  if (original.error) return { ok: false, formError: "Couldn’t read the submitted photo." };

  const painted = await paintDish(Buffer.from(await original.data.arrayBuffer()));
  const upload = await supabase.storage
    .from("submission-images")
    .upload(paintedPath(submission.id), painted, { contentType: "image/png", upsert: true });
  if (upload.error) return { ok: false, formError: "Couldn’t save the painted picture." };

  return { ok: true };
}

/**
 * Create (recipeId = null) or edit one of Mama's recipes.
 * Same pattern as the public form: FormData in, recipeSchema.safeParse on the
 * server, the photo re-checked and cleaned, optionally painted Mama's way.
 */
export async function saveRecipe(recipeId: unknown, input: unknown): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return NOT_ADMIN;
  if (!(input instanceof FormData)) return { ok: false, formError: "Something went wrong." };

  const id = recipeId === null ? null : z.uuid().safeParse(recipeId);
  if (id && !id.success) return { ok: false, formError: "Unknown recipe." };

  const { values, image, paint } = fromRecipeFormData(input);
  const parsed = recipeSchema.safeParse(values);
  if (!parsed.success) return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const recipe = parsed.data;
  const { supabase } = admin;

  const existing = id
    ? (await supabase.from("recipes").select("image_path, published_at").eq("id", id.data).maybeSingle()).data
    : null;
  if (id && !existing) return { ok: false, formError: "Recipe not found." };
  if (!existing && !image) return { ok: false, fieldErrors: { image: ["Add a photo or picture for the card"] } };

  let imagePath = existing?.image_path ?? "";
  let imageStyle = recipe.imageStyle;
  let uploadedPath: string | null = null;

  if (image) {
    const clean = await verifyAndCleanImage(image);
    if (!clean.ok) return { ok: false, fieldErrors: { image: [clean.message] } };
    const picture = paint ? await paintDish(clean.buffer) : clean.buffer;
    if (paint) imageStyle = "illustration";
    const extension = paint ? "png" : clean.extension;
    uploadedPath = `mama/${recipe.slug}-${randomUUID().slice(0, 8)}.${extension}`;
    const upload = await supabase.storage
      .from("recipe-images")
      .upload(uploadedPath, picture, { contentType: paint ? "image/png" : clean.contentType });
    if (upload.error) return { ok: false, formError: "Couldn’t save the picture." };
    imagePath = uploadedPath;
  }

  const row = {
    slug: recipe.slug,
    title: recipe.title,
    description: recipe.description,
    tag: recipe.tag,
    category: recipe.category,
    effort: recipe.effort,
    total_minutes: recipe.totalMinutes,
    serves: recipe.serves,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    allergens: recipe.allergens,
    image_path: imagePath,
    card_colour: recipe.cardColour,
    image_style: imageStyle,
    credit_name: recipe.creditName ?? null,
    published: recipe.published,
    published_at: recipe.published ? (existing?.published_at ?? new Date().toISOString()) : null,
  };

  const { error } = id
    ? await supabase.from("recipes").update(row).eq("id", id.data)
    : await supabase.from("recipes").insert(row);

  if (error) {
    if (uploadedPath) await supabase.storage.from("recipe-images").remove([uploadedPath]);
    if (error.code === "23505") return { ok: false, fieldErrors: { slug: ["Another recipe already uses this web address"] } };
    return { ok: false, formError: "Couldn’t save the recipe. Please try again." };
  }

  // Replaced the picture? Remove the old upload (seed art in /public stays).
  if (uploadedPath && existing && !existing.image_path.startsWith("/")) {
    await supabase.storage.from("recipe-images").remove([existing.image_path]);
  }

  updateTag(RECIPES_TAG);
  return { ok: true };
}

export async function setRecipePublished(recipeId: unknown, published: unknown): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return NOT_ADMIN;
  const input = z.object({ id: z.uuid(), published: z.boolean() }).safeParse({ id: recipeId, published });
  if (!input.success) return { ok: false, formError: "Something went wrong." };

  const { error } = await admin.supabase
    .from("recipes")
    .update({ published: input.data.published, published_at: input.data.published ? new Date().toISOString() : null })
    .eq("id", input.data.id);
  if (error) return { ok: false, formError: "Couldn’t update the recipe." };

  updateTag(RECIPES_TAG);
  return { ok: true };
}

export async function deleteRecipe(recipeId: unknown): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return NOT_ADMIN;
  const id = z.uuid().safeParse(recipeId);
  if (!id.success) return { ok: false, formError: "Unknown recipe." };

  const { data: recipe } = await admin.supabase.from("recipes").delete().eq("id", id.data).select("image_path").maybeSingle();
  if (!recipe) return { ok: false, formError: "Couldn’t delete the recipe." };
  // Seed art lives in /public ("/images/…"); uploaded photos live in the bucket.
  if (!recipe.image_path.startsWith("/")) {
    await admin.supabase.storage.from("recipe-images").remove([recipe.image_path]);
  }

  updateTag(RECIPES_TAG);
  return { ok: true };
}

export async function signOut() {
  const admin = await getAdmin();
  await admin?.supabase.auth.signOut();
  redirect("/admin/login");
}
