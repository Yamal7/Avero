-- Existing employees retain CRM access. Administration requires explicit bootstrap.
alter table public.staff_users add column role text not null default 'office' check(role in ('admin','office','technician'));
create table public.account_access (
 user_id uuid primary key references auth.users(id) on delete cascade,
 blocked boolean not null default false
);
create table public.staff_customer_assignments (
 user_id uuid not null references public.staff_users(user_id) on delete cascade,
 customer_id uuid not null references public.customers(id) on delete cascade,
 primary key(user_id,customer_id)
);
create table public.access_audit_logs (
 id bigint generated always as identity primary key,
 actor_id uuid, target_user_id uuid, action text not null,
 old_data jsonb, new_data jsonb, happened_at timestamptz not null default now()
);
create table public.access_invitations (
 id uuid primary key default gen_random_uuid(), email text not null,
 role text not null check(role in ('admin','office','technician','client')),
 customer_id uuid references public.customers(id),
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 expires_at timestamptz not null default(now()+interval '7 days'),
 status text not null default 'pending' check(status in ('pending','accepted','revoked')),
 accepted_by uuid references auth.users(id),
 delivery_status text not null default 'prepared' check(delivery_status in ('prepared','sending','sent','failed')),
 last_attempt_at timestamptz,
 check(role <> 'client' or customer_id is not null)
);
create index invitations_email_idx on public.access_invitations(email,status);
create index assignments_customer_idx on public.staff_customer_assignments(customer_id);
alter table public.account_access enable row level security;
alter table public.staff_customer_assignments enable row level security;
alter table public.access_audit_logs enable row level security;
alter table public.access_invitations enable row level security;
revoke all on public.account_access,public.staff_customer_assignments,public.access_audit_logs,public.access_invitations from anon,authenticated;

