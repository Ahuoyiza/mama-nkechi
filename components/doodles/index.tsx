/**
 * Small hand-drawn doodles that lucide-react doesn't have.
 * They draw with currentColor, so colour and size come from the surrounding CSS.
 */
import type { SVGProps } from "react";
import { Heart } from "lucide-react";

type DoodleProps = SVGProps<SVGSVGElement>;

/** Four-point sparkle: filled (✦) or outline (✧). */
export function Sparkle({ filled = false, ...props }: DoodleProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
      <path
        d="M12 1.5c.9 6.6 3.3 9.5 10 10.5-6.7 1-9.1 3.9-10 10.5-.9-6.6-3.3-9.5-10-10.5 6.7-1 9.1-3.9 10-10.5Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 1 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Steaming pot (♨): a bowl with three curls of steam. The brand mark. */
export function SteamingPot(props: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8.2 9.5c-1.3-1.1 1.1-2.1 0-3.4M12 9.5c-1.4-1.3 1.2-2.5 0-4.2M15.8 9.5c-1.3-1.1 1.1-2.1 0-3.4" />
      <path d="M2.8 12.5h18.4" />
      <path d="M4.3 12.5c.7 4.4 3.7 7.3 7.7 7.3s7-2.9 7.7-7.3" />
    </svg>
  );
}

/** Wavy squiggle that sits after a heading (〰). */
export function Squiggle(props: DoodleProps) {
  return (
    <svg viewBox="0 0 48 18" width="1.2em" height="0.45em" aria-hidden="true" {...props}>
      <path
        d="M2 12c5-8 9-8 12-2s7 7 11 0 8-7 11-1 6 6 10 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Hand-drawn arrow curling from a caption down towards the food. */
export function HandArrow(props: DoodleProps) {
  return (
    <svg viewBox="0 0 65 52" aria-hidden="true" {...props}>
      <path d="M58 4c-2 18-16 32-44 38" />
      <path d="M14 42l9-10M14 42l12 3" />
    </svg>
  );
}

/** Dashed circular "100% home goodness" stamp. */
export function LoveStamp({ className = "love-stamp" }: { className?: string }) {
  return (
    <div className={className}>
      <Heart aria-hidden="true" strokeWidth={1.6} />
      <span>
        100%
        <br />
        home goodness
      </span>
    </div>
  );
}
