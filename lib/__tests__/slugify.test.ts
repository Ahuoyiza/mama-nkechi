import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Party Jollof Rice")).toBe("party-jollof-rice");
  });

  it("spells out ampersands", () => {
    expect(slugify("Egusi & Pounded Yam")).toBe("egusi-and-pounded-yam");
  });

  it("strips Yoruba and Igbo tonal marks", () => {
    expect(slugify("Ẹ̀fọ́ Rírò")).toBe("efo-riro");
    expect(slugify("Ọ̀fẹ̀ Akwụ")).toBe("ofe-akwu");
  });

  it("trims stray punctuation from the ends", () => {
    expect(slugify("  Suya!! ")).toBe("suya");
  });
});
