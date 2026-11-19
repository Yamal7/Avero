-- Zlecenie (design: ZS-1047): structured measurements, materials and an internal comment thread per service ticket.
-- Staff only: office or the technician who may edit the ticket. Clients never see these rows.
create table public.service_measurements(
  id uuid primary key,
  ticket_id uuid not null references public.service_tickets on delete cascade,
  position integer not null default 0,
  parameter text not null check(length(parameter) between 1 and 120),
  norm text not null default '' check(length(norm)<=80),
  before_value text not null default '' check(length(before_value)<=80),
  after_value text not null default '' check(length(after_value)<=80),
  out_of_norm boolean not null default false,
  updated_by uuid references auth.users,
  updated_at timestamptz not null default now()
);
create index service_measurements_ticket on public.service_measurements(ticket_id,position,id);

create table public.service_materials(
  id uuid primary key,
  ticket_id uuid not null references public.service_tickets on delete cascade,
  name text not null check(length(name) between 1 and 160),
  quantity numeric(12,3) not null check(quantity>0 and quantity<=100000),
  unit text not null default 'szt.' check(length(unit) between 1 and 12),
  document text not null default '' check(length(document)<=40),
  source text not null default '' check(length(source)<=80),
  net_cents bigint not null default 0 check(net_cents between 0 and 99999999999),
  created_by uuid references auth.users,
  created_at timestamptz not null default now()
);
create index service_materials_ticket on public.service_materials(ticket_id,created_at,id);

create table public.service_ticket_comments(
  id uuid primary key,
  ticket_id uuid not null references public.service_tickets on delete cascade,
  author_id uuid not null references auth.users,
  body text not null check(length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index service_ticket_comments_ticket on public.service_ticket_comments(ticket_id,created_at,id);

alter table public.service_measurements enable row level security;
alter table public.service_materials enable row level security;
alter table public.service_ticket_comments enable row level security;
revoke all on public.service_measurements,public.service_materials,public.service_ticket_comments from public,anon,authenticated;

create function public.service_job_text(v text,lim integer,required boolean default false) returns boolean language sql immutable set search_path='' as $$
 select v is not null and length(v)<=lim and v=trim(v) and v!~'[[:cntrl:]]' and (not required or length(v)>0)
$$;

create function public.service_job_assert(p_ticket uuid,p_write boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_ticket is null or not public.can_edit_service_ticket(p_ticket) then raise exception 'Ticket unavailable' using errcode='42501';end if;
 if p_write then
  perform public.service_write_lock();
  if exists(select 1 from public.service_tickets where id=p_ticket and status='closed') then raise exception 'Ticket closed' using errcode='40001';end if;
 end if;
end;$$;

create function public.service_job_details(p_ticket uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 perform public.service_job_assert(p_ticket,false);
 return jsonb_build_object(
  'measurements',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'parameter',m.parameter,'norm',m.norm,'before',m.before_value,'after',m.after_value,'outOfNorm',m.out_of_norm,'updatedAt',m.updated_at) order by m.position,m.id) from public.service_measurements m where m.ticket_id=p_ticket),'[]'),
  'materials',coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'name',x.name,'quantity',x.quantity,'unit',x.unit,'document',x.document,'source',x.source,'netCents',x.net_cents,'createdAt',x.created_at) order by x.created_at,x.id) from public.service_materials x where x.ticket_id=p_ticket),'[]'),
  'comments',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'authorId',c.author_id,'authorLabel',coalesce(public.crm_staff_label(c.author_id),'Niedostępny użytkownik'),'body',c.body,'createdAt',c.created_at) order by c.created_at,c.id) from(select * from public.service_ticket_comments where ticket_id=p_ticket order by created_at desc,id desc limit 200) c),'[]'));
end;$$;

