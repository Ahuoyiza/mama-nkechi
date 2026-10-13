import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

/** Move up / move down / remove buttons for a list row. */
export function RowTools({
  label,
  index,
  count,
  onMove,
  onRemove,
}: {
  label: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  return (
    <span className="row-tools">
      <button type="button" className="playful-icon" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ArrowUp aria-hidden="true" />
      </button>
      <button type="button" className="playful-icon" aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
        <ArrowDown aria-hidden="true" />
      </button>
      <button type="button" className="playful-icon" aria-label={`Remove ${label}`} disabled={count <= 1} onClick={onRemove}>
        <Trash2 aria-hidden="true" />
      </button>
    </span>
  );
}
