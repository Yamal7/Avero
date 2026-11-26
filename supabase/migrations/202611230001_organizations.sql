-- M0.1 Wielofirmowość (KRA-27), krok 1: organizacje, członkostwa, aktywna firma, rola-właściciel RPC.
-- Cofnięcie: supabase/rollback/m0-1-organizations-down.sql (opis w docs/STATUS.md › M0.1).

-- Rola-właściciel funkcji RPC. Bez BYPASSRLS i bez członkostwa w postgres, więc polityki RLS działają także
-- wewnątrz funkcji security definer. Dziedziczy authenticated wyłącznie po to, by mieć USAGE na schematach auth
-- i storage (tych uprawnień postgres nie może przekazać dalej). Konta z auth.users czyta przez widok
-- public.auth_user_directory (krok 3), bo auth.users ma włączone RLS.
do $$ begin
 if not exists(select 1 from pg_roles where rolname='avero_rpc') then
  create role avero_rpc nologin inherit nobypassrls;
 end if;
end $$;
alter role avero_rpc nologin inherit nobypassrls;
grant avero_rpc to postgres;           -- postgres przenosi funkcje na avero_rpc i odtwarza je w kolejnych migracjach
grant authenticated to avero_rpc;
grant usage, create on schema public to avero_rpc;

create table public.organizations (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 1 and 160 and name=trim(name)),
 created_at timestamptz not null default now()
);
comment on table public.organizations is 'Firma (najemca). Każdy rekord danych należy do jednej organizacji przez org_id.';
alter table public.organizations enable row level security;
revoke all on public.organizations from public, anon, authenticated;

-- Wszystko, co istnieje przed M0.1, należy do firmy „Kranz HVACR”.
insert into public.organizations(id,name) values('0a000000-0000-4000-8000-000000000001','Kranz HVACR');

-- Aktywna firma osoby (przełącznik w ramie). Tylko wybór; uprawnienie wynika z członkostwa.
create table public.org_active (
 user_id uuid primary key references auth.users(id) on delete cascade,
 org_id uuid not null references public.organizations(id) on delete cascade,
 updated_at timestamptz not null default now()
);
alter table public.org_active enable row level security;
revoke all on public.org_active from public, anon, authenticated;

-- Członkostwa pracowników: dotychczasowa tabela staff_users staje się org_members (te same wiersze, ta sama rola),
-- z kluczem (org_id, user_id). Pod nazwą staff_users zostaje widok zgodności (poniżej).
alter table public.staff_users rename to org_members;
alter table public.org_members rename constraint staff_users_user_id_fkey to org_members_user_id_fkey;
alter table public.org_members rename constraint staff_users_role_check to org_members_role_check;
alter table public.org_members add column org_id uuid not null default '0a000000-0000-4000-8000-000000000001'
 constraint org_members_org_id_fkey references public.organizations(id);
alter table public.service_tickets drop constraint service_tickets_assigned_to_fkey;
alter table public.staff_customer_assignments drop constraint staff_customer_assignments_user_id_fkey;
alter table public.org_members drop constraint staff_users_pkey;
alter table public.org_members add constraint org_members_pkey primary key(org_id,user_id);
create index org_members_user_idx on public.org_members(user_id);
comment on table public.org_members is 'Członkostwo pracownika w firmie z rolą admin | office | technician (dawniej staff_users).';

-- Zgodność wstecz: funkcje i testy sprzed M0.1 czytają staff_users. Widok pokazuje członków firmy, którą przepuszcza
-- polityka org_isolation na org_members (w RPC: aktywna firma). Wstawianie przez widok bierze domyślne org_id.
create view public.staff_users with (security_invoker=true) as
 select m.user_id, m.created_at, m.role from public.org_members m;
comment on view public.staff_users is 'Widok zgodności (M0.1): członkowie aktywnej firmy. Nowy kod używa org_members.';
revoke all on public.staff_users from public, anon, authenticated;
grant select, insert, update, delete on public.staff_users to service_role;