create function public.account_enabled(p_user uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select p_user is not null and not exists(select 1 from public.account_access where user_id=p_user and blocked);
$$;
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path='' as $$
 select public.account_enabled(auth.uid()) and exists(select 1 from public.staff_users where user_id=auth.uid());
$$;
create function public.can_manage_crm() returns boolean
language sql stable security definer set search_path='' as $$
 select public.account_enabled(auth.uid()) and exists(select 1 from public.staff_users where user_id=auth.uid() and role in ('admin','office'));
$$;
create function public.is_admin() returns boolean
language sql stable security definer set search_path='' as $$
 select public.account_enabled(auth.uid()) and exists(select 1 from public.staff_users where user_id=auth.uid() and role='admin');
$$;
create function public.can_read_internal_customer(p_customer uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select public.can_manage_crm() or (public.account_enabled(auth.uid()) and exists(
 select 1 from public.staff_customer_assignments a join public.staff_users s on s.user_id=a.user_id
 where a.user_id=auth.uid() and s.role='technician' and a.customer_id=p_customer));
$$;
create or replace function public.can_access_customer(p_customer uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select public.account_enabled(auth.uid()) and (public.can_read_internal_customer(p_customer) or exists(
 select 1 from public.customer_memberships where user_id=auth.uid() and customer_id=p_customer));
$$;
create function public.current_access() returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('blocked',not public.account_enabled(auth.uid()),'role',
 coalesce((select role from public.staff_users where user_id=auth.uid()),
 case when exists(select 1 from public.customer_memberships where user_id=auth.uid()) then 'client' else 'none' end));
$$;

-- Replace global employee write permissions with the narrower CRM permission.
do $$
declare p record; q text; c text; statement text;
begin
 for p in select pol.polname, cls.relname, ns.nspname, pg_get_expr(pol.polqual,pol.polrelid) as qual,
 pg_get_expr(pol.polwithcheck,pol.polrelid) as checks from pg_policy pol
 join pg_class cls on cls.oid=pol.polrelid join pg_namespace ns on ns.oid=cls.relnamespace
 where ns.nspname in ('public','storage') and (pol.polname like '%staff%' or pol.polname='tickets_insert') loop
  q:=replace(p.qual,'is_staff()','can_manage_crm()'); c:=replace(p.checks,'is_staff()','can_manage_crm()');
  statement:=format('alter policy %I on %I.%I',p.polname,p.nspname,p.relname);
  if q is not null then statement:=statement||' using ('||q||')'; end if;
  if c is not null then statement:=statement||' with check ('||c||')'; end if;
  execute statement;
 end loop;
end $$;
alter policy documents_read on public.documents using (
 public.can_read_internal_customer(public.customer_for_installation(installation_id))
 or (visible_to_customer and public.can_access_customer(public.customer_for_installation(installation_id))));
alter policy hvac_files_read on storage.objects using (bucket_id='hvac-documents' and exists(
 select 1 from public.documents d where d.storage_path=name and (
 public.can_read_internal_customer(public.customer_for_installation(d.installation_id))
 or (d.visible_to_customer and public.can_access_customer(public.customer_for_installation(d.installation_id))))));
-- Import RPCs must enforce the same permission even when called outside the UI.
do $$
declare f record;
begin
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname in ('preview_customer_import','commit_customer_import','discard_customer_import') loop
 execute replace(pg_get_functiondef(f.oid),'public.is_staff()','public.can_manage_crm()');
 end loop;
end $$;

create function public.audit_access_change() returns trigger
language plpgsql security definer set search_path='' as $$
declare before_data jsonb; after_data jsonb; target uuid;
begin
 if tg_op <> 'INSERT' then before_data:=to_jsonb(old); end if;
 if tg_op <> 'DELETE' then after_data:=to_jsonb(new); end if;
 target:=coalesce((after_data->>'user_id')::uuid,(before_data->>'user_id')::uuid,(after_data->>'accepted_by')::uuid);
 insert into public.access_audit_logs(actor_id,target_user_id,action,old_data,new_data)
 values(auth.uid(),target,tg_table_name||':'||tg_op,before_data,after_data);
 if tg_op='DELETE' then return old; end if; return new;
end $$;
create trigger staff_access_audit after insert or update or delete on public.staff_users for each row execute function public.audit_access_change();
create trigger account_access_audit after insert or update or delete on public.account_access for each row execute function public.audit_access_change();
create trigger memberships_access_audit after insert or update or delete on public.customer_memberships for each row execute function public.audit_access_change();
create trigger assignments_access_audit after insert or update or delete on public.staff_customer_assignments for each row execute function public.audit_access_change();
create trigger invitations_access_audit after insert or update or delete on public.access_invitations for each row execute function public.audit_access_change();

create function public.assert_access_admin() returns void
language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(682501004);
 if not public.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
end $$;
create function public.protect_last_admin(p_user uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.staff_users where user_id=p_user and role='admin') and public.account_enabled(p_user)
 and (select count(*) from public.staff_users where role='admin' and public.account_enabled(user_id))<=1
 then raise exception 'Cannot remove the last active administrator' using errcode='P0001'; end if;
end $$;

create function public.set_access_role(p_user uuid,p_role text) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.assert_access_admin();
 if p_role not in ('admin','office','technician','client') or p_role is null then raise exception 'Invalid role' using errcode='22023'; end if;
 if not exists(select 1 from auth.users where id=p_user) then raise exception 'User not found' using errcode='P0001'; end if;
 if p_role <> 'admin' then perform public.protect_last_admin(p_user); end if;
 if p_role='client' then delete from public.staff_users where user_id=p_user;
 else
 insert into public.staff_users(user_id,role) values(p_user,p_role) on conflict(user_id) do update set role=excluded.role;
 if p_role<>'technician' then delete from public.staff_customer_assignments where user_id=p_user; end if;
 end if;
 update public.access_invitations set status='revoked' where status='pending' and email=(select lower(email) from auth.users where id=p_user);
end $$;
create function public.set_access_blocked(p_user uuid,p_blocked boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.assert_access_admin();
 if p_blocked is null or not exists(select 1 from auth.users where id=p_user) then raise exception 'Invalid user' using errcode='22023'; end if;
 if p_blocked then perform public.protect_last_admin(p_user); end if;
 insert into public.account_access(user_id,blocked) values(p_user,p_blocked) on conflict(user_id) do update set blocked=excluded.blocked;
 if p_blocked then update public.access_invitations set status='revoked' where status='pending' and email=(select lower(email) from auth.users where id=p_user); end if;
end $$;
create function public.set_customer_access(p_user uuid,p_customer uuid,p_kind text,p_remove boolean default false) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.assert_access_admin();
 if p_kind not in ('member','technician') or p_kind is null or p_remove is null then raise exception 'Invalid assignment' using errcode='22023'; end if;
 if not exists(select 1 from auth.users where id=p_user) then raise exception 'User not found' using errcode='P0001'; end if;
 if not p_remove and not exists(select 1 from public.customers where id=p_customer and archived_at is null) then raise exception 'Active customer required' using errcode='P0001'; end if;
 if p_kind='technician' then
  if not exists(select 1 from public.staff_users where user_id=p_user and role='technician') then raise exception 'Technician role required' using errcode='P0001'; end if;
  if p_remove then delete from public.staff_customer_assignments where user_id=p_user and customer_id=p_customer;
  else insert into public.staff_customer_assignments(user_id,customer_id) values(p_user,p_customer) on conflict do nothing; end if;
 else
  if p_remove then delete from public.customer_memberships where user_id=p_user and customer_id=p_customer;
  else insert into public.customer_memberships(user_id,customer_id,role) values(p_user,p_customer,'viewer') on conflict do nothing; end if;
 end if;
 if p_remove then update public.access_invitations set status='revoked' where status='pending' and customer_id=p_customer and email=(select lower(email) from auth.users where id=p_user); end if;
end $$;

create function public.list_access_users(p_search text default '',p_page integer default 1) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb; total integer;
begin
 perform public.assert_access_admin();
 if p_page<1 or p_page>100000 or length(p_search)>200 then raise exception 'Invalid page' using errcode='22023'; end if;
 select count(*) into total from auth.users where strpos(lower(coalesce(email,'')),lower(trim(p_search)))>0 or trim(p_search)='';
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (
 select u.id,u.email,u.email_confirmed_at,u.created_at,coalesce(s.role,'client') as role,not public.account_enabled(u.id) as blocked,
 coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'kind','member')) from public.customer_memberships m join public.customers c on c.id=m.customer_id where m.user_id=u.id),'[]') ||
 coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'kind','technician')) from public.staff_customer_assignments a join public.customers c on c.id=a.customer_id where a.user_id=u.id),'[]') as customers
 from auth.users u left join public.staff_users s on s.user_id=u.id
 where strpos(lower(coalesce(u.email,'')),lower(trim(p_search)))>0 or trim(p_search)=''
 order by u.created_at desc,u.id limit 25 offset (p_page-1)*25
 ) t;
 return jsonb_build_object('users',result,'total',total);
