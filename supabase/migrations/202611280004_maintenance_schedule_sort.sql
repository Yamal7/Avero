-- M0.4 Silnik widoku kolekcji (KRA-31): Przeglądy — sortowanie po stronie serwera (p_sort: due | customer | title).
-- Archiwalne i wstrzymane plany zostają na końcu jak dotąd; due = dotychczasowa kolejność. Dostęp, widoki, pola
-- i rozmiar strony (20) bez zmian. Stara wersja (4 parametry) usunięta — wywołania bez argumentów działają dalej.
drop function public.maintenance_schedule(text,text,integer,uuid);
create function public.maintenance_schedule(p_search text default '',p_view text default 'attention',p_page integer default 1,p_installation uuid default null,p_sort text default 'due') returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare today date:=(now() at time zone 'Europe/Warsaw')::date; result jsonb;
begin
 if not public.is_staff() then raise exception 'Maintenance access denied' using errcode='42501'; end if;
 if p_search is null or length(p_search)>200 or p_view is null or p_view not in ('attention','overdue','upcoming','all','paused') or p_page is null or p_page not between 1 and 100000
  or p_sort is null or p_sort not in ('due','customer','title') then raise exception 'Invalid maintenance filter' using errcode='22023'; end if;
 if p_installation is not null and not public.can_read_internal_customer(public.customer_for_installation(p_installation)) then raise exception 'Installation unavailable' using errcode='42501'; end if;
 with base as (
 select m.id,m.installation_id,l.customer_id,m.title,m.interval_months,m.next_due_on,m.active,m.version,c.name as customer_name,i.type as installation_type,l.address,l.city,
 (c.archived_at is null and i.status<>'archived') as parent_active,
 case when c.archived_at is not null or i.status='archived' then 'archived' when not m.active then 'paused' when m.next_due_on<today then 'overdue' when m.next_due_on<=today+30 then 'upcoming' else 'later' end as state
 from public.maintenance_plans m join public.installations i on i.id=m.installation_id join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where public.can_read_internal_customer(c.id) and (p_installation is null or m.installation_id=p_installation)
 and (trim(p_search)='' or strpos(lower(concat_ws(' ',m.title,c.name,i.type,l.address,l.city)),lower(trim(p_search)))>0)
 ), filtered as (select * from base where p_view='all' or (p_view='attention' and state in ('overdue','upcoming')) or (p_view='overdue' and state='overdue') or (p_view='upcoming' and state='upcoming') or (p_view='paused' and state='paused'))
 select jsonb_build_object('today',today,'total',(select count(*) from filtered),
 'summary',jsonb_build_object('overdue',(select count(*) from base where state='overdue'),'upcoming',(select count(*) from base where state='upcoming'),'active',(select count(*) from base where active and parent_active),'paused',(select count(*) from base where state='paused')),
 'plans',coalesce((select jsonb_agg(to_jsonb(rows)) from (select * from filtered order by (state='archived'),(state='paused'),
   case when p_sort='customer' then lower(customer_name) end,
   case when p_sort='title' then lower(title) end,
   next_due_on,id limit 20 offset(p_page-1)*20) rows),'[]')) into result;
 return result;
end $$;
alter function public.maintenance_schedule(text,text,integer,uuid,text) owner to avero_rpc;
revoke all on function public.maintenance_schedule(text,text,integer,uuid,text) from public,anon;
grant execute on function public.maintenance_schedule(text,text,integer,uuid,text) to authenticated;
