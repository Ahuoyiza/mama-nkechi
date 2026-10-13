-- purge_rejected_submissions now also returns each submission's id, so the
-- caller can delete its painted copy (painted/<id>.png) as well as the photo.
drop function public.purge_rejected_submissions();

create function public.purge_rejected_submissions()
returns table (id uuid, image_path text)
language sql
security definer
set search_path = ''
as $$
  delete from public.recipe_submissions as s
  where s.status = 'rejected' and s.reviewed_at < now() - interval '30 days'
  returning s.id, s.image_path;
$$;

revoke all on function public.purge_rejected_submissions() from public, anon, authenticated;
grant execute on function public.purge_rejected_submissions() to service_role;
