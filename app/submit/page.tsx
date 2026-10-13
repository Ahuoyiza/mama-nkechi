import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { Sparkle, Squiggle } from "@/components/doodles";
import { SubmitForm } from "@/components/submit/SubmitForm";

export const metadata: Metadata = {
  title: "Share your pot | Mama Nkechi’s Pot",
  description: "Send Mama your favourite Nigerian recipe.",
};

export default function SubmitPage() {
  // The site key is public. The secret key stays on the server (lib/env.ts).
  const turnstileSiteKey =
    process.env.TURNSTILE_ENABLED === "true" ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY : undefined;

  return (
    <>
      <SiteHeader current="submit" />
      <main className="submit-page">
        <div className="submit-intro">
          <div className="eyebrow">
            <Sparkle aria-hidden="true" /> FROM YOUR KITCHEN TO MINE
          </div>
          <h1>
            Share your pot
            <span className="title-doodle" aria-hidden="true">
              <Squiggle />
            </span>
          </h1>
          <p>
            Got a recipe your family fights over? Send it to Mama. She reads every one, tidies it up with love, and
            the best ones join the pot (with your name on them, if you like).
          </p>
        </div>
        {/* useFieldArray creates random row ids, so the form renders per request, not at build time. */}
        <Suspense fallback={<div className="form-panel form-loading">Warming up the pot…</div>}>
          <SubmitForm turnstileSiteKey={turnstileSiteKey} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
