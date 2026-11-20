-- Task details from the design (Zadania): sequential number shown as ZD-…, priority, one label and a comment thread.
-- Stored as columns next to crm_tasks.fields so existing validation, saving and progress functions stay unchanged.
create sequence public.crm_task_number_seq;
alter table public.crm_tasks
  add column number bigint,
  add column priority text not null default 'none' check(priority in('none','low','normal','high','urgent')),
  add column label text check(label in('purchasing','offers','fgas','documents','customers','warranty','contracts','tools','internal'));
update public.crm_tasks t set number=s.n from(select id,99+row_number() over(order by created_at,id) as n from public.crm_tasks) s where s.id=t.id;
select setval('public.crm_task_number_seq',coalesce((select max(number) from public.crm_tasks),99)+1,false);
alter table public.crm_tasks alter column number set default nextval('public.crm_task_number_seq'),alter column number set not null,add constraint crm_tasks_number_key unique(number);
alter sequence public.crm_task_number_seq owned by public.crm_tasks.number;

create table public.crm_task_comments(
  id uuid primary key,
  task_id uuid not null references public.crm_tasks on delete cascade,
  author_id uuid not null references auth.users,
  body text not null check(length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index crm_task_comments_task on public.crm_task_comments(task_id,created_at,id);
alter table public.crm_task_comments enable row level security;
revoke all on public.crm_task_comments from public,anon,authenticated;

create or replace function public.crm_record_json(p_kind text,p_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select fields||jsonb_build_object('id',id,'customerId',customer_id,'version',version,'createdAt',created_at,'updatedAt',updated_at,'contactLabel',(select name from public.customer_contacts where id=(fields->>'contactId')::uuid)) from public.crm_notes where p_kind='notes' and id=p_id
 union all
 select fields||jsonb_build_object('id',id,'customerId',customer_id,'version',version,'createdAt',created_at,'updatedAt',updated_at,'contactLabel',(select name from public.customer_contacts where id=(fields->>'contactId')::uuid),'assigneeLabel',coalesce(public.crm_staff_label((fields->>'assigneeId')::uuid),'Niedostępny użytkownik'),'completedAt',completed_at,'number',number,'priority',priority,'label',label,'comments',(select count(*) from public.crm_task_comments c where c.task_id=crm_tasks.id)) from public.crm_tasks where p_kind='tasks' and id=p_id;
$$;

-- Office or the assignee may change priority and label (same rule as progress).
create function public.crm_task_meta(p_customer uuid,p_id uuid,p_version integer,p_priority text,p_label text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.crm_tasks;begin
 perform public.crm_assert_write(p_customer);
 select * into r from public.crm_tasks where id=p_id for update;
 if r.id is null or r.customer_id<>p_customer or not(public.can_manage_crm() or r.fields->>'assigneeId'=auth.uid()::text) then raise exception 'Task unavailable' using errcode='42501';end if;
 if p_version is null or p_priority is null or p_priority not in('none','low','normal','high','urgent') or p_label is not null and p_label not in('purchasing','offers','fgas','documents','customers','warranty','contracts','tools','internal') then raise exception 'Invalid task details' using errcode='22023';end if;
 if r.priority=p_priority and r.label is not distinct from p_label and p_version in(r.version,r.version-1) then return public.crm_record_json('tasks',p_id);end if;
 if p_version<>r.version then raise exception 'Stale task' using errcode='40001';end if;
 update public.crm_tasks set priority=p_priority,label=p_label,version=version+1,updated_at=now() where id=p_id;
 return public.crm_record_json('tasks',p_id);
end;$$;


create function public.crm_task_comment_json(c public.crm_task_comments) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',c.id,'taskId',c.task_id,'authorId',c.author_id,'authorLabel',coalesce(public.crm_staff_label(c.author_id),'Niedostępny użytkownik'),'body',c.body,'createdAt',c.created_at);
$$;

create function public.crm_task_comments(p_customer uuid,p_task uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare r public.crm_tasks;begin
 if not public.account_enabled(auth.uid()) or not public.can_read_internal_customer(p_customer) then raise exception 'Task unavailable' using errcode='42501';end if;
 select * into r from public.crm_tasks where id=p_task;
 if r.id is null or r.customer_id<>p_customer or not(public.can_manage_crm() or r.fields->>'assigneeId'=auth.uid()::text) then raise exception 'Task unavailable' using errcode='42501';end if;
 return coalesce((select jsonb_agg(public.crm_task_comment_json(c) order by c.created_at,c.id) from(select * from public.crm_task_comments where task_id=p_task order by created_at desc,id desc limit 200) c),'[]');
end;$$;

create function public.add_crm_task_comment(p_customer uuid,p_task uuid,p_id uuid,p_body text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.crm_tasks;c public.crm_task_comments;begin
 perform public.crm_assert_write(p_customer);
 select * into r from public.crm_tasks where id=p_task for update;
 if r.id is null or r.customer_id<>p_customer or not(public.can_manage_crm() or r.fields->>'assigneeId'=auth.uid()::text) then raise exception 'Task unavailable' using errcode='42501';end if;
 if p_id is null or p_body is null or length(p_body) not between 1 and 2000 or p_body<>trim(p_body,E' \n\r\t') or p_body~E'[\\x01-\\x09\\x0b-\\x1f\\x7f]' or cardinality(string_to_array(p_body,E'\n'))>80 then raise exception 'Invalid comment' using errcode='22023';end if;
 select * into c from public.crm_task_comments where id=p_id;
 if c.id is not null then
  if c.task_id<>p_task or c.author_id<>auth.uid() or c.body<>p_body then raise exception 'Comment id reused' using errcode='22023';end if;
  return public.crm_task_comment_json(c);
 end if;
 insert into public.crm_task_comments(id,task_id,author_id,body) values(p_id,p_task,auth.uid(),p_body) returning * into c;
 return public.crm_task_comment_json(c);
end;$$;

do $$declare f record;begin for f in select oid from pg_proc where pronamespace='public'::regnamespace and proname in('crm_record_json','crm_task_meta','crm_task_comment_json','crm_task_comments','add_crm_task_comment') loop execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);end loop;end;$$;
grant execute on function public.crm_task_meta(uuid,uuid,integer,text,text),public.crm_task_comments(uuid,uuid),public.add_crm_task_comment(uuid,uuid,uuid,text) to authenticated;
