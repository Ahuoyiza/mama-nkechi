// TODO (Activity 1): remove the .skip once the schemas in lib/schemas are built.
import { describe, expect, it } from "vitest";
import { recipeCoreSchema, recipeSchema } from "../recipe";

const core = {
  title: "Party Jollof Rice",
  description: "Smoky, rich, and always the life of the party.",
  category: "rice",
  effort: "medium",
  totalMinutes: 60,
  serves: 4,
  ingredients: [{ text: "3 cups rice" }, { text: "4 tomatoes" }],
  steps: [{ text: "Blend the peppers until smooth." }, { text: "Cook the rice in the sauce." }],
  allergens: [],
};

const admin = {
  ...core,
  slug: "party-jollof-rice",
  tag: "The party favourite",
  cardColour: "peach",
  imageStyle: "illustration",
  published: true,
  creditName: "",
};

describe.skip("recipeCoreSchema", () => {
  it("accepts numbers as well as strings for time and serves", () => {
    expect(recipeCoreSchema.parse({ ...core, totalMinutes: "60", serves: "4" }).totalMinutes).toBe(60);
  });

  it("rejects decimals", () => {
    expect(recipeCoreSchema.safeParse({ ...core, serves: 2.5 }).success).toBe(false);
  });
});

describe.skip("recipeSchema (admin, built with .extend)", () => {
  it("accepts a full admin recipe and upper-cases the tag", () => {
    const data = recipeSchema.parse(admin);
    expect(data.tag).toBe("THE PARTY FAVOURITE");
    expect(data.creditName).toBeUndefined();
  });

  it("still enforces the core rules it extends", () => {
    expect(recipeSchema.safeParse({ ...admin, title: "Ab" }).success).toBe(false);
  });

  it("only allows URL-safe slugs", () => {
    for (const bad of ["Party Jollof", "jollof--rice", "-jollof", "jollof!", "ẹ̀fọ́"]) {
      expect(recipeSchema.safeParse({ ...admin, slug: bad }).success, bad).toBe(false);
    }
  });

  it("only allows the three card colours", () => {
    expect(recipeSchema.safeParse({ ...admin, cardColour: "blue" }).success).toBe(false);
  });

  it("caps the tag at 30 characters", () => {
    expect(recipeSchema.safeParse({ ...admin, tag: "A".repeat(31) }).success).toBe(false);
  });
});
