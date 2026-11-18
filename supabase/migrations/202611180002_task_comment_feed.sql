-- "Wzmianki" on Mój dzień: recent comments other people left on the caller's own tasks.
create function public.my_task_comment_feed() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid() and role in('admin','office','technician')) then raise exception 'Staff required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(x.j order by x.created_at desc,x.id desc) from(
  select c.id,c.created_at,public.crm_task_comment_json(c)||jsonb_build_object('taskNumber',t.number,'taskTitle',t.fields->>'title','customerId',t.customer_id) as j
  from public.crm_task_comments c join public.crm_tasks t on t.id=c.task_id join public.customers cu on cu.id=t.customer_id
  where t.fields->>'assigneeId'=auth.uid()::text and c.author_id<>auth.uid() and c.created_at>now()-interval '14 days' and cu.archived_at is null and public.can_read_internal_customer(cu.id)
  order by c.created_at desc,c.id desc limit 5) x),'[]');
end;$$;
revoke all on function public.my_task_comment_feed() from public,anon,authenticated;
grant execute on function public.my_task_comment_feed() to authenticated;
