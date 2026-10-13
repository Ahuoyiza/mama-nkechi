import type { ReactNode } from "react";

/**
 * Accessible error text. role="alert" makes screen readers announce it the
 * moment it appears; the id lets the input point at it with aria-describedby.
 */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error" role="alert">
      {message}
    </p>
  );
}

/** aria-* props that link an input to its hint and error. */
export function a11y(id: string, { error, hint }: { error?: string; hint?: boolean }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  } as const;
}

export function Hint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={`${id}-hint`} className="field-hint">
      {children}
    </p>
  );
}
