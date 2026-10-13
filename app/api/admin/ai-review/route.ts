import { generateText, Output } from "ai";
import { z } from "zod";
import { aiLogEntry, logAiCall } from "@/lib/ai/log";
import { AI_MODEL, reviewModel } from "@/lib/ai/model";
import { buildReviewContext, REVIEW_INSTRUCTIONS } from "@/lib/ai/review-context";
import { getAdmin } from "@/lib/auth/admin";
import { env } from "@/lib/env";
import { aiReviewSchema } from "@/lib/schemas/ai-review";

const ROUTE = "/api/admin/ai-review";
const bodySchema = z.object({ submissionId: z.uuid() });

/**
 * "Ask Mama's helper": an AI pre-review of one submission.
 *
 * 1. Admins only (checked here, not just in the proxy).
 * 2. The body is validated like any other input.
 * 3. The model only sees the allowlisted, redacted recipe (buildReviewContext).
 * 4. The reply must match aiReviewSchema, or the call fails.
 * 5. The result is stored and returned as suggestions. Nothing is approved here.
 * 6. Logs hold no prompt, reply or recipe text (lib/ai/log.ts).
 */
export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Admins only" }, { status: 403 });

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "Which submission?" }, { status: 400 });

  const { data: submission, error } = await admin.supabase
    .from("recipe_submissions")
    .select("*")
    .eq("id", body.data.submissionId)
    .maybeSingle();
  if (error || !submission) return Response.json({ error: "Submission not found" }, { status: 404 });

  const context = buildReviewContext(submission);
  const started = performance.now();

  try {
    const result = await generateText({
      model: reviewModel,
      system: REVIEW_INSTRUCTIONS,
      prompt: `Recipe to review (JSON):\n${JSON.stringify(context, null, 2)}`,
      output: Output.object({ schema: aiReviewSchema }),
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(45_000),
    });

    logAiCall(
      aiLogEntry({
        route: ROUTE,
        adminId: admin.user.id,
        salt: env.IP_HASH_SALT,
        model: AI_MODEL,
        ok: true,
        totalTokens: result.usage.totalTokens,
        durationMs: performance.now() - started,
      }),
    );

    await admin.supabase.from("recipe_submissions").update({ ai_review: result.output }).eq("id", submission.id);
    return Response.json({ review: result.output });
  } catch {
    logAiCall(
      aiLogEntry({
        route: ROUTE,
        adminId: admin.user.id,
        salt: env.IP_HASH_SALT,
        model: AI_MODEL,
        ok: false,
        durationMs: performance.now() - started,
      }),
    );
    return Response.json(
      { error: "Mama’s helper is busy right now. Try again in a minute, or review this one yourself." },
      { status: 502 },
    );
  }
}
