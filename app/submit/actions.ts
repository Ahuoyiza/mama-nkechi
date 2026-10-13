"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { env } from "@/lib/env";
import { verifyAndCleanImage } from "@/lib/images/verify";
import { recipeSubmissionSchema } from "@/lib/schemas/submission";
import { fromSubmissionFormData } from "@/lib/submissions/form-data";
import { clientIpFrom, hashIp } from "@/lib/submissions/ip-hash";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";

export type SubmitResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string[] | undefined>; formError?: string };

/**
 * Receives the "Share your pot" form.
 *
 * The parameter is typed `unknown` on purpose. TypeScript types vanish at
 * runtime, and a server action is a public endpoint: anyone can call it with
 * any body using curl or Postman, skipping our form completely. Treat the
 * input as untrusted until Zod has checked it.
 */
export async function submitRecipe(input: unknown): Promise<SubmitResult> {
  if (!(input instanceof FormData)) return { ok: false, formError: "Something went wrong. Please try again." };
  const formData = input;

  // 1. Honeypot: people never see the "website" box, bots fill it in.
  //    Pretend it worked so the bot learns nothing.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.length > 0) return { ok: true };

  const requestHeaders = await headers();
  const ip = clientIpFrom(requestHeaders);

  // 2. Turnstile (optional, behind an env flag).
  if (env.TURNSTILE_ENABLED) {
    const token = formData.get("cf-turnstile-response");
    if (!(await verifyTurnstile(typeof token === "string" ? token : null, ip))) {
      return { ok: false, formError: "Please complete the “are you human?” check and try again." };
    }
  }

  // 3. Rate limit: at most SUBMISSIONS_PER_DAY per email and per connection.
  const supabase = createSupabaseAdminClient();
  const ipHash = hashIp(ip, env.IP_HASH_SALT);
  const rawEmail = formData.get("submitterEmail");
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const countSince = async (column: "ip_hash" | "submitter_email", value: string) => {
    const { count, error } = await supabase
      .from("recipe_submissions")
      .select("id", { count: "exact", head: true })
      .eq(column, value)
      .gte("created_at", since);
    if (error) throw new Error(`Rate limit check failed: ${error.message}`);
    return count ?? 0;
  };

  const [byIp, byEmail] = await Promise.all([countSince("ip_hash", ipHash), email ? countSince("submitter_email", email) : 0]);
  if (byIp >= env.SUBMISSIONS_PER_DAY || byEmail >= env.SUBMISSIONS_PER_DAY) {
    return {
      ok: false,
      formError: "Mama’s pot is full for today! You can share more recipes tomorrow.",
    };
  }

  // 4. Validate with the SAME schema the form used.
  const parsed = recipeSubmissionSchema.safeParse(fromSubmissionFormData(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const data = parsed.data;

  // 5. Re-check the photo's real bytes, then strip its metadata.
  const image = await verifyAndCleanImage(data.image);
  if (!image.ok) return { ok: false, fieldErrors: { image: [image.message] } };

  const imagePath = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${image.extension}`;
  const upload = await supabase.storage
    .from("submission-images")
    .upload(imagePath, image.buffer, { contentType: image.contentType, upsert: false });
  if (upload.error) return { ok: false, formError: "We couldn’t save your photo. Please try again." };

  // 6. Insert with the service role (submissions have no public RLS policies).
  const { error } = await supabase.from("recipe_submissions").insert({
    title: data.title,
    description: data.description,
    category: data.category,
    effort: data.effort,
    total_minutes: data.totalMinutes,
    serves: data.serves,
    ingredients: data.ingredients,
    steps: data.steps,
    allergens: data.allergens,
    image_path: imagePath,
    submitter_name: data.submitterName,
    submitter_email: data.submitterEmail,
    submitter_phone: data.submitterPhone ?? null,
    credit_name: data.creditName ?? null,
    is_adult: data.isAdult,
    guardian_email: data.isAdult ? null : (data.guardianEmail ?? null),
    consent_publish: data.consentPublish,
    consent_privacy: data.consentPrivacy,
    ip_hash: ipHash,
  });

  if (error) {
    await supabase.storage.from("submission-images").remove([imagePath]);
    return { ok: false, formError: "Something went wrong saving your recipe. Please try again." };
  }

  // 7. Done. The client redirects to /submit/thanks.
  return { ok: true };
}
