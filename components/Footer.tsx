import Link from "next/link";
import { SteamingPot } from "./doodles";

export function Footer() {
  return (
    <footer className="site-footer">
      <Link href="/" className="footer-brand">
        <SteamingPot /> Mama Nkechi’s Pot
      </Link>
      <span>From Nigeria, with love ♡</span>
      <span>Come hungry. Leave happy.</span>
    </footer>
  );
}
