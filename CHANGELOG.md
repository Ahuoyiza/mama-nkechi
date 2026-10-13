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
