import { MAX_IMAGE_BYTES, type RecipeSubmissionInput } from "../submission";

/** A small fake image file. Size and type are all the schema looks at. */
export function fakeImage(bytes = 1024, type = "image/jpeg", name = "dish.jpg") {
  return new File([new Uint8Array(bytes)], name, { type });
}

export const exactlyMaxImage = () => fakeImage(MAX_IMAGE_BYTES);

/** A complete, valid submission as the form would hold it (strings from inputs). */
export function validSubmission(overrides: Partial<RecipeSubmissionInput> = {}): RecipeSubmissionInput {
  return {
    title: "Puff-Puff",
    description: "Soft, golden, slightly sweet dough balls for every party.",
    category: "small_chops",
    effort: "easy",
    totalMinutes: "90",
    serves: "8",
    ingredients: [{ text: "3 cups plain flour" }, { text: "½ cup sugar" }],
    steps: [{ text: "Mix everything into a smooth batter." }, { text: "Fry spoonfuls until golden all over." }],
    allergens: ["wheat"],
    image: fakeImage(),
    submitterName: "Tunde Bakare",
    submitterEmail: "tunde.bakare@example.com",
    submitterPhone: "",
    creditName: "",
    isAdult: "yes",
    guardianEmail: "",
    consentPublish: true,
    consentPrivacy: true,
    website: "",
    ...overrides,
  };
}
