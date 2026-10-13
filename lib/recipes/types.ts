/**
 * The shape of a published recipe as the UI sees it.
 * Database rows (snake_case) are mapped into this shape in one place.
 */

export const CATEGORIES = ["rice", "soups_stews", "small_chops", "swallow", "drinks", "desserts"] as const;
export type Category = (typeof CATEGORIES)[number];

export const EFFORTS = ["easy", "medium", "involved"] as const;
export type Effort = (typeof EFFORTS)[number];

export const CARD_COLOURS = ["peach", "yellow", "herb"] as const;
export type CardColour = (typeof CARD_COLOURS)[number];

export const IMAGE_STYLES = ["illustration", "photo"] as const;
export type ImageStyle = (typeof IMAGE_STYLES)[number];

export const ALLERGENS = [
  "peanuts",
  "tree_nuts",
  "fish",
  "shellfish",
  "eggs",
  "milk",
  "soy",
  "wheat",
  "sesame",
] as const;
export type Allergen = (typeof ALLERGENS)[number];

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tag: string;
  category: Category;
  effort: Effort;
  totalMinutes: number;
  serves: number;
  ingredients: { text: string }[];
  steps: { text: string }[];
  allergens: Allergen[];
  /** Either a local path ("/images/egusi.png") or a path in the recipe-images bucket. */
  imagePath: string;
  cardColour: CardColour;
  imageStyle: ImageStyle;
  creditName: string | null;
  /** True when it came from a community submission ("From the yard"), false for Mama's own. */
  fromYard: boolean;
};
