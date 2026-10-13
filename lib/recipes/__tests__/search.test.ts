import { describe, expect, it } from "vitest";
import { fixtureRecipes } from "../fixture";
import { filterRecipes, foldText } from "../search";
import type { Recipe } from "../types";

const titles = (r: { recipe: Recipe }[]) => r.map((x) => x.recipe.title);

describe("filterRecipes", () => {
  it("returns everything with no filter, numbered in order", () => {
    const all = filterRecipes(fixtureRecipes, { q: "" });
    expect(all.map((r) => r.number)).toEqual([1, 2, 3]);
  });

  it("filters by category but keeps each card's number", () => {
    const soups = filterRecipes(fixtureRecipes, { category: "soups_stews", q: "" });
    expect(titles(soups)).toEqual(["Egusi & Pounded Yam"]);
    expect(soups[0].number).toBe(2);
  });

  it("searches titles, descriptions and ingredients, ignoring case", () => {
    expect(titles(filterRecipes(fixtureRecipes, { q: "PLANTAIN" }))).toEqual(["Party Jollof Rice", "Suya & Sweet Dodo"]);
    expect(titles(filterRecipes(fixtureRecipes, { q: "crayfish" }))).toEqual(["Egusi & Pounded Yam"]);
  });

  it("needs every word to match", () => {
    expect(titles(filterRecipes(fixtureRecipes, { q: "suya plantain" }))).toEqual(["Suya & Sweet Dodo"]);
    expect(filterRecipes(fixtureRecipes, { q: "suya egusi" })).toEqual([]);
  });

  it("matches with or without tonal marks", () => {
    const efo: Recipe = { ...fixtureRecipes[1], id: "efo", title: "Ẹ̀fọ́ Rírò" };
    expect(titles(filterRecipes([efo], { q: "efo riro" }))).toEqual(["Ẹ̀fọ́ Rírò"]);
    expect(foldText("Ọ̀fẹ̀ Akwụ")).toBe("ofe akwu");
  });
});
