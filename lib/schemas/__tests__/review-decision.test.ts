import { describe, expect, it } from "vitest";
import { reviewDecisionSchema } from "../review-decision";

describe("reviewDecisionSchema", () => {
  it("approve without a reason passes", () => {
    const result = reviewDecisionSchema.safeParse({ decision: "approve", cardColour: "herb", tag: "sweet and sticky!" });
    expect(result.success).toBe(true);
    if (result.success && result.data.decision === "approve") {
      expect(result.data.tag).toBe("SWEET AND STICKY!");
      expect(result.data.imageStyle).toBe("photo"); // default
    }
  });

  it("approve needs a card colour and tag", () => {
    expect(reviewDecisionSchema.safeParse({ decision: "approve" }).success).toBe(false);
  });

  it("reject without a reason fails", () => {
    const result = reviewDecisionSchema.safeParse({ decision: "reject" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["reviewNote"]);
  });

  it("reject with a too-short reason fails", () => {
    expect(reviewDecisionSchema.safeParse({ decision: "reject", reviewNote: "No." }).success).toBe(false);
  });

  it("reject with a reason passes and ignores approve-only fields", () => {
    const data = reviewDecisionSchema.parse({
      decision: "reject",
      reviewNote: "Lovely idea, but the steps are missing quantities.",
      tag: "IGNORED",
    });
    expect(data).toEqual({ decision: "reject", reviewNote: "Lovely idea, but the steps are missing quantities." });
  });

  it("an unknown decision fails", () => {
    expect(reviewDecisionSchema.safeParse({ decision: "maybe" }).success).toBe(false);
  });
});
