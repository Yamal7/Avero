-- M0.1 Wielofirmowość (KRA-27), krok 5: zarządzanie dostępem w obrębie aktywnej firmy.
-- Rola i blokada dotyczą firmy administratora; lista osób pokazuje tylko osoby związane z firmą
-- (pracownicy, klienci portalu jej firm-klientów, zaproszeni), a nie wszystkie konta w systemie.
-- Administrator zmienia rolę, dostęp do klienta i blokadę wyłącznie osobom związanym już z jego firmą;
-- nowe osoby trafiają do firmy tylko przez zaproszenie.

-- Osoba związana z aktywną firmą: pracownik, klient portalu jej klienta albo osoba, która przyjęła jej zaproszenie.
-- Działa jako avero_rpc, więc org_isolation zawęża każdą z tabel do aktywnej firmy.
create function public.org_knows_user(p_user uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select p_user is not null and (exists(select 1 from public.org_members where user_id=p_user)
  or exists(select 1 from public.customer_memberships where user_id=p_user)
  or exists(select 1 from public.access_invitations where accepted_by=p_user and status='accepted'));
$$;
revoke all on function public.org_knows_user(uuid) from public, anon, authenticated;
alter function public.org_knows_user(uuid) owner to avero_rpc;

-- Blokada konta w konkretnej firmie (worker poczty: firma powiadomienia, nie aktywna firma ani „dowolna”).
create function public.account_enabled_in(p_user uuid, p_org uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select p_user is not null and p_org is not null
  and not exists(select 1 from public.account_access a where a.user_id=p_user and a.org_id=p_org and a.blocked);
$$;
revoke all on function public.account_enabled_in(uuid,uuid) from public, anon, authenticated;
grant execute on function public.account_enabled_in(uuid,uuid) to avero_rpc, service_role;

create or replace function public.set_access_role(p_user uuid, p_role text) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.assert_access_admin();
 if p_role not in ('admin','office','technician','client') or p_role is null then raise exception 'Invalid role' using errcode='22023'; end if;
 if not public.org_knows_user(p_user) then raise exception 'User not found' using errcode='P0001'; end if;
 if p_role <> 'admin' then perform public.protect_last_admin(p_user); end if;
 if p_role='client' then delete from public.org_members where user_id=p_user;
 else
 insert into public.org_members(user_id,role) values(p_user,p_role) on conflict(org_id,user_id) do update set role=excluded.role;
 if p_role<>'technician' then delete from public.staff_customer_assignments where user_id=p_user; end if;
 end if;
 update public.access_invitations set status='revoked' where status='pending' and email=(select lower(email) from public.auth_user_directory where id=p_user);
end $$;

create or replace function public.set_access_blocked(p_user uuid, p_blocked boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.assert_access_admin();
 if p_blocked is null or not public.org_knows_user(p_user) then raise exception 'Invalid user' using errcode='22023'; end if;
 if p_blocked then perform public.protect_last_admin(p_user); end if;
 insert into public.account_access(user_id,blocked) values(p_user,p_blocked) on conflict(org_id,user_id) do update set blocked=excluded.blocked;
 if p_blocked then update public.access_invitations set status='revoked' where status='pending' and email=(select lower(email) from public.auth_user_directory where id=p_user); end if;
end $$;

create or replace function public.list_access_users(p_search text default '', p_page integer default 1) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb; total integer;
begin
 perform public.assert_access_admin();
 if p_page<1 or p_page>100000 or length(p_search)>200 then raise exception 'Invalid page' using errcode='22023'; end if;
 -- Konta nie mają org_id: zawężamy do osób, które firma zna (org_isolation filtruje każdą z tych tabel).
 select count(*) into total from public.auth_user_directory u where u.id in (select m.user_id from public.org_members m union select cm.user_id from public.customer_memberships cm union select aa.user_id from public.account_access aa union select iu.id from public.auth_user_directory iu join public.access_invitations i on i.email=lower(iu.email) and (i.status='accepted' or i.status='pending' and i.expires_at>now())) and ( strpos(lower(coalesce(u.email,'')),lower(trim(p_search)))>0 or trim(p_search)='');
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (
 select u.id,u.email,u.email_confirmed_at,u.created_at,coalesce(s.role,'client') as role,not public.account_enabled(u.id) as blocked,
 coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'kind','member')) from public.customer_memberships m join public.customers c on c.id=m.customer_id where m.user_id=u.id),'[]') ||
 coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'kind','technician')) from public.staff_customer_assignments a join public.customers c on c.id=a.customer_id where a.user_id=u.id),'[]') as customers
 from public.auth_user_directory u left join public.staff_users s on s.user_id=u.id
 where u.id in (select m.user_id from public.org_members m union select cm.user_id from public.customer_memberships cm union select aa.user_id from public.account_access aa union select iu.id from public.auth_user_directory iu join public.access_invitations i on i.email=lower(iu.email) and (i.status='accepted' or i.status='pending' and i.expires_at>now())) and (strpos(lower(coalesce(u.email,'')),lower(trim(p_search)))>0 or trim(p_search)='')
 order by u.created_at desc,u.id limit 25 offset (p_page-1)*25
 ) t;
 return jsonb_build_object('users',result,'total',total);
