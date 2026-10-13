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
