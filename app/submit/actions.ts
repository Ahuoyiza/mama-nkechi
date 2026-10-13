"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { fromSubmissionFormData } from "@/lib/submissions/form-data";
import { clientIpFrom, hashIp } from "@/lib/submissions/ip-hash";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

export type SubmitResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string[] | undefined>; formError?: string };

type Enums = Database["public"]["Enums"];

/**
 * Receives the "Share your pot" form.
 *
 * WARNING: this version trusts whatever it is sent. The browser form checks
 * the data, but anyone can call this server action directly (DevTools,
 * curl, Postman) and skip the form completely.
 */
export async function submitRecipe(input: unknown): Promise<SubmitResult> {
  if (!(input instanceof FormData)) return { ok: false, formError: "Something went wrong. Please try again." };
  const formData = input;

  // TODO (Activity 3): Honeypot. If the hidden "website" field has anything in
  // it, a bot filled it in. Return { ok: true } without saving, so the bot
  // thinks it worked. (Lesson: "Spam protection")

  // TODO (Activity 3): Rate limit. Count this email's and this connection's
  // submissions in the last 24 hours (hash the IP with hashIp() and
  // env.IP_HASH_SALT) and stop at env.SUBMISSIONS_PER_DAY.

  // TODO (Activity 3): Validate with recipeSubmissionSchema.safeParse(...).
  // On failure return { ok: false, fieldErrors: z.flattenError(error).fieldErrors }
  // so the form can show each message under its field.
  const raw = fromSubmissionFormData(formData);
  const text = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : "");

  const image = raw.image;
  if (!(image instanceof File)) return { ok: false, formError: "Please add a photo." };

  // TODO (Activity 3): Re-check the photo on the server with
  // verifyAndCleanImage() from lib/images/verify.ts (magic bytes, minimum
  // size, strip EXIF). Right now the original file is stored as it came,
  // GPS location and all.
  const supabase = createSupabaseAdminClient();
  const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
  const imagePath = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
  const upload = await supabase.storage
    .from("submission-images")
    .upload(imagePath, image, { contentType: image.type, upsert: false });
  if (upload.error) return { ok: false, formError: "We couldn’t save your photo. Please try again." };

  const ip = clientIpFrom(await headers());

  const { error } = await supabase.from("recipe_submissions").insert({
    title: text("title"),
    description: text("description"),
    category: text("category") as Enums["recipe_category"],
    effort: text("effort") as Enums["recipe_effort"],
    total_minutes: Number(text("totalMinutes")),
    serves: Number(text("serves")),
    ingredients: (raw.ingredients ?? []) as never,
    steps: (raw.steps ?? []) as never,
    allergens: (raw.allergens ?? []) as string[],
    image_path: imagePath,
    submitter_name: text("submitterName"),
    submitter_email: text("submitterEmail"),
    submitter_phone: text("submitterPhone") || null,
    credit_name: text("creditName") || null,
    is_adult: text("isAdult") !== "no",
    guardian_email: text("guardianEmail") || null,
    consent_publish: raw.consentPublish === true,
    consent_privacy: raw.consentPrivacy === true,
    ip_hash: hashIp(ip, env.IP_HASH_SALT),
  });

  if (error) {
    await supabase.storage.from("submission-images").remove([imagePath]);
    // The database's CHECK constraints are the last line of defence. When
    // they catch something, all we can say is "something went wrong".
    return { ok: false, formError: "Something went wrong saving your recipe. Please try again." };
  }

  return { ok: true };
}
