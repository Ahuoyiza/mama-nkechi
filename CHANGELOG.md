# Changelog

## Milestone 1: Scaffold

- Next.js 16 App Router project with TypeScript strict mode, Tailwind CSS v4 and ESLint.
- Itim (display) and DM Sans (body) loaded with `next/font/google`.
- Design tokens from the reference design in `app/globals.css`, exposed to Tailwind (`bg-peach`, `text-ink`, `font-display`, `shadow-candy`...).
- Seed illustrations (jollof pot, egusi, suya) in `public/images/`.
- Vitest set up for `lib/**/__tests__/`, with a first `slugify()` helper that strips tonal marks.
- Scripts: `npm run test`, `npm run lint`, `npm run typecheck`.

## Milestone 2: Design port

- Ported the reference stylesheet into `app/site.css`, keeping its class names, sizes and breakpoints (1000px and 700px) so the two can be compared line by line.
- Components: `CandyButton`/`CandyLink`, `Brand`, `SiteHeader`, `Hero`, `FlavourStrip`, `FilterChip`, `RecipeSearch`, `RecipeCard`, `RecipeDetails`, `RecipeImage`, `KitchenNote`, `EmptyPot`, `Footer`.
- Doodles in `components/doodles/` (steaming pot, four-point sparkles, squiggle, hand-drawn arrow, dashed love stamp) replace the reference's text glyphs, so they render the same on every device. Line icons come from `lucide-react`.
- Recipe details expand inline with a native `<details>`; other cards keep their height.
- `RecipeImage` supports `illustration` (transparent PNG on the colour panel) and `photo` (tilted polaroid frame).
- Home page renders the three launch recipes from a local fixture (`lib/recipes/fixture.ts`).
- Added a "Share your recipe" link to the header nav and a submission CTA in the kitchen note band.
- Deviation: on phones the category chips scroll sideways in one row. The reference lets them spill past the page edge.
- Supabase CLI added as a dev dependency (`npx supabase ...`), so no Homebrew install is needed.

## Milestone 3: Supabase

- Migration `supabase/migrations/20261013170000_init.sql`: enums, `recipes`, `recipe_submissions`, `admins`, `is_admin()`, RLS on every table, storage buckets (`recipe-images` public, `submission-images` private) and storage policies.
- CHECK constraints mirror the Zod rules as a second line of defence (lengths, ranges, "a rejection needs a note", "under-18s need a guardian").
- `supabase/seed.sql`: the three launch recipes plus three fake pending submissions, each built to show off a lesson point.
- Scripts: `npm run make-admin -- <email>`, `npm run seed:images`, `npm run db:types`.
- Typed clients in `lib/supabase/`: `public` (anonymous, cacheable), `server` (signed-in admin), `admin` (service role, server-only), `browser`.
- `lib/env.ts` (server-only) and `lib/env.client.ts` parse environment variables with `envSchema` and fail fast.
- Home page reads published recipes from the database, cached with `"use cache"` and tagged `recipes`.

## Milestone 4: Recipe pages, filters, search, saved

- `/recipes/[slug]`: full shareable recipe page (picture panel, facts, allergen note, credit, ingredients and numbered steps).
- Changed from the brief at Sophia's request: "► Let's cook" on a card now opens the full recipe page instead of expanding inline.
- Category chips and search are links/GET forms (`?category=`, `?q=`), read through `homeSearchParamsSchema` so a bad URL never crashes the page. Search ignores tonal marks and case.
- Save heart on cards and recipe pages, "Saved (n)" header button and `/saved`, stored in `localStorage` (wrapped in try/catch).
- Header CTA is now "Share your pot →" (to the submission form); the hero CTA is "See wetin dey pot →".
- `npm run typecheck` now regenerates Next's route types first.

### Fixes

- Jollof illustration: the original background cut-out had sliced off the top of the bowl's rim. Rebuilt its transparency from the white background so the whole bowl shows (the loose pepper and leaf stay out, as in the reference).
- Footer now reads "From Sophia Ahuoyiza, with love ♡" with a contact link to sophia@ahuoyiza.com.

