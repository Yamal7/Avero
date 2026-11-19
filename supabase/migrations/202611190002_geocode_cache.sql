-- Planowanie · mapa: coordinates of addresses from OpenStreetMap Nominatim, cached so each address is looked up once.
-- Keyed by a normalised "address, city" string; failures are cached too so they are not retried on every visit.
create table public.geocode_cache(
  query text primary key check(length(query) between 3 and 400),
  latitude double precision check(latitude between -90 and 90),
  longitude double precision check(longitude between -180 and 180),
  failed boolean not null default false,
  fetched_at timestamptz not null default now(),
  check(failed or (latitude is not null and longitude is not null))
);
alter table public.geocode_cache enable row level security;
revoke all on public.geocode_cache from public,anon,authenticated;

create function public.geocode_key(p_address text,p_city text) returns text language sql immutable set search_path='' as $$
 select lower(regexp_replace(trim(concat_ws(', ',nullif(trim(p_address),''),nullif(trim(p_city),''))),'\s+',' ','g'))
$$;

-- Staff read cached coordinates for the keys they already know (addresses of visits they can see).
create function public.geocode_lookup(p_keys text[]) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid()) then raise exception 'Staff required' using errcode='42501';end if;
 if p_keys is null or cardinality(p_keys)>500 then raise exception 'Invalid keys' using errcode='22023';end if;
 return coalesce((select jsonb_object_agg(g.query,jsonb_build_object('lat',g.latitude,'lng',g.longitude)) from public.geocode_cache g where g.query=any(p_keys) and not g.failed),'{}');
end;$$;

-- Office: addresses that still need a lookup (locations with open tickets or recent/upcoming visits, plus the company base).
create function public.geocode_pending(p_limit integer default 5) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('key',k.key,'query',k.query)) from(
  select distinct on(public.geocode_key(l.address,l.city)) public.geocode_key(l.address,l.city) as key,concat_ws(', ',l.address,l.postal_code,l.city,'Polska') as query
  from public.locations l join public.installations i on i.location_id=l.id join public.service_tickets t on t.installation_id=i.id
  left join public.service_visits v on v.ticket_id=t.id
  where (t.status<>'closed' or v.scheduled_at>now()-interval '7 days') and length(public.geocode_key(l.address,l.city))>=3
   and not exists(select 1 from public.geocode_cache g where g.query=public.geocode_key(l.address,l.city))
  limit greatest(1,least(coalesce(p_limit,5),10))) k),'[]');
end;$$;

create function public.save_geocode(p_key text,p_lat double precision,p_lng double precision) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_key is null or length(p_key) not between 3 and 400 or p_key<>lower(p_key) or (p_lat is null)<>(p_lng is null) or p_lat not between -90 and 90 or p_lng not between -180 and 180 then raise exception 'Invalid geocode' using errcode='22023';end if;
 insert into public.geocode_cache(query,latitude,longitude,failed) values(p_key,p_lat,p_lng,p_lat is null)
 on conflict(query) do update set latitude=excluded.latitude,longitude=excluded.longitude,failed=excluded.failed,fetched_at=now();
end;$$;

do $$declare f record;begin for f in select oid from pg_proc where pronamespace='public'::regnamespace and proname in('geocode_key','geocode_lookup','geocode_pending','save_geocode') loop execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);end loop;end;$$;
grant execute on function public.geocode_lookup(text[]),public.geocode_pending(integer),public.save_geocode(text,double precision,double precision) to authenticated;
