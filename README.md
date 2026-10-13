# Mama Nkechi's Pot

An illustrated Nigerian recipe site, and the teaching project for the Rise Academy Frontend Engineering lesson on **data validation**: Zod, React Hook Form, and keeping personal data safe when you use AI.

- **Visitors** browse Mama's recipes and community recipes ("From the yard"), filter, search and save favourites.
- **Home cooks** send a recipe through the "Share your pot" form. No account needed.
- **Mama (the admin)** reviews submissions, asks an AI helper for a pre-check, can turn a photo into a painted picture, and approves or rejects.

Live site: https://mama-nkechi.vercel.app

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · Supabase (Postgres, Storage, Auth) · Zod 4 · React Hook Form 7 · Vercel AI SDK 6 with Google Gemini · `sharp` and `file-type` for images · Vitest

## Before you start

- **Node.js 22 or newer** (`node -v`). With nvm: `nvm install 22 && nvm use 22`.
- A free **Supabase** account: https://supabase.com
- A free **Google AI Studio** API key: https://aistudio.google.com/apikey

Use **your own** Supabase project and keys. Never share keys or commit `.env.local`.

## Setup

### 1. Install

```bash
git clone https://github.com/Ahuoyiza/mama-nkechi.git
cd mama-nkechi
npm install
cp .env.example .env.local
```

### 2. Create a Supabase project

1. In the Supabase dashboard, create a new project. Save the database password somewhere safe.
2. Fill in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://<project-ref>.supabase.co` (the `<project-ref>` is the code in your dashboard's address bar)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the **publishable** key (Project Settings → API Keys)
   - `SUPABASE_SERVICE_ROLE_KEY`: the **secret** key. Server only; never put it in browser code.
   - `GOOGLE_GENERATIVE_AI_API_KEY`: from Google AI Studio
   - `IP_HASH_SALT`: run `openssl rand -hex 32` and paste the result
3. In **Authentication → Sign In / Providers**, switch off **Allow new users to sign up** (only Mama signs in).

### 3. Create the database

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --include-seed
npm run seed:images
```

This creates the tables, Row Level Security policies, storage buckets and database functions (`supabase/migrations/`), adds the three launch recipes and three fake pending submissions (`supabase/seed.sql`), and uploads their photos.

### 4. Make yourself the admin

1. In **Authentication → Users → Add user → Create new user**, enter your email and a password, and tick **Auto Confirm User**.
2. Then run:

```bash
npm run make-admin -- you@example.com
```

### 5. Run it

```bash
npm run dev
```

Open http://localhost:3000. The admin area is at http://localhost:3000/admin.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app on http://localhost:3000 |
| `npm run build` / `npm start` | Production build / run it |
| `npm run test` | Vitest: schemas, redaction, image checks and more |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate Next's route types, then TypeScript |
| `npm run make-admin -- <email>` | Add an existing Supabase user to `admins` |
| `npm run seed:images` | Upload photos for the seed submissions |
| `npm run db:types` | Regenerate `lib/supabase/database.types.ts` from your linked project |
| `npm run purge:rejected` | Delete rejected submissions (and their photos) 30 days after the decision |

## The class: checkpoint branches

`main` is the finished app. Each `class/*` branch is the app part-way through the lesson, with `// TODO (Activity N)` comments marking what to build. Every branch runs.

| Branch | You build next |
| --- | --- |
| `class/00-start` | Activity 1: break it, then write the Zod schemas |
| `class/01-zod` | Activity 2: the form with React Hook Form |
| `class/02-form` | Activity 3: never trust the client (server-side validation) |
| `class/03-server` | Activity 4: AI pre-review without leaking personal data |
| `class/04-ai-privacy` | Done: the same as `main` |

```bash
git checkout class/00-start
npm run dev
```

Behind? Switch to the next branch to catch up. Your `.env.local` and `node_modules` stay as they are. The full list of TODOs is in [docs/CHECKPOINTS.md](docs/CHECKPOINTS.md).

**Don't merge the `class/*` branches into `main`.** They're stripped-down copies, meant to live side by side.

## Where the validation lives

| Where | File | Guards |
| --- | --- | --- |
| Shared rules | `lib/schemas/` | Every schema, used by both the browser and the server |
| Browser | `components/submit/SubmitForm.tsx` | Friendly, instant errors (React Hook Form + `zodResolver`) |
| Server | `app/submit/actions.ts` | Honeypot, rate limit, `safeParse`, image re-check, then insert |
| Images | `lib/images/verify.ts` | Real file type (magic bytes), minimum size, strips EXIF/GPS |
| Database | `supabase/migrations/` | CHECK constraints and Row Level Security as the last line of defence |
| AI | `lib/ai/review-context.ts`, `lib/privacy/redact.ts`, `lib/ai/log.ts` | Allowlist of fields, redaction, safe logging |
| Config | `lib/schemas/env.ts`, `lib/env.ts` | Environment variables, checked at startup |

## Clearing out rejected submissions

The privacy notice promises rejected submissions are deleted 30 days after the decision. Run this once a day or week:

```bash
npm run purge:rejected
```

It calls the `purge_rejected_submissions()` database function (service role only), which deletes the rows and returns their photo paths, then removes the photos (and any painted copies) through the Storage API. Supabase doesn't let plain SQL delete storage files, which is why this is a script rather than only a `pg_cron` job.

To schedule just the database part inside Supabase, enable the `pg_cron` extension (Database → Extensions) and run this in the SQL editor:

```sql
select cron.schedule('purge-rejected-submissions', '0 3 * * *', $$select public.purge_rejected_submissions()$$);
```

If you do this, still run `npm run purge:rejected` now and then, or the photos of deleted submissions will stay in storage.

## Deploying to Vercel

1. Import the GitHub repository into Vercel.
2. In **Settings → Environment Variables**, add every variable from `.env.local` for **Production** and **Preview**. Mark `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY` and `IP_HASH_SALT` as **Sensitive**.
3. Deploy. If the build stops with "Invalid public environment variables", a variable is missing or misspelled. That message is the env schema doing its job.

## Privacy

The plain-language privacy notice is at `/privacy`. In short: submitters' contact details are only seen by Mama; IP addresses are stored only as a salted hash; photo metadata (including GPS) is stripped; the AI helper only ever receives the recipe text, with emails and phone numbers blanked out; and painting a photo happens on our own server.

## Credits

Built by Sophia Ahuoyiza for Rise Academy. Design reference: *Mama Nkechi's Pot* illustrated recipe site.
