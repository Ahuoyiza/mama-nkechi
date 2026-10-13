// TODO (Activity 1): remove the .skip once the schemas in lib/schemas are built.
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { MAX_IMAGE_BYTES, recipeSubmissionSchema } from "../submission";
import { exactlyMaxImage, fakeImage, validSubmission } from "./fixtures";

const errorsFor = (input: unknown) => {
  const result = recipeSubmissionSchema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
};

describe.skip("recipeSubmissionSchema: valid input", () => {
  it("accepts a complete submission", () => {
    expect(recipeSubmissionSchema.safeParse(validSubmission()).success).toBe(true);
  });

  it("coerces numbers and converts the age answer to a boolean", () => {
    const data = recipeSubmissionSchema.parse(validSubmission());
    expect(data.totalMinutes).toBe(90);
    expect(data.serves).toBe(8);
    expect(data.isAdult).toBe(true);
  });

  it("normalises the email and phone", () => {
    const data = recipeSubmissionSchema.parse(
      validSubmission({ submitterEmail: " Tunde@Example.com ", submitterPhone: "0803 123 4567" }),
    );
    expect(data.submitterEmail).toBe("tunde@example.com");
    expect(data.submitterPhone).toBe("+2348031234567");
  });

  it("keeps tonal marks in titles (NFC)", () => {
    const data = recipeSubmissionSchema.parse(validSubmission({ title: "Ọ̀fẹ̀ Akwụ".normalize("NFD") }));
    expect(data.title).toBe("Ọ̀fẹ̀ Akwụ".normalize("NFC"));
  });

  it("defaults allergens to an empty list", () => {
    const { allergens: _allergens, ...rest } = validSubmission();
    expect(recipeSubmissionSchema.parse(rest).allergens).toEqual([]);
  });
});

describe.skip("recipeSubmissionSchema: friendly errors", () => {
  it("uses the app's voice", () => {
    const errors = errorsFor(
      validSubmission({
        title: "Ab",
        description: "Too short",
        category: "" as never,
        effort: "" as never,
        totalMinutes: "2",
        serves: "0",
      }),
    );
    expect(errors.title).toEqual(["Every pot needs a name (3 to 80 characters)"]);
    expect(errors.description).toEqual(["Tell us a little about it (20 to 200 characters)"]);
    expect(errors.category).toEqual(["Pick a category"]);
    expect(errors.effort).toEqual(["How much stirring does it take?"]);
    expect(errors.totalMinutes).toEqual(["Cooking time should be between 5 minutes and 12 hours"]);
    expect(errors.serves).toEqual(["Serves between 1 and 30"]);
  });

  it("rejects cooking times over 12 hours and non-numbers", () => {
    expect(errorsFor(validSubmission({ totalMinutes: "721" })).totalMinutes).toBeDefined();
    expect(errorsFor(validSubmission({ totalMinutes: "abc" })).totalMinutes).toBeDefined();
    expect(errorsFor(validSubmission({ totalMinutes: "720" })).totalMinutes).toBeUndefined();
  });

  it("needs at least 2 ingredients and 2 steps", () => {
    const errors = errorsFor(validSubmission({ ingredients: [{ text: "Flour" }], steps: [] }));
    expect(errors.ingredients).toEqual(["Add at least 2 ingredients"]);
    expect(errors.steps).toEqual(["Add at least 2 steps"]);
  });

  it("checks each ingredient and step", () => {
    const result = recipeSubmissionSchema.safeParse(
      validSubmission({ ingredients: [{ text: "Flour" }, { text: "x" }], steps: [{ text: "Mix it" }, { text: "Fry until golden" }] }),
    );
    const paths = result.error!.issues.map((i) => i.path.join("."));
    expect(paths).toContain("ingredients.1.text");
    expect(paths).toContain("steps.0.text");
  });

  it("only accepts known allergens", () => {
    expect(errorsFor(validSubmission({ allergens: ["glitter" as never] })).allergens).toBeDefined();
  });
});

describe.skip("recipeSubmissionSchema: image", () => {
  it("accepts JPG, PNG and WebP", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      expect(errorsFor(validSubmission({ image: fakeImage(500, type) })).image).toBeUndefined();
    }
  });

  it("rejects other types", () => {
    expect(errorsFor(validSubmission({ image: fakeImage(500, "image/gif") })).image).toEqual([
      "Photo must be a JPG, PNG or WebP under 3 MB",
    ]);
    expect(errorsFor(validSubmission({ image: fakeImage(500, "application/pdf") })).image).toBeDefined();
  });

  it("allows exactly 3 MB but not one byte more", () => {
    expect(errorsFor(validSubmission({ image: exactlyMaxImage() })).image).toBeUndefined();
    expect(errorsFor(validSubmission({ image: fakeImage(MAX_IMAGE_BYTES + 1) })).image).toEqual([
      "Photo must be a JPG, PNG or WebP under 3 MB",
    ]);
  });

  it("requires a photo", () => {
    expect(errorsFor(validSubmission({ image: undefined as never })).image).toEqual(["Add a photo of your dish"]);
  });
});

describe.skip("recipeSubmissionSchema: consent and honeypot", () => {
  it("requires both consent boxes to be ticked", () => {
    const errors = errorsFor(validSubmission({ consentPublish: false as never, consentPrivacy: false as never }));
    expect(errors.consentPublish).toEqual(["Tick this so Mama can share your recipe"]);
    expect(errors.consentPrivacy).toEqual(["Please accept the privacy notice"]);
  });

  it("passes when the honeypot is empty", () => {
    expect(errorsFor(validSubmission({ website: "" })).website).toBeUndefined();
  });

  it("fails when a bot fills the honeypot", () => {
    expect(errorsFor(validSubmission({ website: "https://cheap-pills.example" })).website).toBeDefined();
  });
});

describe.skip("recipeSubmissionSchema: under-18s (conditional guardian email)", () => {
  it("adults don't need a guardian", () => {
    expect(recipeSubmissionSchema.safeParse(validSubmission({ isAdult: "yes" })).success).toBe(true);
  });

  it("under-18s must add a guardian email", () => {
    expect(errorsFor(validSubmission({ isAdult: "no", guardianEmail: "" })).guardianEmail).toEqual([
      "Under 18? Add a parent or guardian’s email so they know",
    ]);
  });

  it("under-18s with a guardian email pass", () => {
    const data = recipeSubmissionSchema.parse(validSubmission({ isAdult: "no", guardianEmail: "Mum@Example.com" }));
    expect(data.isAdult).toBe(false);
    expect(data.guardianEmail).toBe("mum@example.com");
  });

  it("shows the guardian error even while other fields are still wrong (the `when` option)", () => {
    const errors = errorsFor(validSubmission({ isAdult: "no", guardianEmail: "", title: "Ab" }));
    expect(errors.title).toBeDefined();
    expect(errors.guardianEmail).toBeDefined();
  });

  it("requires an answer to the age question", () => {
    expect(errorsFor(validSubmission({ isAdult: "" as never })).isAdult).toEqual(["Please tell us if you’re 18 or older"]);
  });
});
