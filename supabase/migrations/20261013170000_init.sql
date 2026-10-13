-- =====================================================================
-- Mama Nkechi's Pot: initial schema
--
-- Zod validates data in the app. The CHECK constraints here are a second
-- line of defence: even a buggy server action can't store a 5,000-character
-- title or a negative cooking time.
-- =====================================================================

-- ---------- Enums ----------
create type public.recipe_category as enum ('rice', 'soups_stews', 'small_chops', 'swallow', 'drinks', 'desserts');
create type public.recipe_effort as enum ('easy', 'medium', 'involved');
create type public.card_colour as enum ('peach', 'yellow', 'herb');
create type public.image_style as enum ('illustration', 'photo');
create type public.submission_status as enum ('pending', 'approved', 'rejected');

-- Allergens are a text[] limited to this list (kept in sync with lib/recipes/types.ts).
create function public.valid_allergens(items text[]) returns boolean
language sql immutable
set search_path = ''
as $$
  select items <@ array['peanuts', 'tree_nuts', 'fish', 'shellfish', 'eggs', 'milk', 'soy', 'wheat', 'sesame']::text[]
$$;

-- ---------- Admins ----------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- True when the signed-in user is in public.admins. Used by every admin policy.
-- security definer so it can read admins even though admins has no policies.
create function public.is_admin() returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()))
$$;

-- ---------- Submissions (private: never readable by the public) ----------
create table public.recipe_submissions (
  id uuid primary key default gen_random_uuid(),
  status public.submission_status not null default 'pending',

  title text not null check (char_length(title) between 3 and 80),
  description text not null check (char_length(description) between 20 and 200),
  category public.recipe_category not null,
  effort public.recipe_effort not null,
  total_minutes int not null check (total_minutes between 5 and 720),
  serves int not null check (serves between 1 and 30),
  ingredients jsonb not null check (jsonb_typeof(ingredients) = 'array' and jsonb_array_length(ingredients) between 2 and 30),
  steps jsonb not null check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) between 2 and 20),
  allergens text[] not null default '{}' check (public.valid_allergens(allergens)),
  image_path text not null,

  submitter_name text not null check (char_length(submitter_name) between 2 and 60),
  submitter_email text not null check (char_length(submitter_email) <= 254),
  submitter_phone text,
  credit_name text check (credit_name is null or char_length(credit_name) between 2 and 40),
  is_adult boolean not null default true,
  guardian_email text,
  consent_publish boolean not null check (consent_publish),
  consent_privacy boolean not null check (consent_privacy),

  review_note text,
  reviewed_at timestamptz,
  ai_review jsonb,
  ip_hash text not null,
  created_at timestamptz not null default now(),

  -- A rejection must say why (mirrors reviewDecisionSchema).
  constraint rejected_needs_note check (status <> 'rejected' or char_length(review_note) between 10 and 500),
  -- Under-18s need a guardian (mirrors recipeSubmissionSchema).
  constraint minor_needs_guardian check (is_adult or guardian_email is not null)
);

create index recipe_submissions_status_created_idx on public.recipe_submissions (status, created_at desc);
create index recipe_submissions_email_created_idx on public.recipe_submissions (submitter_email, created_at desc);
create index recipe_submissions_ip_created_idx on public.recipe_submissions (ip_hash, created_at desc);

-- ---------- Recipes ----------
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 80),
  description text not null check (char_length(description) between 20 and 200),
  tag text not null check (char_length(tag) between 2 and 30),
  category public.recipe_category not null,
  effort public.recipe_effort not null,
  total_minutes int not null check (total_minutes between 5 and 720),
  serves int not null check (serves between 1 and 30),
  ingredients jsonb not null check (jsonb_typeof(ingredients) = 'array'),
  steps jsonb not null check (jsonb_typeof(steps) = 'array'),
  allergens text[] not null default '{}' check (public.valid_allergens(allergens)),
  image_path text not null,
  card_colour public.card_colour not null default 'peach',
  image_style public.image_style not null default 'photo',
  credit_name text,
  published boolean not null default false,
  published_at timestamptz,
  source_submission_id uuid references public.recipe_submissions (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipes_published_idx on public.recipes (published, published_at);

create function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create trigger recipes_touch_updated_at
before update on public.recipes
for each row execute function public.touch_updated_at();

-- ---------- Row Level Security ----------
alter table public.admins enable row level security;
alter table public.recipe_submissions enable row level security;
alter table public.recipes enable row level security;

-- admins: no policies at all, so nobody can read or write it through the API.

-- recipe_submissions: no public policies. The public form inserts through a
-- server action that validates first and then uses the service role key.
create policy "Admins can read submissions" on public.recipe_submissions
  for select to authenticated using ((select public.is_admin()));
create policy "Admins can update submissions" on public.recipe_submissions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete submissions" on public.recipe_submissions
  for delete to authenticated using ((select public.is_admin()));

-- recipes: anyone can read published recipes; only admins can see drafts or write.
create policy "Anyone can read published recipes" on public.recipes
  for select to anon, authenticated using (published or (select public.is_admin()));
create policy "Admins can insert recipes" on public.recipes
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admins can update recipes" on public.recipes
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete recipes" on public.recipes
  for delete to authenticated using ((select public.is_admin()));

-- Explicit grants (RLS still decides which rows).
grant usage on schema public to anon, authenticated, service_role;
grant select on public.recipes to anon;
grant select, insert, update, delete on public.recipes to authenticated;
grant select, update, delete on public.recipe_submissions to authenticated;
grant all on public.recipes, public.recipe_submissions, public.admins to service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------- Storage ----------
-- recipe-images: public read (published recipe photos).
-- submission-images: private. Admins read it through short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('recipe-images', 'recipe-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('submission-images', 'submission-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Admins manage recipe images" on storage.objects
  for all to authenticated
  using (bucket_id = 'recipe-images' and (select public.is_admin()))
  with check (bucket_id = 'recipe-images' and (select public.is_admin()));

create policy "Admins read submission images" on storage.objects
  for select to authenticated
  using (bucket_id = 'submission-images' and (select public.is_admin()));

create policy "Admins delete submission images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'submission-images' and (select public.is_admin()));
