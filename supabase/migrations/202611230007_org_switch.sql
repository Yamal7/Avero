-- M0.1 Wielofirmowość (KRA-27), krok 7: lista firm osoby i przełączenie aktywnej firmy (przełącznik w ramie).
-- Obie funkcje działają jako postgres (wyjątek w 044): muszą widzieć członkostwa we wszystkich firmach osoby.
-- Pokazują wyłącznie firmy, do których osoba należy (pracownik albo klient portalu) i w których nie jest zablokowana.

create function public.my_organizations() returns jsonb
language sql stable security definer set search_path='' as $$
 with me as (select auth.uid() as uid),
 mine as (
  select m.org_id, m.role from public.org_members m, me where m.user_id=me.uid
  union all
  select cm.org_id, 'client' from public.customer_memberships cm, me where cm.user_id=me.uid
 ),
 orgs as (
  select x.org_id, (array_agg(x.role order by case x.role when 'admin' then 0 when 'office' then 1 when 'technician' then 2 else 3 end))[1] as role
  from mine x
  where not exists(select 1 from public.account_access a, me where a.user_id=me.uid and a.org_id=x.org_id and a.blocked)
  group by x.org_id
 )
 select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'name',o.name,'role',x.role,'active',o.id=public.current_org_id()) order by o.name, o.id),'[]'::jsonb)
 from orgs x join public.organizations o on o.id=x.org_id;
$$;
revoke all on function public.my_organizations() from public, anon;
grant execute on function public.my_organizations() to authenticated;

create function public.set_active_org(p_org uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or p_org is null
 or not exists(select 1 from jsonb_array_elements(public.my_organizations()) o where (o->>'id')::uuid=p_org) then
  raise exception 'Organization unavailable' using errcode='42501';
 end if;
 insert into public.org_active(user_id,org_id) values(auth.uid(),p_org)
 on conflict(user_id) do update set org_id=excluded.org_id, updated_at=now();
 return public.my_organizations();
end $$;
revoke all on function public.set_active_org(uuid) from public, anon;
grant execute on function public.set_active_org(uuid) to authenticated;
