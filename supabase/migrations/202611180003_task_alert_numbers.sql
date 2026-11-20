-- Task alerts carry the task number (ZD-…) shown on Mój dzień.
create or replace function public.my_task_alerts() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare agenda jsonb;items jsonb;begin
 agenda:=public.my_crm_tasks('open','',1);
 select coalesce(jsonb_agg(jsonb_build_object('id',item->'id','customerId',item->'customerId','customerName',item->'customerName','customerPage',item->'customerPage','title',item->'title','dueOn',item->'dueOn','state',item->'state','number',item->'number') order by ordinal),'[]'::jsonb) into items
 from(select item,ordinal from jsonb_array_elements(agenda->'items') with ordinality as t(item,ordinal) where item->>'dueOn'<=agenda->>'today' order by ordinal limit 5) limited;
 return jsonb_build_object('viewerId',agenda->'viewerId','today',agenda->'today','counts',jsonb_build_object('today',agenda->'counts'->'today','overdue',agenda->'counts'->'overdue'),'items',items);
end;$$;
