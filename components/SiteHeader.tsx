import Link from "next/link";
import { Brand } from "./Brand";
import { CandyLink } from "./CandyButton";
import { SavedButton } from "./SavedButton";

type Section = "recipes" | "yard" | "saved" | "submit" | null;

/** Brand left, nav centred, "Saved" and "Share your pot" (the submission form) right. The nav hides below 700px. */
export function SiteHeader({ current = "recipes" }: { current?: Section }) {
  const navLink = (section: Section, href: string, label: string) => (
    <Link
      href={href}
      className={section === current ? "nav-link current" : "nav-link"}
      aria-current={section === current ? "page" : undefined}
    >
      {label}
    </Link>
  );

  return (
    <header className="site-header">
      <Brand />
      <nav aria-label="Main navigation">
        {navLink("recipes", "/#recipes", "Mama’s recipes")}
        {navLink("yard", "/yard", "From the yard")}
      </nav>
      <div className="header-tools">
        <SavedButton />
        <CandyLink variant="sweet" href="/submit" className="share-cta">
          Share your pot <span aria-hidden="true">→</span>
        </CandyLink>
      </div>
    </header>
  );
}
