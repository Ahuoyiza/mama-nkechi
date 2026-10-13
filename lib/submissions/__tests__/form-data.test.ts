// TODO (Activity 1): remove the .skip once recipeSubmissionSchema is built.
import { describe, expect, it } from "vitest";
import { recipeSubmissionSchema } from "@/lib/schemas/submission";
import { validSubmission } from "@/lib/schemas/__tests__/fixtures";
import { fromSubmissionFormData, toSubmissionFormData } from "../form-data";

describe.skip("submission FormData helpers", () => {
  it("round-trips a valid submission so the server schema accepts it", () => {
    const sent = toSubmissionFormData(validSubmission({ allergens: ["wheat", "eggs"] }));
    const received = fromSubmissionFormData(sent);
    const parsed = recipeSubmissionSchema.parse(received);
    expect(parsed.ingredients).toHaveLength(2);
    expect(parsed.allergens).toEqual(["wheat", "eggs"]);
    expect(parsed.consentPublish).toBe(true);
    expect(parsed.image).toBeInstanceOf(File);
  });

  it("only treats the exact string 'true' as a ticked box", () => {
    const fd = new FormData();
    fd.set("consentPublish", "yes");
    fd.set("consentPrivacy", "true");
    expect(fromSubmissionFormData(fd)).toMatchObject({ consentPublish: false, consentPrivacy: true });
  });

  it("passes broken JSON through so the schema rejects it (no crash)", () => {
    const fd = new FormData();
    fd.set("ingredients", "[{oops");
    const out = fromSubmissionFormData(fd);
    expect(out.ingredients).toBe("[{oops");
    expect(recipeSubmissionSchema.safeParse(out).success).toBe(false);
  });

  it("drops keys the form doesn't have (no sneaking in status=approved)", () => {
    const fd = toSubmissionFormData(validSubmission());
    fd.set("status", "approved");
    fd.set("published", "true");
    const out = fromSubmissionFormData(fd);
    expect(out).not.toHaveProperty("status");
    expect(out).not.toHaveProperty("published");
  });

  it("ignores an empty file input", () => {
    const fd = new FormData();
    fd.set("image", new File([], ""));
    expect(fromSubmissionFormData(fd)).not.toHaveProperty("image");
  });
});
