"use client";

import { useEffect, useMemo, type Ref } from "react";
import { ImagePlus } from "lucide-react";
import { IMAGE_TYPES } from "@/lib/schemas/submission";
import { a11y } from "./Field";

type Props = {
  value: File | undefined;
  onChange: (file: File | undefined) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
  error?: string;
};

/** File input with a polaroid-style preview. Used through RHF's <Controller>. */
export function ImagePicker({ value, onChange, onBlur, inputRef, error }: Props) {
  // A temporary blob: URL for the chosen file. It holds memory until revoked,
  // so the effect revokes the old one whenever the file changes.
  const preview = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="image-picker">
      <label htmlFor="image" className="image-drop">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- a local blob: preview, not a site image
          <img src={preview} alt="Preview of your dish" className="image-preview" />
        ) : (
          <span className="image-empty">
            <ImagePlus aria-hidden="true" strokeWidth={1.5} />
            Tap to add a photo of your dish
          </span>
        )}
      </label>
      <input
        ref={inputRef}
        type="file"
        name="image"
        accept={IMAGE_TYPES.join(",")}
        className="image-input"
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.files?.[0] ?? undefined)}
        {...a11y("image", { error, hint: true })}
      />
      {value && (
        <p className="image-name">
          {value.name} · {(value.size / 1024 / 1024).toFixed(1)} MB{" "}
          <button type="button" className="link-button" onClick={() => onChange(undefined)}>
            Remove
          </button>
        </p>
      )}
    </div>
  );
}
