import { describe, expect, it } from "vitest";
import { homeSearchParamsSchema } from "../search-params";

describe("homeSearchParamsSchema", () => {
  it("defaults to all recipes and no search", () => {
    expect(homeSearchParamsSchema.parse({})).toEqual({ category: undefined, q: "" });
  });

  it("reads a valid category and search", () => {
    expect(homeSearchParamsSchema.parse({ category: "rice", q: " jollof " })).toEqual({ category: "rice", q: "jollof" });
  });

  it("never throws on a bad URL", () => {
    expect(homeSearchParamsSchema.parse({ category: "pizza" }).category).toBeUndefined();
    expect(homeSearchParamsSchema.parse({ q: "x".repeat(500) }).q).toBe("");
  });

  it("uses the first value when a param is repeated", () => {
    expect(homeSearchParamsSchema.parse({ category: ["soups_stews", "rice"], q: ["egusi", "suya"] })).toEqual({
      category: "soups_stews",
      q: "egusi",
    });
  });
});
