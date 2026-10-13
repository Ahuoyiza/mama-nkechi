import Link from "next/link";
import { Brand } from "./Brand";
import { CandyLink } from "./CandyButton";

type Section = "recipes" | "about" | "submit" | null;

/** Brand left, nav centred, "Come chop!" right. The nav hides below 700px. */
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
        {navLink("recipes", "/#recipes", "The recipes")}
        {navLink("about", "/#about", "Meet the pot")}
        {navLink("submit", "/submit", "Share your recipe")}
      </nav>
      <div className="header-tools">
        <CandyLink variant="sweet" href="/#recipes">
          Come chop! <span aria-hidden="true">→</span>
        </CandyLink>
      </div>
    </header>
  );
}
