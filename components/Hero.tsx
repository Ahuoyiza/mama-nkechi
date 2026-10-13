import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Asterisk, Heart } from "lucide-react";
import { CandyLink } from "./CandyButton";
import { HandArrow, LoveStamp, Sparkle } from "./doodles";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="eyebrow">
            <Asterisk className="little-star" aria-hidden="true" strokeWidth={2} /> FROM MY KITCHEN, WITH LOVE
          </div>
          <h1 id="hero-title">
            Mama Nkechi’s
            <br />
            <span className="pot-word">
              Pot
              <span className="heading-spark" aria-hidden="true">
                <Sparkle />
              </span>
            </span>
          </h1>
          <h2>A little taste of home.</h2>
          <p>
            Big Nigerian flavours. A pinch of nostalgia.
            <br className="desktop-break" /> And a whole lot of love in every pot.
          </p>
          <CandyLink href="#recipes" className="hero-cta">
            Come chop! <span aria-hidden="true">→</span>
          </CandyLink>
          <div className="hero-note">
            <Heart aria-hidden="true" strokeWidth={1.6} /> Made with love. Shared with you.
          </div>
        </div>

        <div className="hero-art">
          <div className="food-halo" />
          <span className="food-caption">Na correct food!</span>
          <HandArrow className="food-arrow" />
          <Image
            className="hero-food"
            src="/images/jollof-pot.png"
            width={1024}
            height={1024}
            sizes="(max-width: 700px) 280px, 620px"
            loading="eager"
            fetchPriority="high"
            alt="Hand-painted bowl of Nigerian jollof rice, grilled chicken and fried plantain"
          />
          <span className="art-spark spark-one" aria-hidden="true">
            <Sparkle filled />
          </span>
          <span className="art-spark spark-two" aria-hidden="true">
            <Sparkle />
          </span>
          <LoveStamp />
        </div>
      </div>
      <div className="hero-bottom">
        <span>Good food. Good memories. Full belle.</span>
        <Link href="#recipes" aria-label="Go to recipes">
          <ArrowDown aria-hidden="true" strokeWidth={1.6} />
        </Link>
      </div>
    </section>
  );
}
