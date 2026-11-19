-- Geocoding returns address parts so the app can try several query variants ("ul." prefixes and postal codes confuse Nominatim).
-- Failed lookups cached before this change are retried once.
delete from public.geocode_cache where failed;
create or replace function public.geocode_pending(p_limit integer default 5) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('key',k.key,'address',k.address,'postalCode',k.postal_code,'city',k.city)) from(
  select distinct on(public.geocode_key(l.address,l.city)) public.geocode_key(l.address,l.city) as key,l.address,coalesce(l.postal_code,'') as postal_code,l.city
  from public.locations l join public.installations i on i.location_id=l.id join public.service_tickets t on t.installation_id=i.id
  left join public.service_visits v on v.ticket_id=t.id
  where (t.status<>'closed' or v.scheduled_at>now()-interval '7 days') and length(public.geocode_key(l.address,l.city))>=3
   and not exists(select 1 from public.geocode_cache g where g.query=public.geocode_key(l.address,l.city))
  limit greatest(1,least(coalesce(p_limit,5),10))) k),'[]');
end;$$;
revoke all on function public.geocode_pending(integer) from public,anon,authenticated;
grant execute on function public.geocode_pending(integer) to authenticated;
