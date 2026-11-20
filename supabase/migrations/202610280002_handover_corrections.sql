create table public.handover_corrections (
 id uuid not null references public.installation_handovers(id), round integer not null check(round between 1 and 100),
 version integer not null default 0,state text not null default 'draft' check(state in('draft','published')),
 fields jsonb not null,internal_note text not null default '',snapshot jsonb,published_at timestamptz,
 received_state text check(received_state in('accepted','reservations')),received_comment text,received_by uuid references auth.users(id),received_at timestamptz,
 updated_by uuid not null references auth.users(id),updated_at timestamptz not null default now(),primary key(id,round)
);
create table public.handover_correction_tasks (
 id uuid primary key,report_id uuid not null,round integer not null,title text not null,assignee_id uuid not null references auth.users(id),due_on date not null,
 state text not null check(state in('todo','in_progress','completed','cancelled')),result text not null default '',internal_note text not null default '',completed_at timestamptz,
 last_payload jsonb not null,foreign key(report_id,round) references public.handover_corrections(id,round)
);
create table public.handover_correction_files (
 id uuid not null,round integer not null,pdf bytea not null check(octet_length(pdf) between 5 and 2097152),primary key(id,round),foreign key(id,round) references public.handover_corrections(id,round)
);
alter table public.handover_corrections enable row level security;
alter table public.handover_correction_tasks enable row level security;
alter table public.handover_correction_files enable row level security;
revoke all on public.handover_corrections,public.handover_correction_tasks,public.handover_correction_files from public,anon,authenticated;
create trigger correction_audit after insert or update on public.handover_corrections for each row execute function public.audit_crm_change();
create trigger correction_tasks_audit after insert or update on public.handover_correction_tasks for each row execute function public.audit_crm_change();
create function public.correction_receipt(p_state text,p_comment text,p_at timestamptz) returns jsonb language sql immutable set search_path='' as $$select case when p_at is null then null else jsonb_build_object('state',p_state,'comment',p_comment,'receivedAt',p_at) end$$;
create function public.correction_json(p_id uuid,p_round integer,p_public boolean default false) returns jsonb
language plpgsql stable security definer set search_path='' as $$declare r public.handover_corrections; v jsonb;begin
 select * into r from public.handover_corrections where id=p_id and round=p_round;if not found then return null;end if;
 v:=jsonb_build_object('round',r.round,'publishedAt',r.published_at,'snapshot',r.snapshot,'receipt',public.correction_receipt(r.received_state,r.received_comment,r.received_at));
 if p_public then return case when r.state='published' then v else null end;end if;
 return v||jsonb_build_object('version',r.version,'state',r.state,'fields',r.fields,'internalNote',r.internal_note,'tasks',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'title',t.title,'assigneeId',t.assignee_id,'dueOn',t.due_on,'state',t.state,'result',t.result,'internalNote',t.internal_note,'completedAt',t.completed_at) order by t.due_on,t.id) from public.handover_correction_tasks t where t.report_id=p_id and t.round=p_round),'[]'));
end;$$;
create function public.correction_can_start(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.installation_handovers h join public.work_orders o on o.id=h.id join public.customers c on c.id=o.customer_id where h.id=p_id and h.state='published' and o.state<>'cancelled' and c.archived_at is null and
 case when exists(select 1 from public.handover_corrections where id=p_id) then (select state='published' and received_state='reservations' and round<100 from public.handover_corrections where id=p_id order by round desc limit 1) else h.received_state='reservations' end);