end $$;

create or replace function public.set_customer_access(p_user uuid, p_customer uuid, p_kind text, p_remove boolean default false) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.assert_access_admin();
 if p_kind not in ('member','technician') or p_kind is null or p_remove is null then raise exception 'Invalid assignment' using errcode='22023'; end if;
 if not public.org_knows_user(p_user) then raise exception 'User not found' using errcode='P0001'; end if;
 if not p_remove and not exists(select 1 from public.customers where id=p_customer and archived_at is null) then raise exception 'Active customer required' using errcode='P0001'; end if;
 if p_kind='technician' then
  if not exists(select 1 from public.staff_users where user_id=p_user and role='technician') then raise exception 'Technician role required' using errcode='P0001'; end if;
  if p_remove then delete from public.staff_customer_assignments where user_id=p_user and customer_id=p_customer;
  else insert into public.staff_customer_assignments(user_id,customer_id) values(p_user,p_customer) on conflict do nothing; end if;
 else
  if p_remove then delete from public.customer_memberships where user_id=p_user and customer_id=p_customer;
  else insert into public.customer_memberships(user_id,customer_id,role) values(p_user,p_customer,'viewer') on conflict do nothing; end if;
 end if;
 if p_remove then update public.access_invitations set status='revoked' where status='pending' and customer_id=p_customer and email=(select lower(email) from public.auth_user_directory where id=p_user); end if;
end $$;

-- Przyjęcie zaproszenia: osoba nie należy jeszcze do firmy zaproszenia, więc funkcja działa jako postgres i każdy
-- warunek wskazuje firmę zaproszenia jawnie. Po przyjęciu firma zaproszenia staje się aktywną firmą osoby.
create or replace function public.accept_access_invitation(p_invitation uuid) returns void
language plpgsql security definer set search_path='' as $$
declare invitation public.access_invitations%rowtype; verified boolean;
begin
 perform pg_advisory_xact_lock(682501004);
 if not public.account_enabled(auth.uid()) then raise exception 'Account unavailable' using errcode='42501'; end if;
 select * into invitation from public.access_invitations where id=p_invitation for update;
 if not found then raise exception 'Invitation unavailable' using errcode='P0001'; end if;
 if exists(select 1 from public.account_access where org_id=invitation.org_id and user_id=auth.uid() and blocked) then raise exception 'Account unavailable' using errcode='42501'; end if;
 select exists(select 1 from auth.users where id=auth.uid() and lower(email)=invitation.email and email_confirmed_at is not null) into verified;
 if not verified then raise exception 'Verified invitation email required' using errcode='42501'; end if;
 if invitation.status='accepted' and invitation.accepted_by=auth.uid() then return; end if;
 if invitation.status<>'pending' or invitation.expires_at<now()
 or exists(select 1 from public.account_access where org_id=invitation.org_id and user_id=invitation.created_by and blocked)
 or not exists(select 1 from public.org_members where org_id=invitation.org_id and user_id=invitation.created_by and role='admin') then
 raise exception 'Invitation unavailable' using errcode='P0001'; end if;
 if invitation.customer_id is not null and not exists(select 1 from public.customers where id=invitation.customer_id and org_id=invitation.org_id and archived_at is null) then raise exception 'Customer unavailable' using errcode='P0001'; end if;
 if invitation.role='client' then
 insert into public.customer_memberships(org_id,user_id,customer_id,role) values(invitation.org_id,auth.uid(),invitation.customer_id,'viewer') on conflict do nothing;
 else
 if exists(select 1 from public.org_members where org_id=invitation.org_id and user_id=auth.uid()) then raise exception 'Use administrator for staff changes' using errcode='P0001'; end if;
 insert into public.org_members(org_id,user_id,role) values(invitation.org_id,auth.uid(),invitation.role);
 if invitation.role='technician' and invitation.customer_id is not null then insert into public.staff_customer_assignments(org_id,user_id,customer_id) values(invitation.org_id,auth.uid(),invitation.customer_id); end if;
 end if;
 update public.access_invitations set status='accepted',accepted_by=auth.uid() where id=p_invitation;
 insert into public.org_active(user_id,org_id) values(auth.uid(),invitation.org_id) on conflict(user_id) do update set org_id=excluded.org_id,updated_at=now();
