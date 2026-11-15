-- Supabase/PostgreSQL. Apply only through versioned migrations.
create extension if not exists pgcrypto;

create type public.customer_kind as enum ('individual','company');
create type public.installation_state as enum ('active','inactive','archived');
create type public.ticket_state as enum ('new','in_progress','waiting','closed');
create type public.ticket_priority as enum ('low','normal','high');
create type public.membership_role as enum ('owner','viewer');

create table public.staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 200),
  email text, phone text,
  type public.customer_kind not null default 'individual',
  created_at timestamptz not null default now(),
  archived_at timestamptz
);
create table public.customer_memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  role public.membership_role not null default 'viewer',
  primary key (user_id, customer_id)
);
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  address text not null, city text not null, postal_code text,
  created_at timestamptz not null default now(),
  unique(id, customer_id)
);
create table public.installations (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id),
  type text not null,
  installed_on date,
  status public.installation_state not null default 'active',
  created_at timestamptz not null default now()
);
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null references public.installations(id),
  manufacturer text not null, model text,
  serial_number text, warranty_until date,
  created_at timestamptz not null default now()
);
create table public.service_tickets (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null references public.installations(id),
  customer_id uuid not null references public.customers(id),
  description text not null check(length(trim(description)) between 1 and 10000),
  status public.ticket_state not null default 'new',
  priority public.ticket_priority not null default 'normal',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.service_visits (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.service_tickets(id),
  scheduled_at timestamptz, completed_at timestamptz, notes text,
  created_at timestamptz not null default now()
);
create table public.maintenance_plans (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null references public.installations(id),
  interval_months int not null check(interval_months between 1 and 120),
  next_due_on date not null, active boolean not null default true
);
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null references public.installations(id),
  storage_path text not null unique,
  file_name text not null,
  document_type text not null,
  visible_to_customer boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.sales_inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  message text not null,
  status text not null default 'new' check(status in ('new','contacted','quoted','closed')),
  created_at timestamptz not null default now()
);
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid, table_name text not null, row_id uuid not null,
  action text not null, happened_at timestamptz not null default now(),
  old_data jsonb, new_data jsonb
);
create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  maintenance_plan_id uuid references public.maintenance_plans(id),
  due_on date not null, channel text not null,
  status text not null check(status in ('pending','sent','failed')),
  created_at timestamptz not null default now(),
  unique(maintenance_plan_id, due_on, channel)
);

create index locations_customer_idx on public.locations(customer_id);
create index installations_location_idx on public.installations(location_id);
create index devices_installation_idx on public.devices(installation_id);
create index tickets_customer_status_idx on public.service_tickets(customer_id,status);
create index tickets_installation_idx on public.service_tickets(installation_id);
create index memberships_customer_idx on public.customer_memberships(customer_id);
create index visits_ticket_idx on public.service_visits(ticket_id);
create index maintenance_due_idx on public.maintenance_plans(next_due_on) where active;
create index documents_installation_idx on public.documents(installation_id);
create index inquiries_customer_idx on public.sales_inquiries(customer_id);

