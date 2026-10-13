"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useSavedRecipes } from "@/lib/saved";

/** "Saved" header button with a count. Below 700px only the heart shows. */
export function SavedButton() {
  const { saved } = useSavedRecipes();

  return (
    <Link href="/saved" className="candy-button candy-button-sweet saved-button" aria-label={`Saved recipes (${saved.length})`}>
      <Heart aria-hidden="true" strokeWidth={1.8} />
      <span>
        Saved <span className="saved-count">({saved.length})</span>
      </span>
    </Link>
  );
}
