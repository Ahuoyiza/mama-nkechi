import { describe, expect, it } from "vitest";
import { cleanText, emailField, nigerianPhone, optionalEmail, optionalText } from "../helpers";

describe("cleanText", () => {
  const title = cleanText(3, 80);

  it("trims surrounding spaces", () => {
    expect(title.parse("  Jollof  ")).toBe("Jollof");
  });

  it("normalises tonal marks to NFC so equal-looking titles are equal", () => {
    // Same word typed two ways: precomposed vs letter + combining marks.
    const precomposed = "Ẹ̀fọ́ Rírò".normalize("NFC");
    const decomposed = "Ẹ̀fọ́ Rírò".normalize("NFD");
    expect(precomposed).not.toBe(decomposed);
    expect(title.parse(decomposed)).toBe(precomposed);
  });

  it("counts length after trimming", () => {
    expect(title.safeParse("  ab  ").success).toBe(false);
    expect(title.safeParse("abc").success).toBe(true);
    expect(title.safeParse("a".repeat(81)).success).toBe(false);
  });

  it("uses the custom message", () => {
    const r = cleanText(3, 80, "Every pot needs a name").safeParse("");
    expect(r.error?.issues[0].message).toBe("Every pot needs a name");
  });
});

describe("optionalText", () => {
  const credit = optionalText(2, 40);
  it("turns an empty or blank box into undefined", () => {
    expect(credit.parse("")).toBeUndefined();
    expect(credit.parse("   ")).toBeUndefined();
    expect(credit.parse(undefined)).toBeUndefined();
  });
  it("still checks text that was given", () => {
    expect(credit.safeParse("A").success).toBe(false);
    expect(credit.parse(" Mama Ada ")).toBe("Mama Ada");
  });
});

describe("emailField", () => {
  it("trims and lowercases", () => {
    expect(emailField().parse("  Ada@Example.COM ")).toBe("ada@example.com");
  });
  it("rejects things that aren't emails", () => {
    expect(emailField().safeParse("ada@").success).toBe(false);
    expect(emailField().safeParse("ada example.com").success).toBe(false);
  });
  it("optionalEmail allows an empty box", () => {
    expect(optionalEmail().parse("")).toBeUndefined();
    expect(optionalEmail().safeParse("nope").success).toBe(false);
  });
});

describe("nigerianPhone", () => {
  it("accepts the local 0 format and converts to +234", () => {
    expect(nigerianPhone.parse("08031234567")).toBe("+2348031234567");
  });

  it("accepts the +234 format unchanged", () => {
    expect(nigerianPhone.parse("+2348031234567")).toBe("+2348031234567");
  });

  it("ignores spaces, dashes and brackets", () => {
    expect(nigerianPhone.parse("0803 123 4567")).toBe("+2348031234567");
    expect(nigerianPhone.parse("+234 (803) 123-4567")).toBe("+2348031234567");
  });

  it("treats 0 and +234 versions of the same number as equal", () => {
    expect(nigerianPhone.parse("0703 000 1111")).toBe(nigerianPhone.parse("+2347030001111"));
  });

  it("is optional: empty or missing means no phone", () => {
    expect(nigerianPhone.parse("")).toBeUndefined();
    expect(nigerianPhone.parse(undefined)).toBeUndefined();
  });

  it("rejects wrong lengths, landline-style prefixes and other countries", () => {
    expect(nigerianPhone.safeParse("0803123456").success).toBe(false); // 10 digits
    expect(nigerianPhone.safeParse("080312345678").success).toBe(false); // 12 digits
    expect(nigerianPhone.safeParse("01234567890").success).toBe(false); // not a mobile prefix
    expect(nigerianPhone.safeParse("+447911123456").success).toBe(false); // UK
    expect(nigerianPhone.safeParse("2348031234567").success).toBe(false); // missing +
  });
});