## Milestone 5: Schemas and tests

- `lib/schemas/helpers.ts`: `cleanText` (trim + NFC + length), `optionalText`, `emailField`/`optionalEmail` (trim + lowercase), `nigerianPhone` (accepts `0…` and `+234…`, outputs `+234…`).
- `lib/schemas/recipe.ts`: `recipeCoreSchema`, and `recipeSchema` built from it with `.extend()`.
- `lib/schemas/submission.ts`: `recipeSubmissionSchema` (also built from the core), including `z.file()` image checks, consent literals, honeypot, and the under-18 guardian rule using Zod 4's `when` option so it reports alongside field errors.
- `lib/schemas/review-decision.ts`: `reviewDecisionSchema` as a `z.discriminatedUnion("decision", …)`.
- `lib/schemas/ai-review.ts`: `aiReviewSchema` for the AI pre-review's structured output.
- `lib/schemas/env.ts` and `lib/schemas/search-params.ts` (from milestone 3/4) now have tests too.
- 69 Vitest tests: valid, invalid and edge cases (tonal marks, `+234` vs `0` phones, the exact 3 MB boundary, empty vs filled honeypot, conditional guardian email, approve vs reject).
- Lesson note: a test caught that `when` receives the *transformed* value; re-parsing it with the input schema silently skipped the guardian rule.
- Renamed the fixed jollof illustration to `jollof-rice.png` so browsers and CDNs can't keep serving the old cached cut-out. The seed row was updated to match.

## Milestone 6: Submission flow

- `/submit` "Share your pot" form: React Hook Form with `zodResolver(recipeSubmissionSchema)`, `mode: "onTouched"`, and both `z.input`/`z.output` types in `useForm`.
- `useFieldArray` for ingredients and steps (add, remove, move up/down; keys use `field.id`). Photo picker with a polaroid preview through `Controller`.
- Accessible errors: `aria-invalid`, `aria-describedby`, `role="alert"`; focus moves to the first error, including errors that come back from the server.
- Under-18 question shows the guardian email box only when "No" is picked (`useWatch`).
- Server action `app/submit/actions.ts` takes `unknown` and runs, in order: honeypot (silent fake success), Turnstile (if enabled), rate limit per email and per hashed IP, `recipeSubmissionSchema.safeParse`, image re-check, upload to the private bucket, insert with the service role. Returns `{ ok: true }` or `{ ok: false, fieldErrors }` from `z.flattenError`.
- `lib/images/verify.ts`: checks magic bytes with `file-type`, rejects photos under 600px on the short side, re-encodes with `sharp` to WebP and strips EXIF (including GPS).
- `lib/submissions/form-data.ts`: shared helpers to send the form as FormData and read it back (unknown keys are dropped).
- `/submit/thanks` confirmation page: "Mama don collect am!"
- Server Action body limit raised to 4 MB for photo uploads.
- Tests: 85 in total, including FormData round trips, IP hashing and image checks (fake JPG, GIF, 599px vs 600px, EXIF removed).
- Nav renamed: "Mama’s recipes" (home grid, Mama’s own recipes only) and "From the yard" (new `/yard` page of approved community recipes, each credited to its cook).

## Privacy notice (part of milestone 8, done early for class)

- `/privacy`: plain-language notice written with the NDPA 2023 in mind. Covers what is collected and why (as a table), that only recipe text (never personal details) may go to an AI provider outside Nigeria, the 30-day deletion of rejected submissions, and how to ask for data to be deleted (sophia@ahuoyiza.com).
- New `/recipes` page holds Mama's full collection with the category chips and search (`?category=`, `?q=`). The home page now shows Mama's newest six recipes, with chips and search that open `/recipes`, and a "See all of Mama's recipes →" button. "Mama's recipes" in the nav goes to `/recipes`.

## Milestones 7 and 8: Admin and AI pre-review