$$;
create function public.correction_context(p_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 if not public.can_read_work_order(p_id) or not exists(select 1 from public.work_orders where id=p_id) then raise exception 'Forbidden' using errcode='42501';end if;
 return jsonb_build_object('canManage',public.can_manage_crm(),'canStart',public.correction_can_start(p_id),'sourceComment',coalesce((select received_comment from public.handover_corrections where id=p_id and received_at is not null order by round desc limit 1),(select received_comment from public.installation_handovers where id=p_id),''),
 'rounds',coalesce((select jsonb_agg(public.correction_json(p_id,round) order by round) from public.handover_corrections where id=p_id),'[]'),
 'technicians',coalesce((select jsonb_agg(jsonb_build_object('id',s.user_id,'email',u.email) order by u.email) from public.staff_users s join auth.users u on u.id=s.user_id join public.work_orders o on o.id=p_id join public.staff_customer_assignments a on a.user_id=s.user_id and a.customer_id=o.customer_id where s.role='technician' and public.account_enabled(s.user_id) and exists(select 1 from public.work_order_visits v where v.order_id=p_id and s.user_id=any(v.crew_ids))),'[]'));
end;$$;
create function public.correction_mutable(p_id uuid,p_round integer) returns void language plpgsql stable security definer set search_path='' as $$begin
 if not public.can_read_work_order(p_id) or not public.account_enabled(auth.uid()) then raise exception 'Forbidden' using errcode='42501';end if;
 if not exists(select 1 from public.installation_handovers h join public.work_orders o on o.id=h.id join public.customers c on c.id=o.customer_id where h.id=p_id and h.state='published' and o.state<>'cancelled' and c.archived_at is null) then raise exception 'Unavailable report' using errcode='40001';end if;
 if not exists(select 1 from public.handover_corrections where id=p_id and round=p_round and state='draft') or p_round<>(select max(round) from public.handover_corrections where id=p_id) then raise exception 'Immutable or stale round' using errcode='40001';end if;
end;$$;
create function public.save_correction_task(p_id uuid,p_round integer,p_version integer,p_task jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$declare r public.handover_corrections;t public.handover_correction_tasks;cid uuid;target uuid;k text;lim integer;v text;manager boolean;begin
 perform public.service_write_lock();manager:=public.can_manage_crm();
 if not public.can_read_work_order(p_id) then raise exception 'Forbidden' using errcode='42501';end if;
 if not coalesce(public.offer_keys(p_task,array['id','title','assigneeId','dueOn','state','result','internalNote']),false) or p_round is null or p_round not between 1 and 100 then raise exception 'Invalid task' using errcode='22023';end if;
 foreach k in array array['id','title','assigneeId','dueOn','state','result','internalNote'] loop
 v:=p_task->>k;lim:=case when k in('result','internalNote') then 2000 else 160 end;
 if jsonb_typeof(p_task->k) is distinct from 'string' or length(v)>lim or length(v)-length(replace(v,chr(10),''))>79 or replace(replace(v,chr(10),''),chr(9),'')~'[[:cntrl:]]' or k not in('result','internalNote') and v~'[[:cntrl:]]' then raise exception 'Invalid task fields' using errcode='22023';end if;
 end loop;
 cid:=(p_task->>'id')::uuid;target:=(p_task->>'assigneeId')::uuid;
 if length(trim(p_task->>'title'))=0 or p_task->>'dueOn'!~'^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' or to_char((p_task->>'dueOn')::date,'YYYY-MM-DD')<>p_task->>'dueOn' or p_task->>'state' not in('todo','in_progress','completed','cancelled') or p_task->>'state' in('completed','cancelled') and length(trim(p_task->>'result'))=0 then raise exception 'Invalid task' using errcode='22023';end if;
 select * into r from public.handover_corrections where id=p_id and round=p_round for update;
 if not found then
 if not manager then raise exception 'Office required' using errcode='42501';end if;
 if not public.correction_can_start(p_id) or p_round<>coalesce((select max(round) from public.handover_corrections where id=p_id),0)+1 or p_version is distinct from 0 then raise exception 'Customer reservations required' using errcode='40001';end if;
 insert into public.handover_corrections(id,round,fields,updated_by) values(p_id,p_round,jsonb_build_object('performedOn',to_char((clock_timestamp() at time zone 'Europe/Warsaw')::date,'YYYY-MM-DD'),'performerName','','workPerformed','','checks','','observations','','recommendations',''),auth.uid());
 select * into r from public.handover_corrections where id=p_id and round=p_round;
 end if;
 perform public.correction_mutable(p_id,p_round);
 select * into t from public.handover_correction_tasks where id=cid for update;
 if t.id is not null and (t.report_id<>p_id or t.round<>p_round) then raise exception 'Foreign task' using errcode='42501';end if;
 if not manager and (t.id is null or t.assignee_id<>auth.uid()) then raise exception 'Assigned technician required' using errcode='42501';end if;
 if t.last_payload=p_task and p_version in(r.version,r.version-1) then return public.correction_json(p_id,p_round);end if;
 if p_version is distinct from r.version then raise exception 'Stale round' using errcode='40001';end if;
 if t.id is null then
 if p_task->>'state'<>'todo' or (select count(*) from public.handover_correction_tasks where report_id=p_id and round=p_round)>=20 then raise exception 'New task must be pending, max twenty' using errcode='22023';end if;
 else
 if t.state in('completed','cancelled') then raise exception 'Completed task immutable' using errcode='40001';end if;
 if not manager and (p_task->>'title'<>t.title or target<>t.assignee_id or (p_task->>'dueOn')::date<>t.due_on or p_task->>'internalNote'<>t.internal_note or p_task->>'state' not in('in_progress','completed') or t.state='todo' and p_task->>'state'='completed') then raise exception 'Technician cannot replan or skip progress' using errcode='42501';end if;
 end if;
 if not exists(select 1 from public.staff_users s join public.staff_customer_assignments a on a.user_id=s.user_id join public.work_orders o on o.customer_id=a.customer_id where o.id=p_id and s.user_id=target and s.role='technician' and public.account_enabled(target) and exists(select 1 from public.work_order_visits v where v.order_id=p_id and target=any(v.crew_ids))) then raise exception 'Technician unavailable' using errcode='42501';end if;
 insert into public.handover_correction_tasks(id,report_id,round,title,assignee_id,due_on,state,result,internal_note,completed_at,last_payload)
 values(cid,p_id,p_round,trim(p_task->>'title'),target,(p_task->>'dueOn')::date,p_task->>'state',trim(p_task->>'result'),trim(p_task->>'internalNote'),case when p_task->>'state' in('completed','cancelled') then clock_timestamp() else null end,p_task)
 on conflict(id) do update set title=excluded.title,assignee_id=excluded.assignee_id,due_on=excluded.due_on,state=excluded.state,result=excluded.result,internal_note=excluded.internal_note,completed_at=excluded.completed_at,last_payload=excluded.last_payload;
 update public.handover_corrections set version=version+1,updated_by=auth.uid(),updated_at=now() where id=p_id and round=p_round;
 return public.correction_json(p_id,p_round);
end;$$;
create function public.save_correction_draft(p_id uuid,p_round integer,p_version integer,p_fields jsonb,p_note text) returns jsonb
language plpgsql security definer set search_path='' as $$declare r public.handover_corrections;f jsonb;begin
 perform public.service_write_lock();perform public.correction_mutable(p_id,p_round);
 -- Reuse the strict public-text/date validator; device and installation data are frozen in the original report.
 f:=p_fields||jsonb_build_object('mode','new','installationId',null,'locationId',null,'installationType','','devices','[]'::jsonb);
 if not coalesce(public.offer_keys(p_fields,array['performedOn','performerName','workPerformed','checks','observations','recommendations']),false) or not public.validate_handover_fields(f) or p_note is null or length(p_note)>4000 or length(p_note)-length(replace(p_note,chr(10),''))>79 or replace(replace(p_note,chr(10),''),chr(9),'')~'[[:cntrl:]]' then raise exception 'Invalid report fields' using errcode='22023';end if;
 select * into r from public.handover_corrections where id=p_id and round=p_round for update;
 if r.fields=p_fields and r.internal_note=p_note and p_version in(r.version,r.version-1) then return public.correction_json(p_id,p_round);end if;
 if r.version is distinct from p_version then raise exception 'Stale round' using errcode='40001';end if;
 update public.handover_corrections set fields=p_fields,internal_note=p_note,version=version+1,updated_by=auth.uid(),updated_at=now() where id=p_id and round=p_round;
 return public.correction_json(p_id,p_round);
end;$$;
create function public.prepare_correction(p_id uuid,p_round integer,p_version integer) returns jsonb
language plpgsql stable security definer set search_path='' as $$declare r public.handover_corrections;base jsonb;f jsonb;work text;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;perform public.correction_mutable(p_id,p_round);
 select * into r from public.handover_corrections where id=p_id and round=p_round;f:=r.fields;
 if r.version is distinct from p_version then raise exception 'Stale round' using errcode='40001';end if;
 if not exists(select 1 from public.handover_correction_tasks where report_id=p_id and round=p_round and state='completed') or exists(select 1 from public.handover_correction_tasks where report_id=p_id and round=p_round and state in('todo','in_progress')) then raise exception 'Finish corrective tasks first' using errcode='40001';end if;
 select snapshot into base from public.installation_handovers where id=p_id;
 if length(trim(f->>'performerName'))=0 or length(trim(f->>'workPerformed'))=0 or length(trim(f->>'checks'))=0 or (f->>'performedOn')::date>(clock_timestamp() at time zone 'Europe/Warsaw')::date or (f->>'performedOn')::date<(base->>'performedOn')::date or (f->>'performedOn')::date<(select max((completed_at at time zone 'Europe/Warsaw')::date) from public.handover_correction_tasks where report_id=p_id and round=p_round and state='completed') then raise exception 'Incomplete or invalid execution date' using errcode='22023';end if;
 select string_agg(t.title||chr(10)||t.result,chr(10)||chr(10) order by t.due_on,t.id) into work from public.handover_correction_tasks t where report_id=p_id and round=p_round and state='completed';
 return base||f||jsonb_build_object('number',(base->>'number')||'/P'||p_round,'title','Ponowny odbiór - '||(base->>'title'),'workPerformed','Dokument uzupełniający do '||(base->>'number')||'. Runda poprawek '||p_round||'.'||chr(10)||chr(10)||(f->>'workPerformed')||chr(10)||chr(10)||'Wykonane zadania:'||chr(10)||work,'observations','Uwagi klienta będące podstawą tej rundy:'||chr(10)||coalesce(case when p_round=1 then (select received_comment from public.installation_handovers where id=p_id) else (select received_comment from public.handover_corrections where id=p_id and round=p_round-1) end,'')||chr(10)||chr(10)||(f->>'observations')||coalesce((select chr(10)||chr(10)||'Zadania anulowane przez firmę (niewykonane):'||chr(10)||string_agg(t.title||chr(10)||t.result,chr(10)||chr(10) order by t.due_on,t.id) from public.handover_correction_tasks t where t.report_id=p_id and t.round=p_round and t.state='cancelled'),''));
end;$$;
create function public.publish_correction(p_id uuid,p_round integer,p_version integer,p_snapshot jsonb,p_pdf_base64 text) returns jsonb
language plpgsql security definer set search_path='' as $$declare r public.handover_corrections;snap jsonb;pdf bytea;begin
 perform public.service_write_lock();if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 select * into r from public.handover_corrections where id=p_id and round=p_round for update;
 if r.state='published' and p_version in(r.version,r.version-1) then return public.correction_json(p_id,p_round);end if;
 snap:=public.prepare_correction(p_id,p_round,p_version);if snap is distinct from p_snapshot then raise exception 'Rendered snapshot changed' using errcode='40001';end if;
 if p_pdf_base64 is null or length(p_pdf_base64)>2796204 then raise exception 'Invalid PDF' using errcode='22023';end if;pdf:=decode(p_pdf_base64,'base64');if octet_length(pdf) not between 5 and 2097152 or substring(pdf from 1 for 5)<>convert_to('%PDF-','UTF8') then raise exception 'Invalid PDF' using errcode='22023';end if;
 insert into public.handover_correction_files values(p_id,p_round,pdf);
 update public.handover_corrections set state='published',snapshot=snap,published_at=clock_timestamp(),version=version+1,updated_by=auth.uid(),updated_at=now() where id=p_id and round=p_round;
 return public.correction_json(p_id,p_round);
end;$$;
create function public.portal_corrections(p_customer uuid,p_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 if public.portal_handover(p_customer,p_id) is null then return '[]';end if;
 return coalesce((select jsonb_agg(public.correction_json(p_id,round,true) order by round) from public.handover_corrections where id=p_id and state='published'),'[]');
end;$$;
create function public.correction_pdf(p_id uuid,p_round integer,p_customer uuid default null) returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 if p_customer is null then if not public.can_read_work_order(p_id) then raise exception 'Forbidden' using errcode='42501';end if;else if public.portal_handover(p_customer,p_id) is null then return null;end if;end if;
 return (select jsonb_build_object('number',r.snapshot->>'number','base64',encode(f.pdf,'base64')) from public.handover_corrections r join public.handover_correction_files f on f.id=r.id and f.round=r.round where r.id=p_id and r.round=p_round and r.state='published');
end;$$;
create function public.acknowledge_correction(p_customer uuid,p_id uuid,p_round integer,p_state text,p_comment text,p_confirm boolean) returns jsonb
language plpgsql security definer set search_path='' as $$declare r public.handover_corrections;begin
 perform public.service_write_lock();perform public.portal_assert_customer(p_customer);
 if public.current_access()->>'role' is distinct from 'client' or not public.is_customer_member(p_customer) then raise exception 'Client required' using errcode='42501';end if;
 if public.portal_handover(p_customer,p_id) is null then raise exception 'Foreign report' using errcode='42501';end if;
 if p_confirm is distinct from true or p_state is null or p_state not in('accepted','reservations') or p_comment is null or length(trim(p_comment))>2000 or length(p_comment)-length(replace(p_comment,chr(10),''))>79 or replace(replace(p_comment,chr(10),''),chr(9),'')~'[[:cntrl:]]' or p_state='reservations' and length(trim(p_comment))=0 then raise exception 'Invalid receipt' using errcode='22023';end if;
 select * into r from public.handover_corrections where id=p_id and round=p_round for update;
 if r.id is null or r.state<>'published' then raise exception 'Published document required' using errcode='40001';end if;
 if r.received_at is not null then if r.received_state<>p_state or r.received_comment<>trim(p_comment) then raise exception 'Receipt immutable' using errcode='40001';end if;
 else
 if not exists(select 1 from public.customers where id=p_customer and archived_at is null) then raise exception 'Archived customer' using errcode='40001';end if;
 update public.handover_corrections set received_state=p_state,received_comment=trim(p_comment),received_at=clock_timestamp(),received_by=auth.uid() where id=p_id and round=p_round returning * into r;
 end if;
 return jsonb_build_object('id',p_id,'publishedAt',r.published_at,'snapshot',r.snapshot,'receipt',public.correction_receipt(r.received_state,r.received_comment,r.received_at));
end;$$;
do $$declare f record;begin for f in select oid from pg_proc where pronamespace='public'::regnamespace and proname in('correction_receipt','correction_json','correction_can_start','correction_mutable','correction_context','save_correction_task','save_correction_draft','prepare_correction','publish_correction','portal_corrections','correction_pdf','acknowledge_correction') loop execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);end loop;end;$$;
grant execute on function public.correction_context(uuid),public.save_correction_task(uuid,integer,integer,jsonb),public.save_correction_draft(uuid,integer,integer,jsonb,text),public.prepare_correction(uuid,integer,integer),public.publish_correction(uuid,integer,integer,jsonb,text),public.portal_corrections(uuid,uuid),public.correction_pdf(uuid,integer,uuid),public.acknowledge_correction(uuid,uuid,integer,text,text,boolean) to authenticated;
