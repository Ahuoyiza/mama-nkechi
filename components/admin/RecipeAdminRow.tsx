"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteRecipe, setRecipePublished } from "@/app/admin/actions";
import { CandyButton } from "@/components/CandyButton";

type Props = { id: string; slug: string; title: string; published: boolean; fromYard: boolean; credit: string | null };

export function RecipeAdminRow({ id, slug, title, published, fromYard, credit }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<{ ok: boolean; formError?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.ok) setError(result.formError ?? "Something went wrong.");
      router.refresh();
    });

  return (
    <tr aria-busy={pending}>
      <td>
        <Link href={`/recipes/${slug}`} target="_blank">
          {title}
        </Link>
        <span className="admin-sub">{fromYard ? `From the yard${credit ? ` · ${credit}` : ""}` : "Mama’s recipe"}</span>
        {error && (
          <span className="field-error" role="alert">
            {error}
          </span>
        )}
      </td>
      <td>
        <span className={`status-chip ${published ? "status-approved" : "status-pending"}`}>{published ? "Published" : "Hidden"}</span>
      </td>
      <td className="admin-actions">
        <button type="button" className="link-button" disabled={pending} onClick={() => run(() => setRecipePublished(id, !published))}>
          {published ? "Unpublish" : "Publish"}
        </button>
        <button type="button" className="link-button danger" disabled={pending} onClick={() => dialogRef.current?.showModal()}>
          Delete
        </button>

        {/* Native <dialog>: focus is trapped and Esc closes it, no library needed. */}
        <dialog ref={dialogRef} className="admin-dialog" aria-labelledby={`delete-${id}`}>
          <h2 id={`delete-${id}`}>Delete “{title}”?</h2>
          <p>This removes the recipe and its photo for good. Unpublishing hides it instead.</p>
          <form method="dialog" className="dialog-actions">
            <CandyButton type="submit" variant="sweet">
              Keep it
            </CandyButton>
            <CandyButton
              type="button"
              onClick={() => {
                dialogRef.current?.close();
                run(() => deleteRecipe(id));
              }}
            >
              Delete for good
            </CandyButton>
          </form>
        </dialog>
      </td>
    </tr>
  );
}
