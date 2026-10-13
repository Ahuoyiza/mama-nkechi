/**
 * Turns a recipe title into a URL slug: "Ẹ̀fọ́ Rírò & Rice" -> "efo-riro-and-rice".
 * Tonal marks are stripped by decomposing to NFD and dropping the combining marks.
 */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
