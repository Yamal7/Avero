-- M0.1 Wielofirmowość (KRA-27), krok 3: funkcje RPC działają jako avero_rpc (bez BYPASSRLS), więc polityka
-- org_isolation filtruje każdą tabelę także wewnątrz security definer — bez przepisywania ~200 funkcji.
-- Helpery ról (is_staff, can_manage_crm, is_admin, stock_is_staff, current_access…) czytają widok staff_users,
-- który przez org_isolation na org_members pokazuje członków aktywnej firmy — rola pochodzi więc z org_members.
--
-- Zostają jako postgres (lista w 044_org_guard.sql, opis w docs/STATUS.md):
--  current_org_id, org_default, my_organizations, set_active_org, account_enabled — muszą widzieć członkostwa
--  i blokady we wszystkich firmach osoby;
--  worker poczty (service_role, bez użytkownika): prepare_/claim_/bind_/finish_notification_email,
--  notification_email_checks, finish_notification_email_check, assert_email_worker, email_job_eligible —
--  podszywają się pod odbiorcę (request.jwt.claim.sub), a funkcje, które wołają, filtrują już po jego firmie;
--  accept_access_invitation, read_my_invitation — osoba zaproszona nie należy jeszcze do firmy zaproszenia;
--  funkcje wyzwalaczy (returns trigger) — działają na wierszu, który przeszedł już przez politykę.
-- Nowa funkcja security definer w kolejnych migracjach: dopisz `alter function … owner to avero_rpc;`
-- (test 044 nie przepuści funkcji z innym właścicielem).
do $$
declare f regprocedure;
begin
 for f in
  select p.oid::regprocedure from pg_proc p
  where p.pronamespace='public'::regnamespace and p.prosecdef and p.prorettype<>'trigger'::regtype
  and p.proname not in ('current_org_id','org_default','my_organizations','set_active_org','account_enabled',
   'accept_access_invitation','read_my_invitation',
   'prepare_notification_emails','claim_notification_email','bind_notification_email','finish_notification_email',
   'notification_email_checks','finish_notification_email_check','assert_email_worker','email_job_eligible')
 loop
  execute format('alter function %s owner to avero_rpc',f);
 end loop;
end $$;

-- Blokada konta działa w aktywnej firmie. Bez kontekstu firmy (worker, osoba bez członkostwa) — blokada w dowolnej
-- firmie wystarcza, żeby uznać konto za zablokowane (bezpieczniej niż odwrotnie).
create or replace function public.account_enabled(p_user uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select p_user is not null and not exists(select 1 from public.account_access a
  where a.user_id=p_user and a.blocked and (a.org_id=public.current_org_id() or public.current_org_id() is null));
$$;
grant execute on function public.account_enabled(uuid) to avero_rpc;

-- Funkcje pomocnicze i walidatory (security invoker, często bez EXECUTE dla public) wołane z RPC.
grant execute on all functions in schema public to avero_rpc;
alter default privileges for role postgres in schema public grant execute on functions to avero_rpc;

-- auth.users ma włączone RLS bez polityk, a w Supabase nie dodajemy polityk do schematu auth. RPC czytają konta
-- przez ten widok (właściciel postgres, bez security_invoker), dostępny wyłącznie dla avero_rpc. Konta nie należą
-- do firmy; RPC, które je wypisują, same zawężają listę do osób związanych z aktywną firmą (list_access_users).
create view public.auth_user_directory as
 select u.id, u.email, u.email_confirmed_at, u.created_at, u.last_sign_in_at, u.raw_user_meta_data from auth.users u;
comment on view public.auth_user_directory is 'Konta (auth.users) dla funkcji RPC działających jako avero_rpc (M0.1).';
revoke all on public.auth_user_directory from public, anon, authenticated, service_role;
grant select on public.auth_user_directory to avero_rpc;

-- Przepisanie odwołań auth.users → public.auth_user_directory w funkcjach avero_rpc (treść bez innych zmian).
do $$
declare f record; def text;
begin
 for f in select p.oid from pg_proc p where p.pronamespace='public'::regnamespace and p.prosrc like '%auth.users%'
  and pg_get_userbyid(p.proowner)='avero_rpc'
 loop
  def:=replace(pg_get_functiondef(f.oid),'auth.users','public.auth_user_directory');
  execute def;
 end loop;
end $$;
