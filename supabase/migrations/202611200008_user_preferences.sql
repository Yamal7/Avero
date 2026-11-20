-- Interface preferences stored on the account (design: collapsed sidebar groups follow the person between devices).
create table public.user_preferences(
  user_id uuid not null references auth.users on delete cascade,
  key text not null check(key ~ '^[a-z][a-z0-9_.-]{0,63}$'),
  value jsonb not null check(length(value::text)<=4000),
  updated_at timestamptz not null default now(),
  primary key(user_id,key)
);
alter table public.user_preferences enable row level security;
revoke all on public.user_preferences from public,anon,authenticated;

create function public.my_preferences() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.account_enabled(auth.uid()) then raise exception 'Account required' using errcode='42501';end if;
 return coalesce((select jsonb_object_agg(key,value) from public.user_preferences where user_id=auth.uid()),'{}');
end;$$;
create function public.set_my_preference(p_key text,p_value jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.account_enabled(auth.uid()) then raise exception 'Account required' using errcode='42501';end if;
 if p_key is null or p_key !~ '^[a-z][a-z0-9_.-]{0,63}$' or p_value is null or length(p_value::text)>4000 then raise exception 'Invalid preference' using errcode='22023';end if;
 if (select count(*) from public.user_preferences where user_id=auth.uid())>=100 and not exists(select 1 from public.user_preferences where user_id=auth.uid() and key=p_key) then raise exception 'Too many preferences' using errcode='22023';end if;
 insert into public.user_preferences(user_id,key,value) values(auth.uid(),p_key,p_value) on conflict(user_id,key) do update set value=excluded.value,updated_at=now();
end;$$;
revoke all on function public.my_preferences(),public.set_my_preference(text,jsonb) from public,anon,authenticated;
grant execute on function public.my_preferences(),public.set_my_preference(text,jsonb) to authenticated;
