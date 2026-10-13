/**
 * Local seed art lives in /public ("/images/egusi.png").
 * Everything else is a path in the public recipe-images bucket.
 */
export function recipeImageUrl(path: string): string {
  if (path.startsWith("/")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${path}`;
}