- Admin area ("Mama's kitchen") at `/admin`: sign-in, dashboard, submissions list filtered by status, review screen, and a recipes list with publish/unpublish and delete (native `<dialog>` confirmation).
- `proxy.ts` (Next 16's middleware) refreshes the Supabase session and sends signed-out visitors to `/admin/login`. Every admin page, server action and API route also checks `is_admin()` on the server (`lib/auth/admin.ts`).
- Review screen: the photo through a 10-minute signed URL from the private bucket, the recipe, the cook's private details, the AI panel, and an approve/reject form validated by `reviewDecisionSchema` (the reason box only shows for "Not this time").
- Approving runs one Postgres function, `approve_submission`, so the recipe is created and the submission marked approved together or not at all. The photo is copied to the public bucket and the site's recipe cache is refreshed (`updateTag`).
- `purge_rejected_submissions()` deletes rejected submissions 30 days after the decision (service role only; see the README for scheduling).
- AI pre-review ("Ask Mama's helper"): `POST /api/admin/ai-review`. `lib/ai/review-context.ts` builds a `z.strictObject` allowlist of recipe fields only and runs every text field through `redact()` (`lib/privacy/redact.ts`: emails, Nigerian phone numbers, 11-digit ID numbers). Structured output with `aiReviewSchema`; the result is stored as suggestions and differences between the AI's allergens and the cook's ticks are flagged. `lib/ai/log.ts` logs only route, hashed admin id, model, outcome, tokens and duration.
- Model set by the optional `GEMINI_MODEL` env var (default `gemini-3.1-flash-lite`, the one answering reliably today). `@ai-sdk/google` pinned to v3, the line that matches AI SDK 6.
- `package.json` now says Node 22 or newer (`engines`): `@supabase/supabase-js` needs Node 22's built-in WebSocket.
- Tests: 98, adding `redact()`, the allowlist (extra keys rejected, no personal data, redaction applied) and the safe log.
- Phones: "Mama’s recipes" and "From the yard" now show as a second row under the header instead of being hidden (the reference hides them because its links only scrolled the home page).

## "Paint it Mama's way" (added at Sophia's request)

- On the review screen, Mama can turn a submitted photo into a painted picture (`lib/images/paint.ts`): smoothing, warmer colours, a small flat palette, ink outlines from edge detection, and a soft round fade so the dish sits on the card colour like the launch illustrations.
- Plain image processing with `sharp` on our own server: free, about half a second, and the photo is never sent to an outside service. (Image-generating AI needs a paid Google plan; this was chosen instead.)
- The original and the painted version show side by side; approving with "Painted, Mama's style" publishes the painted PNG as an illustration, otherwise the photo keeps its polaroid frame. The painted copy stays in the private bucket until then.
- Privacy notice updated to say photos may be painted on our own server.

## Milestone 10: README

- `README.md`: what the app is, setup for students (Node 22+, their own Supabase project and keys, migrations and seed, making an admin), scripts, the checkpoint branches, where each layer of validation lives, clearing out rejected submissions, deploying to Vercel, and privacy in short.
- `.env.example` (committed) lists every variable with where to find it.
- `npm run purge:rejected` (`scripts/purge-rejected.mjs`) deletes rejected submissions after 30 days along with their photos and painted copies. `purge_rejected_submissions()` now returns each submission's id as well as its photo path.

### More of Mama's recipes

- Added **Ofe Nsala** (Igbo white soup with catfish, thickened with yam) and **Masa** (Northern rice cakes) to the live database and to `supabase/seed.sql`.
- They use `public/images/pot-placeholder.png` (Mama's steaming pot on the card colour) until real photos are added through the admin.

### Mama's own recipes in the admin

- `/admin/recipes/new` and `/admin/recipes/[id]/edit`: one form for adding and editing Mama's recipes (React Hook Form with `recipeSchema`, ingredient/step lists, allergens, card tag and colour, credit, published).
- The web address follows the title until it's edited; a taken address comes back as a field error from the server.
- Pictures go through the same server checks as submissions (real file type, size, EXIF stripped), with an optional "Paint it Mama's way" tick box. Replacing a picture removes the old upload.
- Saving refreshes the site's recipe cache (`updateTag`), so changes show straight away.
- `RowTools` (move up/down/remove) moved to its own component, shared by both forms.
