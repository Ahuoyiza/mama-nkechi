-- =====================================================================
-- Review workflow: approve a submission atomically, and purge old rejections.
-- =====================================================================

-- Approve: create the published recipe AND mark the submission approved in
-- one transaction. If either step fails, neither happens.
-- security invoker: it runs as the signed-in admin, so the RLS policies on
-- recipes and recipe_submissions still apply.
create function public.approve_submission(
  p_submission_id uuid,
  p_slug text,
  p_tag text,
  p_card_colour public.card_colour,
  p_image_style public.image_style,
  p_image_path text
) returns public.recipes
language plpgsql
security invoker
set search_path = ''
as $$
declare
  s public.recipe_submissions;
  r public.recipes;
  v_slug text := p_slug;
  n int := 1;
begin
  if not public.is_admin() then
    raise exception 'Only admins can approve submissions' using errcode = '42501';
  end if;

  select * into s from public.recipe_submissions where id = p_submission_id for update;
  if not found then
    raise exception 'Submission not found' using errcode = 'P0002';
  end if;
  if s.status <> 'pending' then
    raise exception 'This submission has already been reviewed' using errcode = 'P0001';
  end if;

  -- Keep slugs unique: puff-puff, puff-puff-2, puff-puff-3...
  while exists (select 1 from public.recipes where slug = v_slug) loop
    n := n + 1;
    v_slug := p_slug || '-' || n;
  end loop;

  insert into public.recipes (
    slug, title, description, tag, category, effort, total_minutes, serves,
    ingredients, steps, allergens, image_path, card_colour, image_style,
    credit_name, published, published_at, source_submission_id
  ) values (
    v_slug, s.title, s.description, p_tag, s.category, s.effort, s.total_minutes, s.serves,
    s.ingredients, s.steps, s.allergens, p_image_path, p_card_colour, p_image_style,
    s.credit_name, true, now(), s.id
  ) returning * into r;

  update public.recipe_submissions
  set status = 'approved', reviewed_at = now(), review_note = null
  where id = s.id;

  return r;
end
$$;

grant execute on function public.approve_submission(uuid, text, text, public.card_colour, public.image_style, text) to authenticated;

-- Purge: delete rejected submissions 30 days after the decision.
-- Returns the deleted rows' image paths so the caller can remove the photos
-- through the Storage API (Supabase doesn't allow deleting storage objects
-- with plain SQL). Only the service role may run it.
create function public.purge_rejected_submissions()
returns setof text
language sql
security definer
set search_path = ''
as $$
  delete from public.recipe_submissions
  where status = 'rejected' and reviewed_at < now() - interval '30 days'
  returning image_path;
$$;

revoke all on function public.purge_rejected_submissions() from public, anon, authenticated;
grant execute on function public.purge_rejected_submissions() to service_role;