-- SECURITY DEFINER functions avoid recursive membership RLS and are fixed to public schema.
create function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff_users s where s.user_id = (select auth.uid()));
$$;
create function public.can_access_customer(p_customer uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select (select public.is_staff()) or exists (
    select 1 from public.customer_memberships m
    where m.user_id = (select auth.uid()) and m.customer_id = p_customer
  );
$$;
create function public.customer_for_installation(p_installation uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select l.customer_id from public.installations i
  join public.locations l on l.id = i.location_id
  where i.id = p_installation;
$$;
create function public.customer_for_ticket(p_ticket uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select t.customer_id from public.service_tickets t where t.id = p_ticket;
$$;
revoke all on function public.is_staff() from public;
revoke all on function public.can_access_customer(uuid) from public;
revoke all on function public.customer_for_installation(uuid) from public;
revoke all on function public.customer_for_ticket(uuid) from public;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.can_access_customer(uuid) to authenticated;
grant execute on function public.customer_for_installation(uuid) to authenticated;
grant execute on function public.customer_for_ticket(uuid) to authenticated;

-- Reject ticket/customer mismatch regardless of which role performs the write.
create function public.validate_ticket_installation() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.customer_id is distinct from public.customer_for_installation(new.installation_id) then
    raise exception 'Ticket installation belongs to another customer';
  end if;
  return new;
end $$;
create trigger ticket_customer_integrity before insert or update of installation_id,customer_id
on public.service_tickets for each row execute function public.validate_ticket_installation();

-- No direct client access to staff, memberships, audit, or notification internals.
revoke all on public.staff_users, public.customer_memberships, public.audit_logs, public.notification_logs from anon, authenticated;
-- Access to business tables is mediated by RLS below.
grant select,insert,update,delete on public.customers,public.locations,public.installations,public.devices,
 public.service_tickets,public.service_visits,public.maintenance_plans,public.documents,public.sales_inquiries to authenticated;

alter table public.staff_users enable row level security;
alter table public.customer_memberships enable row level security;
alter table public.customers enable row level security;
alter table public.locations enable row level security;
alter table public.installations enable row level security;
alter table public.devices enable row level security;
alter table public.service_tickets enable row level security;
alter table public.service_visits enable row level security;
alter table public.maintenance_plans enable row level security;
alter table public.documents enable row level security;
alter table public.sales_inquiries enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notification_logs enable row level security;

create policy customers_read on public.customers for select to authenticated
 using (public.can_access_customer(id));
create policy customers_staff_insert on public.customers for insert to authenticated
 with check (public.is_staff());
create policy customers_staff_update on public.customers for update to authenticated
 using (public.is_staff()) with check (public.is_staff());

create policy locations_read on public.locations for select to authenticated
 using (public.can_access_customer(customer_id));
create policy locations_staff_insert on public.locations for insert to authenticated
 with check (public.is_staff());
create policy locations_staff_update on public.locations for update to authenticated
 using (public.is_staff()) with check (public.is_staff());

create policy installations_read on public.installations for select to authenticated
 using (public.can_access_customer((select l.customer_id from public.locations l where l.id = location_id)));
create policy installations_staff_insert on public.installations for insert to authenticated
 with check (public.is_staff());
create policy installations_staff_update on public.installations for update to authenticated
 using (public.is_staff()) with check (public.is_staff());

create policy devices_read on public.devices for select to authenticated
 using (public.can_access_customer(public.customer_for_installation(installation_id)));
create policy devices_staff_insert on public.devices for insert to authenticated
 with check (public.is_staff());
create policy devices_staff_update on public.devices for update to authenticated
 using (public.is_staff()) with check (public.is_staff());

create policy tickets_read on public.service_tickets for select to authenticated
 using (public.can_access_customer(customer_id));
create policy tickets_insert on public.service_tickets for insert to authenticated
 with check (public.can_access_customer(customer_id)
   and (public.is_staff() or (created_by = (select auth.uid()) and status = 'new' and priority = 'normal')));
create policy tickets_staff_update on public.service_tickets for update to authenticated
 using (public.is_staff()) with check (public.is_staff());

create policy visits_read on public.service_visits for select to authenticated
 using (public.can_access_customer(public.customer_for_ticket(ticket_id)));
create policy visits_staff_insert on public.service_visits for insert to authenticated
 with check (public.is_staff());
create policy visits_staff_update on public.service_visits for update to authenticated
 using (public.is_staff()) with check (public.is_staff());

create policy maintenance_read on public.maintenance_plans for select to authenticated
 using (public.can_access_customer(public.customer_for_installation(installation_id)));
create policy maintenance_staff_insert on public.maintenance_plans for insert to authenticated
 with check (public.is_staff());
create policy maintenance_staff_update on public.maintenance_plans for update to authenticated
 using (public.is_staff()) with check (public.is_staff());

create policy documents_read on public.documents for select to authenticated
 using (public.is_staff() or (visible_to_customer and public.can_access_customer(public.customer_for_installation(installation_id))));
create policy documents_staff_insert on public.documents for insert to authenticated
 with check (public.is_staff());
create policy documents_staff_update on public.documents for update to authenticated
 using (public.is_staff()) with check (public.is_staff());

create policy inquiries_read on public.sales_inquiries for select to authenticated
 using (public.can_access_customer(customer_id));
create policy inquiries_insert on public.sales_inquiries for insert to authenticated
 with check (public.can_access_customer(customer_id) and status = 'new');
create policy inquiries_staff_update on public.sales_inquiries for update to authenticated
 using (public.is_staff()) with check (public.is_staff());

-- Private object bucket. Object key = installation_uuid/document_uuid/filename.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('hvac-documents','hvac-documents',false,10485760,
 array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;

create policy hvac_files_read on storage.objects for select to authenticated
using (bucket_id = 'hvac-documents' and exists (
 select 1 from public.documents d
 where d.storage_path = name
 and (public.is_staff() or (d.visible_to_customer
 and public.can_access_customer(public.customer_for_installation(d.installation_id))))
));
create policy hvac_files_staff_insert on storage.objects for insert to authenticated
with check (bucket_id = 'hvac-documents' and public.is_staff());
create policy hvac_files_staff_update on storage.objects for update to authenticated
using (bucket_id = 'hvac-documents' and public.is_staff())
with check (bucket_id = 'hvac-documents' and public.is_staff());
create policy hvac_files_staff_delete on storage.objects for delete to authenticated
using (bucket_id = 'hvac-documents' and public.is_staff());

-- Note: staff_users is intentionally provisioned only via privileged SQL/admin process.
-- Do not expose a client endpoint to insert staff_users or customer_memberships.
