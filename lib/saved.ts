"use client";

import { useSyncExternalStore } from "react";

/**
 * Saved recipes live in this browser only (localStorage), as a list of slugs.
 * Storage can be missing or blocked (private mode, strict settings), so every
 * read and write is wrapped in try/catch and the app still works without it.
 */
const KEY = "mama-nkechi:saved";
const EMPTY: string[] = [];
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedValue: string[] = EMPTY;

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedValue = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : EMPTY;
  } catch {
    cachedValue = EMPTY;
  }
  return cachedValue;
}

function write(slugs: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    // Storage unavailable: the heart still toggles until the page reloads.
    cachedRaw = null;
    cachedValue = slugs;
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedRecipes() {
  const saved = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggle = (slug: string) => {
    const current = read();
    write(current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]);
  };

  return { saved, toggle };
}