end $$;
create function public.list_access_activity() returns jsonb
language plpgsql security definer set search_path='' as $$
declare invitations jsonb; logs jsonb;
begin
 perform public.assert_access_admin();
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into invitations from (
 select i.id,i.email,i.role,i.status,i.delivery_status,i.created_at,i.expires_at,c.name as customer_name
 from public.access_invitations i left join public.customers c on c.id=i.customer_id order by i.created_at desc limit 50) t;
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into logs from (
 select l.id,l.action,l.happened_at,a.email as actor_email,coalesce(u.email,l.new_data->>'email',l.old_data->>'email') as target_email,
 l.old_data,l.new_data from public.access_audit_logs l left join auth.users a on a.id=l.actor_id left join auth.users u on u.id=l.target_user_id
 order by l.happened_at desc,l.id desc limit 50) t;
 return jsonb_build_object('invitations',invitations,'logs',logs);
end $$;

create function public.create_access_invitation(p_email text,p_role text,p_customer uuid default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare invitation_id uuid; target uuid;
begin
 perform public.assert_access_admin();
 p_email:=lower(trim(p_email));
 if p_email is null or length(p_email)>320 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 or p_role is null or p_role not in ('admin','office','technician','client') then raise exception 'Invalid invitation' using errcode='22023'; end if;
 if p_role='client' and p_customer is null then raise exception 'Customer required' using errcode='22023'; end if;
 if p_customer is not null and not exists(select 1 from public.customers where id=p_customer and archived_at is null) then raise exception 'Active customer required' using errcode='22023'; end if;
 if p_role in ('admin','office') and p_customer is not null then raise exception 'Unexpected customer' using errcode='22023'; end if;
 select id into target from auth.users where lower(email)=p_email;
 if target is not null and (not public.account_enabled(target) or exists(select 1 from public.staff_users where user_id=target)) then
 raise exception 'Use account settings for existing staff or blocked users' using errcode='P0001'; end if;
 if exists(select 1 from public.access_invitations where email=p_email and status='pending' and expires_at>now() and (role<>'client' or p_role<>'client' or customer_id=p_customer)) then
 raise exception 'Pending invitation exists' using errcode='P0001'; end if;
 insert into public.access_invitations(email,role,customer_id,created_by) values(p_email,p_role,p_customer,auth.uid()) returning id into invitation_id;
 return invitation_id;
end $$;
create function public.reserve_invitation_delivery(p_invitation uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare invitation public.access_invitations%rowtype;
begin
 perform public.assert_access_admin();
 select * into invitation from public.access_invitations where id=p_invitation for update;
 if not found or invitation.status<>'pending' or invitation.expires_at<now() or invitation.last_attempt_at>now()-interval '60 seconds' then
 raise exception 'Invitation unavailable or retry too soon' using errcode='P0001'; end if;
 update public.access_invitations set delivery_status='sending',last_attempt_at=now() where id=p_invitation;
 return jsonb_build_object('id',invitation.id,'email',invitation.email);
end $$;
create function public.finish_invitation_delivery(p_invitation uuid,p_sent boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.assert_access_admin();
 update public.access_invitations set delivery_status=case when p_sent then 'sent' else 'failed' end where id=p_invitation and status='pending';
end $$;
create function public.revoke_access_invitation(p_invitation uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform public.assert_access_admin();
 update public.access_invitations set status='revoked' where id=p_invitation and status='pending';
end $$;
create function public.read_my_invitation(p_invitation uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.account_enabled(auth.uid()) then raise exception 'Account unavailable' using errcode='42501'; end if;
 select jsonb_build_object('id',i.id,'email',i.email,'role',i.role,'status',i.status,'expired',i.expires_at<now(),'customer_name',c.name,'needs_password',coalesce(length(u.encrypted_password),0)=0) into result
 from public.access_invitations i join auth.users u on u.id=auth.uid() and lower(u.email)=i.email and u.email_confirmed_at is not null
 left join public.customers c on c.id=i.customer_id where i.id=p_invitation;
 if result is null then raise exception 'Invitation unavailable' using errcode='P0001'; end if;
 return result;
end $$;
create function public.accept_access_invitation(p_invitation uuid) returns void
language plpgsql security definer set search_path='' as $$
declare invitation public.access_invitations%rowtype; verified boolean;
begin
 perform pg_advisory_xact_lock(682501004);
 if not public.account_enabled(auth.uid()) then raise exception 'Account unavailable' using errcode='42501'; end if;
 select * into invitation from public.access_invitations where id=p_invitation for update;
 if not found then raise exception 'Invitation unavailable' using errcode='P0001'; end if;
 select exists(select 1 from auth.users where id=auth.uid() and lower(email)=invitation.email and email_confirmed_at is not null) into verified;
 if not verified then raise exception 'Verified invitation email required' using errcode='42501'; end if;
 if invitation.status='accepted' and invitation.accepted_by=auth.uid() then return; end if;
 if invitation.status<>'pending' or invitation.expires_at<now() or not public.account_enabled(invitation.created_by)
 or not exists(select 1 from public.staff_users where user_id=invitation.created_by and role='admin') then
 raise exception 'Invitation unavailable' using errcode='P0001'; end if;
 if invitation.customer_id is not null and not exists(select 1 from public.customers where id=invitation.customer_id and archived_at is null) then raise exception 'Customer unavailable' using errcode='P0001'; end if;
 if invitation.role='client' then
 insert into public.customer_memberships(user_id,customer_id,role) values(auth.uid(),invitation.customer_id,'viewer') on conflict do nothing;
 else
 if exists(select 1 from public.staff_users where user_id=auth.uid()) then raise exception 'Use administrator for staff changes' using errcode='P0001'; end if;
 insert into public.staff_users(user_id,role) values(auth.uid(),invitation.role);
 if invitation.role='technician' and invitation.customer_id is not null then insert into public.staff_customer_assignments(user_id,customer_id) values(auth.uid(),invitation.customer_id); end if;
 end if;
 update public.access_invitations set status='accepted',accepted_by=auth.uid() where id=p_invitation;
end $$;

-- Every new definer function has an explicit grant; internal helpers stay private.
do $$
declare f record;
begin
 for f in select p.oid,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in (
 'account_enabled','can_manage_crm','is_admin','can_read_internal_customer','current_access','audit_access_change','assert_access_admin','protect_last_admin',
 'set_access_role','set_access_blocked','set_customer_access','list_access_users','list_access_activity','create_access_invitation','reserve_invitation_delivery',
 'finish_invitation_delivery','revoke_access_invitation','read_my_invitation','accept_access_invitation') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);
 if f.proname not in ('account_enabled','audit_access_change','assert_access_admin','protect_last_admin') then
 execute format('grant execute on function %s to authenticated',f.oid::regprocedure); end if;
 end loop;
end $$;
