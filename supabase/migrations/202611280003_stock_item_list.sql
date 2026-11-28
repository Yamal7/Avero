-- M0.4 Silnik widoku kolekcji (KRA-31): Magazyn — lista pozycji z filtrami, sortowaniem, grupowaniem i stronami w SQL.
-- Ten sam dostęp (stock_is_staff) i ten sam kształt pozycji co w stock_overview(); stock_overview zostaje dla okien
-- dokumentów (wybór dowolnej pozycji), macierzy „W samochodach” i lokalizacji.
--  p_view: all | refrigerant | below (dostępne = stan − rezerwacje < minimum)
--  p_categories: podzbiór refrigerant, parts, materials, other (pusty = wszystkie)
--  p_sort: code | name | available (najmniej dostępnych najpierw) | last_move (najnowszy ruch najpierw, bez ruchu na końcu)
--  p_group: category (stała kolejność kategorii) | none; strona: 50 pozycji.
create function public.stock_item_list(p_view text default 'all',p_search text default '',p_categories text[] default '{}',p_sort text default 'code',p_group text default 'category',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare term text:=lower(trim(coalesce(p_search,'')));cats text[]:=array['refrigerant','parts','materials','other'];result jsonb;begin
 if not public.stock_is_staff() then raise exception 'Staff required' using errcode='42501';end if;
 if p_view is null or p_view not in('all','refrigerant','below') or length(term)>200 or p_categories is null or cardinality(p_categories)>4 or not p_categories<@cats
  or p_sort is null or p_sort not in('code','name','available','last_move') or p_group is null or p_group not in('category','none')
  or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid stock query' using errcode='22023';end if;
 with base as materialized(
  select i.*,
   coalesce((select sum(m.delta) from public.stock_moves m where m.item_id=i.id),0) on_hand,
   coalesce((select sum(r.quantity) from public.stock_reservations r where r.item_id=i.id and r.closed_at is null),0) reserved_qty,
   (select max(m.created_at) from public.stock_moves m where m.item_id=i.id) last_move_at
  from public.stock_items i where i.active
 ),counted as materialized(
  select b.*,b.on_hand-b.reserved_qty available,(b.min_quantity>0 and b.on_hand-b.reserved_qty<b.min_quantity) is_below from base b
 ),filtered as materialized(
  select c.* from counted c
  where (p_view<>'refrigerant' or c.category='refrigerant') and (p_view<>'below' or c.is_below)
   and (cardinality(p_categories)=0 or c.category=any(p_categories))
   and (term='' or strpos(lower(concat_ws(' ',c.code,c.name,c.bin,c.refrigerant_class,c.container)),term)>0)
 ),ordered as materialized(
  select f.*,row_number() over(order by
   case when p_group='category' then array_position(cats,f.category) end,
   case when p_sort='name' then lower(f.name) end,
   case when p_sort='available' then f.available end,
   case when p_sort='last_move' then f.last_move_at end desc nulls last,
   f.code,f.id) rn
  from filtered f
 )
 select jsonb_build_object(
  'total',(select count(*) from filtered),
  'summary',jsonb_build_object('all',(select count(*) from counted),'below',(select count(*) from counted where is_below)),
  'groups',case when p_group='none' then '[]'::jsonb else coalesce((select jsonb_agg(jsonb_build_object('key',g.category,'count',g.n) order by array_position(cats,g.category))
    from(select category,count(*) n from filtered group by category) g),'[]') end,
  'items',coalesce((select jsonb_agg(jsonb_build_object(
    'id',i.id,'code',i.code,'name',i.name,'category',i.category,'unit',i.unit,'minQuantity',i.min_quantity,'bin',i.bin,'refrigerantClass',i.refrigerant_class,'gwp',i.gwp,'container',i.container,
    'unitLocked',exists(select 1 from public.stock_moves m where m.item_id=i.id),
    'levels',coalesce((select jsonb_object_agg(x.location_id,x.q) from(select location_id,sum(delta) q from public.stock_moves where item_id=i.id group by location_id having sum(delta)<>0) x),'{}'),
    'vehicleMins',coalesce((select jsonb_object_agg(v.location_id,v.min_quantity) from public.stock_vehicle_minimums v where v.item_id=i.id),'{}'),
    'reserved',coalesce((select sum(quantity) from public.stock_reservations r where r.item_id=i.id and r.closed_at is null),0),
    'reservations',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'ticketId',r.ticket_id,'ticketNumber',t.ticket_number,'taskId',r.task_id,'taskNumber',k.number,'taskCustomerId',k.customer_id,'quantity',r.quantity) order by r.created_at) from public.stock_reservations r left join public.service_tickets t on t.id=r.ticket_id left join public.crm_tasks k on k.id=r.task_id where r.item_id=i.id and r.closed_at is null),'[]'),
    'lastMove',(select jsonb_build_object('at',m.created_at,'delta',m.delta) from public.stock_moves m where m.item_id=i.id order by m.created_at desc,m.id limit 1)
   ) order by i.rn) from ordered i where i.rn>(p_page-1)*50 and i.rn<=p_page*50),'[]')
 ) into result;
 return result;
end;$$;
alter function public.stock_item_list(text,text,text[],text,text,integer) owner to avero_rpc;
revoke all on function public.stock_item_list(text,text,text[],text,text,integer) from public,anon,authenticated;
grant execute on function public.stock_item_list(text,text,text[],text,text,integer) to authenticated;
