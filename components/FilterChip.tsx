import Link from "next/link";
import type { ReactNode } from "react";

/** Category filter. A link, so filters live in the URL (?category=rice) and can be shared. */
export function FilterChip({ href, selected, children }: { href: string; selected: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={selected ? "recipe-filter is-selected" : "recipe-filter"}
      aria-current={selected ? "true" : undefined}
    >
      {children}
    </Link>
  );
}
