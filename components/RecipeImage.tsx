import Image from "next/image";
import type { ImageStyle } from "@/lib/recipes/types";
import { recipeImageUrl } from "@/lib/recipes/image-url";

/**
 * Seed art is transparent illustration that sits straight on the colour panel.
 * Submitted phone photos get a tilted "polaroid" frame so they still feel hand-made.
 */
export function RecipeImage({
  path,
  style,
  alt,
  sizes = "(max-width: 700px) 86vw, 340px",
}: {
  path: string;
  style: ImageStyle;
  alt: string;
  sizes?: string;
}) {
  const src = recipeImageUrl(path);

  if (style === "photo") {
    return (
      <span className="recipe-polaroid">
        <Image src={src} alt={alt} width={600} height={450} sizes={sizes} />
      </span>
    );
  }

  return <Image className="recipe-illustration" src={src} alt={alt} width={1024} height={1024} sizes={sizes} />;
}
