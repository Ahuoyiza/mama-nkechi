import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { CandyLink } from "@/components/CandyButton";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { LoveStamp, Sparkle } from "@/components/doodles";

export const metadata: Metadata = { title: "Thank you! | Mama Nkechi’s Pot" };

export default function ThanksPage() {
  return (
    <>
      <SiteHeader current={null} />
      <main className="thanks-page">
        <div className="thanks-card">
          <span className="thanks-spark" aria-hidden="true">
            <Sparkle filled />
          </span>
          <Heart className="thanks-heart" aria-hidden="true" strokeWidth={1.4} />
          <div className="eyebrow">RECIPE RECEIVED</div>
          <h1>Mama don collect am!</h1>
          <p>
            Thank you for sharing your pot. Mama reads every recipe herself, so give her a little time. If she
            publishes it, you’ll find it on the home page.
          </p>
          <div className="thanks-actions">
            <CandyLink href="/#recipes">See wetin dey pot →</CandyLink>
            <CandyLink href="/submit" variant="sweet">
              Share another
            </CandyLink>
          </div>
          <LoveStamp className="love-stamp thanks-stamp" />
        </div>
      </main>
      <Footer />
    </>
  );
}
