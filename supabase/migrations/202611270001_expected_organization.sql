-- Porównanie w tej samej transakcji, w której wykonywana jest operacja.
-- Nagłówek sprawdza zgodność kontekstu klienta; uprawnienia wynikają z członkostwa i RLS.
create or replace function public.current_org_id() returns uuid
language plpgsql stable security definer set search_path='' as $$
declare
 expected_org text := nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-avero-organization';
 actual_org uuid;
begin
 with me as (select auth.uid() as uid),
 mine as (
  select m.org_id, 0 as kind, m.created_at from public.org_members m, me where m.user_id=me.uid
  union all
  select cm.org_id, 1, c.created_at from public.customer_memberships cm join public.customers c on c.id=cm.customer_id, me where cm.user_id=me.uid
 ),
 usable as (
  select x.org_id, min(x.kind) kind, min(x.created_at) created_at,
   exists(select 1 from public.account_access a, me where a.user_id=me.uid and a.org_id=x.org_id and a.blocked) blocked
  from mine x group by x.org_id
 )
 select u.org_id into actual_org from usable u left join public.org_active a on a.user_id=(select uid from me) and a.org_id=u.org_id
 order by u.blocked, (a.org_id is null), u.kind, u.created_at, u.org_id limit 1;
 if expected_org is not null and expected_org is distinct from actual_org::text then
  raise exception 'Active organization changed' using errcode = 'PT409';
 end if;
 return actual_org;
end;
$$;