create function public.save_service_measurement(p_ticket uuid,p_id uuid,p_parameter text,p_norm text,p_before text,p_after text,p_out_of_norm boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare old_ticket uuid;begin
 perform public.service_job_assert(p_ticket,true);
 if p_id is null or not public.service_job_text(p_parameter,120,true) or not public.service_job_text(p_norm,80) or not public.service_job_text(p_before,80) or not public.service_job_text(p_after,80) or p_out_of_norm is null then raise exception 'Invalid measurement' using errcode='22023';end if;
 select ticket_id into old_ticket from public.service_measurements where id=p_id;
 if old_ticket is not null and old_ticket<>p_ticket then raise exception 'Foreign measurement' using errcode='42501';end if;
 if old_ticket is null and (select count(*) from public.service_measurements where ticket_id=p_ticket)>=40 then raise exception 'Too many measurements' using errcode='22023';end if;
 insert into public.service_measurements(id,ticket_id,position,parameter,norm,before_value,after_value,out_of_norm,updated_by)
 values(p_id,p_ticket,coalesce((select max(position)+1 from public.service_measurements where ticket_id=p_ticket),0),p_parameter,p_norm,p_before,p_after,p_out_of_norm,auth.uid())
 on conflict(id) do update set parameter=excluded.parameter,norm=excluded.norm,before_value=excluded.before_value,after_value=excluded.after_value,out_of_norm=excluded.out_of_norm,updated_by=auth.uid(),updated_at=now();
 return public.service_job_details(p_ticket);
end;$$;

create function public.delete_service_measurement(p_ticket uuid,p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform public.service_job_assert(p_ticket,true);
 delete from public.service_measurements where id=p_id and ticket_id=p_ticket;
 return public.service_job_details(p_ticket);
end;$$;

create function public.save_service_material(p_ticket uuid,p_id uuid,p_name text,p_quantity numeric,p_unit text,p_document text,p_source text,p_net_cents bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare old_ticket uuid;begin
 perform public.service_job_assert(p_ticket,true);
 if p_id is null or not public.service_job_text(p_name,160,true) or p_quantity is null or p_quantity<=0 or p_quantity>100000 or p_quantity<>round(p_quantity,3) or not public.service_job_text(p_unit,12,true) or not public.service_job_text(p_document,40) or not public.service_job_text(p_source,80) or p_net_cents is null or p_net_cents not between 0 and 99999999999 then raise exception 'Invalid material' using errcode='22023';end if;
 select ticket_id into old_ticket from public.service_materials where id=p_id;
 if old_ticket is not null and old_ticket<>p_ticket then raise exception 'Foreign material' using errcode='42501';end if;
 if old_ticket is null and (select count(*) from public.service_materials where ticket_id=p_ticket)>=60 then raise exception 'Too many materials' using errcode='22023';end if;
 insert into public.service_materials(id,ticket_id,name,quantity,unit,document,source,net_cents,created_by) values(p_id,p_ticket,p_name,p_quantity,p_unit,p_document,p_source,p_net_cents,auth.uid())
 on conflict(id) do update set name=excluded.name,quantity=excluded.quantity,unit=excluded.unit,document=excluded.document,source=excluded.source,net_cents=excluded.net_cents;
 return public.service_job_details(p_ticket);
end;$$;

create function public.delete_service_material(p_ticket uuid,p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform public.service_job_assert(p_ticket,true);
 delete from public.service_materials where id=p_id and ticket_id=p_ticket;
 return public.service_job_details(p_ticket);
end;$$;

create function public.add_service_ticket_comment(p_ticket uuid,p_id uuid,p_body text) returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.service_ticket_comments;begin
 perform public.service_job_assert(p_ticket,false);
 perform public.service_write_lock();
 if p_id is null or p_body is null or length(p_body) not between 1 and 2000 or p_body<>trim(p_body,E' \n\r\t') or p_body~E'[\\x01-\\x09\\x0b-\\x1f\\x7f]' or cardinality(string_to_array(p_body,E'\n'))>80 then raise exception 'Invalid comment' using errcode='22023';end if;
 select * into c from public.service_ticket_comments where id=p_id;
 if c.id is not null then
  if c.ticket_id<>p_ticket or c.author_id<>auth.uid() or c.body<>p_body then raise exception 'Comment id reused' using errcode='22023';end if;
 else
  insert into public.service_ticket_comments(id,ticket_id,author_id,body) values(p_id,p_ticket,auth.uid(),p_body);
 end if;
 return public.service_job_details(p_ticket);
end;$$;

do $$declare f record;begin for f in select oid from pg_proc where pronamespace='public'::regnamespace and proname in('service_job_text','service_job_assert','service_job_details','save_service_measurement','delete_service_measurement','save_service_material','delete_service_material','add_service_ticket_comment') loop execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);end loop;end;$$;
grant execute on function public.service_job_details(uuid),public.save_service_measurement(uuid,uuid,text,text,text,text,boolean),public.delete_service_measurement(uuid,uuid),public.save_service_material(uuid,uuid,text,numeric,text,text,text,bigint),public.delete_service_material(uuid,uuid),public.add_service_ticket_comment(uuid,uuid,text) to authenticated;
