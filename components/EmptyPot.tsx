import type { ReactNode } from "react";
import { Soup } from "lucide-react";

/** Friendly empty state, e.g. when a filter or search finds nothing. */
export function EmptyPot({ title = "The pot is empty!", children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="empty-pot" role="status">
      <Soup className="empty-pot-icon" aria-hidden="true" strokeWidth={1.4} />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
