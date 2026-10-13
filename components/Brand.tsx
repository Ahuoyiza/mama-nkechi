import Link from "next/link";
import { SteamingPot } from "./doodles";

/** Tilted steaming pot + "Mama Nkechi's POT." */
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Mama Nkechi’s Pot, home">
      <span className="brand-pot" aria-hidden="true">
        <SteamingPot />
      </span>
      <span>
        Mama Nkechi’s{" "}
        <strong>
          POT<span className="brand-dot">.</span>
        </strong>
      </span>
    </Link>
  );
}