end $$;

-- Worker poczty (działa jako postgres, bez firmy w kontekście): blokada i rola sprawdzane w firmie powiadomienia.
create or replace function public.prepare_notification_emails(p_allowed text[]) returns integer
language plpgsql security definer set search_path='' as $$declare u record;old_sub text;added integer:=0;n integer;begin
 perform public.assert_email_worker();if coalesce(cardinality(p_allowed),0) not between 1 and 100 then raise exception 'Explicit recipients required' using errcode='22023';end if;
 old_sub:=current_setting('request.jwt.claim.sub',true);
 for u in select p.user_id,p.enabled_at,a.email from public.notification_email_preferences p join auth.users a on a.id=p.user_id where p.enabled and p.next_scan_at<=now() and a.email_confirmed_at is not null and lower(a.email)=any(p_allowed)
  and exists(select 1 from public.org_members s where s.user_id=p.user_id and s.role in('admin','office','technician') and public.account_enabled_in(p.user_id,s.org_id)) order by p.next_scan_at,p.user_id limit 20 loop
  if not pg_try_advisory_xact_lock(hashtextextended('notifications:'||u.user_id::text,0)) then continue;end if;
  perform set_config('request.jwt.claim.sub',u.user_id::text,true);perform public.sync_my_notifications();
  insert into public.notification_email_queue(org_id,notification_id,user_id,recipient,category)
  select n.org_id,n.id,u.user_id,u.email,n.category from public.app_notifications n join public.notification_sources() s on s.source_id=n.source_id and s.category=n.category and s.event_key=n.event_key where n.user_id=u.user_id and n.created_at>=u.enabled_at and n.read_at is null and s.active and public.account_enabled_in(u.user_id,n.org_id) and (public.my_notification_preferences()->>n.category)::boolean and not exists(select 1 from public.notification_email_queue q where q.notification_id=n.id) order by n.created_at,n.id limit 200 on conflict(notification_id) do nothing;
  get diagnostics n=row_count;added:=added+n;update public.notification_email_preferences set next_scan_at=now()+interval '1 minute' where user_id=u.user_id;
 end loop;
 perform set_config('request.jwt.claim.sub',coalesce(old_sub,''),true);return added;
end;$$;

create or replace function public.email_job_eligible(p_id uuid) returns boolean
language plpgsql stable security definer set search_path='' as $$declare q public.notification_email_queue%rowtype;old_sub text;result boolean;begin
 select * into q from public.notification_email_queue where id=p_id;if not found then return false;end if;
 if not public.account_enabled_in(q.user_id,q.org_id) or not exists(select 1 from public.org_members where user_id=q.user_id and org_id=q.org_id and role in('admin','office','technician')) or not exists(select 1 from auth.users where id=q.user_id and email_confirmed_at is not null and lower(email)=lower(q.recipient)) or not exists(select 1 from public.notification_email_preferences where user_id=q.user_id and enabled) then return false;end if;
 old_sub:=current_setting('request.jwt.claim.sub',true);perform set_config('request.jwt.claim.sub',q.user_id::text,true);
 select exists(select 1 from public.app_notifications n join public.notification_sources() s on s.source_id=n.source_id and s.category=n.category and s.event_key=n.event_key where n.id=q.notification_id and n.user_id=q.user_id and s.active and not (n.read_at is not null) and (public.my_notification_preferences()->>n.category)::boolean) into result;
 perform set_config('request.jwt.claim.sub',coalesce(old_sub,''),true);return result;
end;$$;
