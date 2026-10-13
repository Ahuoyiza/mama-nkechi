import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { Squiggle } from "@/components/doodles";

export const metadata: Metadata = {
  title: "Privacy notice | Mama Nkechi’s Pot",
  description: "What Mama Nkechi’s Pot collects when you share a recipe, why, and how to ask for it to be deleted.",
};

const CONTACT = "sophia@ahuoyiza.com";

/**
 * Plain-language privacy notice, written with the Nigeria Data Protection
 * Act 2023 (NDPA) in mind. Kept short on purpose: people should be able to
 * read it in two minutes before they tick the box.
 */
export default function PrivacyPage() {
  return (
    <>
      <SiteHeader current={null} />
      <main className="prose-page">
        <div className="eyebrow">THE FINE PRINT, IN PLAIN WORDS</div>
        <h1>
          Your privacy
          <span className="title-doodle" aria-hidden="true">
            <Squiggle />
          </span>
        </h1>
        <p className="lead">
          Mama Nkechi’s Pot only asks for what it needs to share your recipe and to get back to you. Here’s exactly
          what happens to it.
        </p>

        <section>
          <h2>Just browsing?</h2>
          <p>
            You don’t need an account to read recipes. Recipes you “save” with the heart are kept in your own browser
            only. They never reach us.
          </p>
        </section>

        <section>
          <h2>What we collect when you share a recipe</h2>
          <table className="privacy-table">
            <thead>
              <tr>
                <th scope="col">What</th>
                <th scope="col">Why</th>
                <th scope="col">Who sees it</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Your recipe and photo</td>
                <td>So Mama can review it and, if you agree, publish it</td>
                <td>Mama; the public only if it’s approved</td>
              </tr>
              <tr>
                <td>Your name and email</td>
                <td>So Mama can contact you about your recipe</td>
                <td>Mama only, never published</td>
              </tr>
              <tr>
                <td>Your phone number (optional)</td>
                <td>Only if you’d like a call or message about your recipe</td>
                <td>Mama only, never published</td>
              </tr>
              <tr>
                <td>The name to credit you by (optional)</td>
                <td>To thank you on the recipe page</td>
                <td>The public, if your recipe is published</td>
              </tr>
              <tr>
                <td>A parent or guardian’s email (under-18s)</td>
                <td>So a grown-up knows you shared a recipe</td>
                <td>Mama only</td>
              </tr>
              <tr>
                <td>A scrambled code made from your internet connection</td>
                <td>To stop spam (a few submissions per day). We never store your actual IP address</td>
                <td>No one; it can’t be turned back into your address</td>
              </tr>
            </tbody>
          </table>
          <p>
            We remove hidden data from photos, such as the location where they were taken, before we store them.
          </p>
        </section>

        <section>
          <h2>Our recipe helper (AI)</h2>
          <p>
            Before Mama reviews a recipe, she may ask an AI helper (Google Gemini) to spot missing ingredients,
            likely allergens or a cooking time that doesn’t add up. <strong>Only the recipe itself is sent</strong>:
            the title, description, ingredients, steps, time and serving size. Your name, email, phone number and
            photo are never sent. We also blank out anything that looks like an email or phone number in the recipe
            text first.
          </p>
          <p>
            This service is run outside Nigeria. The AI only makes suggestions: Mama decides what is published.
          </p>
        </section>

        <section>
          <h2>How long we keep it</h2>
          <ul>
            <li>
              <strong>Published recipes</strong> stay up until you or Mama remove them.
            </li>
            <li>
              <strong>Recipes Mama doesn’t publish</strong> are deleted, with their photos, 30 days after she decides.
            </li>
          </ul>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            You can ask to see what we hold about you, correct it, or have it deleted, at any time. Email{" "}
            <a href={`mailto:${CONTACT}?subject=Privacy%20request`}>{CONTACT}</a> from the address you used and we’ll
            reply within 30 days. If you’re not happy with our answer, you can contact the Nigeria Data Protection
            Commission.
          </p>
        </section>

        <p className="prose-footnote">
          Last updated October 2026. <Link href="/submit">Back to sharing your pot →</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
