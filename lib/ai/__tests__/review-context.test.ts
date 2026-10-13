import { describe, expect, it } from "vitest";
import type { Tables } from "@/lib/supabase/database.types";
import { buildReviewContext, reviewContextSchema } from "../review-context";

const submission: Tables<"recipe_submissions"> = {
  id: "00000000-0000-0000-0000-000000000001",
  status: "pending",
  title: "Ẹ̀fọ́ Rírò",
  description: "My grandmother's rich Yoruba spinach stew, loaded with assorted meat and stockfish.",
  category: "soups_stews",
  effort: "involved",
  total_minutes: 75,
  serves: 6,
  ingredients: [{ text: "1 kg spinach" }, { text: "3 tbsp ground crayfish" }],
  steps: [
    { text: "Boil the blended peppers until thick." },
    { text: "If it tastes off, call me on 0803 123 4567 or email ada@example.com." },
  ],
  allergens: [],
  image_path: "seed/efo-riro.png",
  submitter_name: "Adaeze Okafor",
  submitter_email: "adaeze.okafor@example.com",
  submitter_phone: "+2348031234567",
  credit_name: "Mama Ada",
  is_adult: true,
  guardian_email: null,
  consent_publish: true,
  consent_privacy: true,
  review_note: null,
  reviewed_at: null,
  ai_review: null,
  ip_hash: "abc123",
  created_at: "2026-10-13T12:00:00Z",
};

describe("buildReviewContext", () => {
  it("keeps only the recipe fields", () => {
    const context = buildReviewContext(submission);
    expect(Object.keys(context).sort()).toEqual(
      ["allergens", "category", "description", "effort", "ingredients", "serves", "steps", "title", "totalMinutes"].sort(),
    );
  });

  it("never includes the submitter's personal details", () => {
    const json = JSON.stringify(buildReviewContext(submission));
    for (const secret of ["Adaeze", "adaeze.okafor@example.com", "+2348031234567", "abc123", "seed/efo-riro.png", "Mama Ada"]) {
      expect(json, secret).not.toContain(secret);
    }
  });

  it("redacts details typed into the steps", () => {
    const { steps } = buildReviewContext(submission);
    expect(steps[1].text).toBe("If it tastes off, call me on [PHONE] or email [EMAIL].");
  });
});

describe("reviewContextSchema (z.strictObject)", () => {
  it("rejects any extra key, so personal data can't slip in by accident", () => {
    const context = buildReviewContext(submission);
    const result = reviewContextSchema.safeParse({ ...context, submitterEmail: "adaeze.okafor@example.com" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].code).toBe("unrecognized_keys");
  });

  it("rejects extra keys inside ingredients and steps too", () => {
    const context = buildReviewContext(submission);
    const sneaky = { ...context, steps: [{ text: "Stir", cookPhone: "08031234567" }] };
    expect(reviewContextSchema.safeParse(sneaky).success).toBe(false);
  });
});
