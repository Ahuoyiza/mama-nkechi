import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "sweet";

function candyClass(variant: Variant, className?: string) {
  return ["candy-button", variant === "sweet" && "candy-button-sweet", className].filter(Boolean).join(" ");
}

type CandyLinkProps = ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode };

/** Chunky "candy" button with a hard ink shadow, rendered as a link. */
export function CandyLink({ variant = "primary", className, ...props }: CandyLinkProps) {
  return <Link className={candyClass(variant, className)} {...props} />;
}

type CandyButtonProps = ComponentProps<"button"> & { variant?: Variant };

/** The same candy look on a real <button>, for forms. */
export function CandyButton({ variant = "primary", className, type = "button", ...props }: CandyButtonProps) {
  return <button type={type} className={candyClass(variant, className)} {...props} />;
}
