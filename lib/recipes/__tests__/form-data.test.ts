import { describe, expect, it } from "vitest";
import { recipeSchema } from "@/lib/schemas/recipe";
import { fromRecipeFormData, toRecipeFormData } from "../form-data";

const values = {
  title: "Masa",
  slug: "masa",
  description: "Soft, slightly tangy Northern rice cakes, cooked in a masa pan.",
  tag: "fluffy rice cakes!",
  category: "small_chops" as const,
  effort: "medium" as const,
  totalMinutes: "150",
  serves: "6",
  ingredients: [{ text: "2 cups tuwo rice" }, { text: "1 tsp yeast" }],
  steps: [{ text: "Blend the soaked rice into a batter." }, { text: "Cook in a hot masa pan." }],
  allergens: [],
  cardColour: "yellow" as const,
  imageStyle: "illustration" as const,
  published: true,
  creditName: "",
};

describe("recipe FormData helpers", () => {
  it("round-trips so the server's recipeSchema accepts it", () => {
    const image = new File(["x"], "masa.jpg", { type: "image/jpeg" });
    const back = fromRecipeFormData(toRecipeFormData(values, { image, paint: true }));
    const parsed = recipeSchema.parse(back.values);
    expect(parsed.tag).toBe("FLUFFY RICE CAKES!");
    expect(parsed.totalMinutes).toBe(150);
    expect(parsed.published).toBe(true);
    expect(back.image).toBeInstanceOf(File);
    expect(back.paint).toBe(true);
  });

  it("drops unknown keys and treats a missing picture as none", () => {
    const fd = toRecipeFormData(values, { image: null, paint: false });
    fd.set("source_submission_id", "sneaky");
    const back = fromRecipeFormData(fd);
    expect(back.values).not.toHaveProperty("source_submission_id");
    expect(back.image).toBeNull();
    expect(back.paint).toBe(false);
  });
});
