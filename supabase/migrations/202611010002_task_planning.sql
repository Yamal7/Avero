create function public.crm_task_plan_context(p_customer uuid,p_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$declare r public.crm_tasks;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 perform public.assert_customer_workspace(p_customer);
 select * into r from public.crm_tasks where id=p_id and customer_id=p_customer;
 if r.id is null then raise exception 'Task unavailable' using errcode='42501';end if;
 if r.fields->>'state' not in('todo','in_progress') or exists(select 1 from public.customers where id=p_customer and archived_at is not null) then raise exception 'Planning unavailable' using errcode='40001';end if;
 return jsonb_build_object('task',public.crm_record_json('tasks',p_id),'assignees',coalesce((select jsonb_agg(jsonb_build_object('id',user_id,'label',public.crm_staff_label(user_id)) order by public.crm_staff_label(user_id),user_id) from public.staff_users where public.crm_valid_assignee(p_customer,user_id)),'[]'));
end;$$;
create function public.change_crm_task_plan(p_customer uuid,p_id uuid,p_version integer,p_assignee uuid,p_due_on text) returns jsonb language plpgsql security definer set search_path='' as $$declare r public.crm_tasks;f jsonb;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 perform public.crm_assert_write(p_customer);
 select * into r from public.crm_tasks where id=p_id and customer_id=p_customer for update;
 if r.id is null then raise exception 'Task unavailable' using errcode='42501';end if;
 if p_version is null or p_version<0 or p_assignee is null or p_due_on is null then raise exception 'Invalid task plan' using errcode='22023';end if;
 if not public.crm_valid_assignee(p_customer,p_assignee) then raise exception 'Assignee unavailable' using errcode='22023';end if;
 f:=r.fields||jsonb_build_object('assigneeId',p_assignee::text,'dueOn',p_due_on);perform public.crm_check_fields('tasks',f);
 if f=r.fields and p_version in(r.version,r.version-1) then return public.crm_record_json('tasks',p_id);end if;
 if r.version<>p_version or r.fields->>'state' not in('todo','in_progress') then raise exception 'Stale or closed task' using errcode='40001';end if;
 update public.crm_tasks set fields=f,version=version+1,updated_at=now() where id=p_id;
 return public.crm_record_json('tasks',p_id);
end;$$;
revoke all on function public.crm_task_plan_context(uuid,uuid),public.change_crm_task_plan(uuid,uuid,integer,uuid,text) from public,anon,authenticated;
grant execute on function public.crm_task_plan_context(uuid,uuid),public.change_crm_task_plan(uuid,uuid,integer,uuid,text) to authenticated;
