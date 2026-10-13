import Link from "next/link";
import { SteamingPot } from "./doodles";

export function Footer() {
  return (
    <footer className="site-footer">
      <Link href="/" className="footer-brand">
        <SteamingPot /> Mama Nkechi’s Pot
      </Link>
      <span>From Sophia Ahuoyiza, with love ♡</span>
      <a href="mailto:sophia@ahuoyiza.com" className="footer-email">
        sophia@ahuoyiza.com
      </a>
    </footer>
  );
}
