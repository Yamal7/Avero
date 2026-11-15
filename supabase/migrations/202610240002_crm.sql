-- Search executes with the caller's permissions: existing RLS applies to every table.
create function public.search_customers(search_text text default '', show_archived boolean default false)
returns setof public.customers language sql stable security invoker set search_path = '' as $$
  select c.* from public.customers c
  where (c.archived_at is not null) = show_archived
    and (
      coalesce(trim(search_text), '') = ''
      or strpos(lower(concat_ws(' ', c.name, c.email, c.phone)), lower(trim(search_text))) > 0
      or exists (
        select 1 from public.locations l
        where l.customer_id = c.id and (
          strpos(lower(concat_ws(' ', l.address, l.city, l.postal_code)), lower(trim(search_text))) > 0
          or exists (
            select 1 from public.installations i
            left join public.devices d on d.installation_id = i.id
            where i.location_id = l.id
              and strpos(lower(concat_ws(' ', i.type, d.manufacturer, d.model, d.serial_number)), lower(trim(search_text))) > 0
          )
        )
      )
    )
  order by c.created_at desc, c.id;
$$;
revoke all on function public.search_customers(text, boolean) from public;
grant execute on function public.search_customers(text, boolean) to authenticated;

-- Audit business writes in the same transaction; clients cannot write the audit table.
create function public.audit_crm_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_logs(actor_id, table_name, row_id, action, old_data, new_data)
  values (auth.uid(), tg_table_name, new.id, tg_op,
    case when tg_op = 'UPDATE' then to_jsonb(old) else null end, to_jsonb(new));
  return new;
end;
$$;
revoke all on function public.audit_crm_change() from public;
create trigger customers_audit after insert or update on public.customers for each row execute function public.audit_crm_change();
create trigger locations_audit after insert or update on public.locations for each row execute function public.audit_crm_change();
create trigger installations_audit after insert or update on public.installations for each row execute function public.audit_crm_change();
create trigger devices_audit after insert or update on public.devices for each row execute function public.audit_crm_change();
