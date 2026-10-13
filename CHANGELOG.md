# Changelog

## Milestone 1: Scaffold

- Next.js 16 App Router project with TypeScript strict mode, Tailwind CSS v4 and ESLint.
- Itim (display) and DM Sans (body) loaded with `next/font/google`.
- Design tokens from the reference design in `app/globals.css`, exposed to Tailwind (`bg-peach`, `text-ink`, `font-display`, `shadow-candy`...).
- Seed illustrations (jollof pot, egusi, suya) in `public/images/`.
- Vitest set up for `lib/**/__tests__/`, with a first `slugify()` helper that strips tonal marks.
- Scripts: `npm run test`, `npm run lint`, `npm run typecheck`.
