import Link from "next/link";
import { Heart } from "lucide-react";
import { CandyLink } from "./CandyButton";

/** Herb-green "Every pot has a story" band. */
export function KitchenNote() {
  return (
    <section className="kitchen-note" id="about" aria-labelledby="about-title">
      <span className="note-heart" aria-hidden="true">
        <Heart strokeWidth={1.4} />
      </span>
      <div>
        <div className="eyebrow">MORE THAN A RECIPE</div>
        <h2 id="about-title">Every pot has a story.</h2>
        <p>
          The best meals don’t just fill our bellies. They bring us home.
          <br className="desktop-break" />
          Here’s to the flavours we grew up with, and the memories we’re still making.
        </p>
        <p className="note-share">
          Got a pot with a story? <Link href="/submit">Share your recipe with Mama →</Link>
        </p>
      </div>
      <CandyLink variant="sweet" href="/#recipes">
        Back to the pot →
      </CandyLink>
    </section>
  );
}
