import type { Allergen, Category, Effort } from "./types";

export const categoryLabels: Record<Category, string> = {
  rice: "Rice dishes",
  soups_stews: "Soups & stews",
  small_chops: "Small chops",
  swallow: "Swallow",
  drinks: "Drinks",
  desserts: "Something sweet",
};

export const effortLabels: Record<Effort, string> = {
  easy: "Easy peasy",
  medium: "A little love",
  involved: "Worth the stir",
};

export const allergenLabels: Record<Allergen, string> = {
  peanuts: "Peanuts",
  tree_nuts: "Tree nuts",
  fish: "Fish",
  shellfish: "Shellfish",
  eggs: "Eggs",
  milk: "Milk",
  soy: "Soy",
  wheat: "Wheat",
  sesame: "Sesame",
};
