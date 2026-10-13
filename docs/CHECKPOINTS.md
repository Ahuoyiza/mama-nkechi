# Class checkpoints

`main` is the finished app. Each `class/*` branch is the app at one point in the lesson: some code is taken out and replaced with `// TODO (Activity N): ...` comments that say what to build.

**Every branch compiles and runs.** If you fall behind, catch up by switching to the next checkpoint:

```bash
git stash            # keep your own work safe (optional)
git checkout class/02-form
npm install
npm run dev
```

`class/0N` is the **finished state of Activity N**. So `class/01-zod` is what your code should look like after Activity 1.

| Branch | What's in it | What you build next |
| --- | --- | --- |
| `class/00-start` | Full UI and database. Schemas are stubs (`z.any()`), the form is plain HTML, and the server action saves whatever it's sent | **Activity 1:** break it (DevTools / Postman), then write the Zod schemas |
| `class/01-zod` | `recipeSubmissionSchema`, the helpers and their tests are complete | **Activity 2:** React Hook Form, `useFieldArray`, `Controller` |
| `class/02-form` | The form is fully wired | **Activity 3:** server action validation, image re-check, `setError` mapping, env schema, rate limit |
| `class/03-server` | The server side is complete | **Activity 4:** AI pre-review with an allowlist, `redact()` and safe logging *(coming)* |
| `class/04-ai-privacy` | Same as `main` *(coming)* | **Homework:** the reject flow with `z.discriminatedUnion` |

Checks you can run on any branch: `npm run test`, `npm run lint`, `npm run typecheck`. On the early branches some test files are skipped (`describe.skip`): remove the `.skip` when you build that part, and the tests tell you if you got it right.

---

## class/00-start → Activity 1: "Break it", then write the schemas

| File | Line | TODO |
| --- | --- | --- |
| `lib/schemas/helpers.ts` | 8 | `cleanText(min, max, message)`: trim, NFC, length |
| `lib/schemas/helpers.ts` | 16 | `optionalText`: empty box becomes `undefined` |
| `lib/schemas/helpers.ts` | 21 | `emailField`: trim, lowercase, `z.email()` |
| `lib/schemas/helpers.ts` | 26 | `optionalEmail` |
| `lib/schemas/helpers.ts` | 32 | `nigerianPhone`: `0…` or `+234…` in, `+234…` out |
| `lib/schemas/recipe.ts` | 7 | Enums with friendly errors |
| `lib/schemas/recipe.ts` | 15 | `recipeCoreSchema` |
| `lib/schemas/recipe.ts` | 20 | *(stretch)* `recipeSchema` with `.extend()` |
| `lib/schemas/submission.ts` | 12 | `imageFileSchema` with `z.file()` |
| `lib/schemas/submission.ts` | 16 | `recipeSubmissionSchema` + the under-18 guardian rule |
| `lib/schemas/review-decision.ts` | 6 | *(homework preview)* `reviewDecisionSchema` |
| `lib/schemas/__tests__/*.test.ts` | 1 | Remove `.skip` when the schema is built |
| `lib/submissions/__tests__/form-data.test.ts` | 1 | Remove `.skip` when `recipeSubmissionSchema` is built |

The Activity 2 and 3 TODOs (below) are also present on this branch.

> **Instructor note.** Start with the app running and the form "working". Open DevTools, find the server action request after a submit, and replay it with garbage: a 5,000-character title, `totalMinutes: -3`, a `.txt` file renamed `.jpg`, an email of `"lol"`. Some of it is stopped by the database's CHECK constraints (only as an unhelpful "Something went wrong"); some of it goes straight in. That's the motivation for the whole lesson. Then write the schemas together, starting with `cleanText` and the tonal-marks test (Ẹ̀fọ́ Rírò typed two ways). Leave the guardian rule to the end: it's the place to explain why object-level `.refine()` normally waits for every field, and how Zod 4's `when` option changes that.

## class/01-zod → Activity 2: React Hook Form

| File | Line | TODO |
| --- | --- | --- |
| `components/submit/SubmitForm.tsx` | 16 | Rebuild the plain form with `useForm` + `zodResolver`, `useFieldArray`, `Controller`, accessible errors, `useWatch` for the guardian box |

Helpers already in the repo: `components/submit/Field.tsx` (`FieldError`, `Hint`, `a11y()`), `components/submit/ImagePicker.tsx`, `lib/submissions/form-data.ts`.

> **Instructor note.** The key idea is that the *same* schema runs in the browser. Show `useForm<z.input, unknown, z.output>`: the inputs hold strings ("45"), and Zod hands back numbers (45), which is why we need both types. For `useFieldArray`, show what goes wrong with `key={index}` when you move a row (the text "sticks" to the wrong row), then switch to `field.id`. `mode: "onTouched"` is a good discussion: errors appear once you leave a field, not while you're still typing.

## class/02-form → Activity 3: Never trust the client

| File | Line | TODO |
| --- | --- | --- |
| `app/submit/actions.ts` | 28 | Honeypot: silent fake success |
| `app/submit/actions.ts` | 32 | Rate limit per email and per hashed IP |
| `app/submit/actions.ts` | 36 | `recipeSubmissionSchema.safeParse` + `z.flattenError` |
| `app/submit/actions.ts` | 45 | Call `verifyAndCleanImage()` before uploading |
| `lib/images/verify.ts` | 16 | Magic bytes (`file-type`), minimum size, re-encode with `sharp` (strips EXIF/GPS) |
| `components/submit/SubmitForm.tsx` | 79 | Map the server's `fieldErrors` back onto fields with `setError` |
| `lib/schemas/env.ts` | 10, 16 | `clientEnvSchema` and `envSchema` |
| `lib/env.ts` | 6 | Parse `process.env` with `envSchema` and fail fast |
| `lib/schemas/__tests__/env.test.ts`, `lib/images/__tests__/verify.test.ts` | 1 | Remove `.skip` |

> **Instructor note.** Repeat the Activity 1 attack against the finished form: the browser now blocks it, but the request in DevTools can still be replayed, so the server must check again with the same schema. Note the server action's parameter is typed `unknown` on purpose. For the image: rename a text file to `.jpg` and watch `file.type` say `image/jpeg`; then show `file-type` reading the real bytes. For EXIF, take a phone photo with location on and show the GPS data before and after `sharp`. For the env schema, `lib/env.ts` on this branch contains a deliberate bug: `Boolean("false")` is `true`. Ask the class to spot it, then fix it with `z.stringbool()`.

## class/03-server → Activity 4: AI pre-review and privacy *(coming)*

`lib/ai/review-context.ts` (a `z.strictObject` allowlist), `lib/privacy/redact.ts` and `lib/ai/log.ts`. This checkpoint will be updated when the AI pre-review is added to `main`.

## class/04-ai-privacy → Homework: the reject flow *(coming)*

`reviewDecisionSchema` is a `z.discriminatedUnion("decision", …)`: approve needs a card colour and tag; reject needs a reason. The UI shows the reason box only when "Reject" is chosen.
