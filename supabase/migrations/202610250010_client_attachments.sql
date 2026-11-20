-- Customers can submit attachments only to an active ticket in their selected membership.
alter table public.documents add column uploaded_by_client boolean not null default false;
create index documents_client_upload_limits_idx on public.documents(created_by,created_at) where uploaded_by_client;
create function public.can_attach_to_ticket(p_customer uuid,p_ticket uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select public.account_enabled(auth.uid()) and not public.is_staff() and public.is_customer_member(p_customer)
 and exists(select 1 from public.service_tickets t join public.installations i on i.id=t.installation_id
 join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where t.id=p_ticket and t.customer_id=p_customer and l.customer_id=p_customer
 and t.status<>'closed' and i.status<>'archived' and c.archived_at is null);
$$;
create function public.prepare_client_attachment(p_customer uuid,p_ticket uuid,p_id uuid,p_name text,p_size bigint,p_mime text,p_sha256 text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare existing public.documents%rowtype; installation uuid; suffix text; kind text; file_count integer; total_bytes bigint;
begin
 if not public.can_attach_to_ticket(p_customer,p_ticket) then raise exception 'Ticket unavailable' using errcode='42501'; end if;
 if p_id is null or p_name is null or length(p_name) not between 1 and 240 or p_name~'[[:cntrl:]/\\]' or trim(p_name)='' or p_name in ('.','..')
 or p_size is null or p_size not between 1 and 10485760 or p_mime is null or p_mime not in ('application/pdf','image/jpeg','image/png')
 or p_sha256 is null or p_sha256!~'^[0-9a-f]{64}$' then raise exception 'Invalid attachment' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into existing from public.documents where id=p_id for update;
 if found then
  if existing.created_by is distinct from auth.uid() or not existing.uploaded_by_client or existing.ticket_id is distinct from p_ticket
  or existing.file_name is distinct from p_name or existing.byte_size is distinct from p_size or existing.mime_type is distinct from p_mime
  or existing.content_sha256 is distinct from p_sha256 or existing.archived_at is not null then raise exception 'Request conflict' using errcode='40001'; end if;
  return jsonb_build_object('id',existing.id,'storage_path',existing.storage_path,'upload_state',existing.upload_state);
 end if;
 -- Both locks cover pending reservations, including simultaneous submissions and different members.
 perform pg_advisory_xact_lock(hashtextextended('client-attachments:'||auth.uid()::text,0));
 select installation_id into installation from public.service_tickets where id=p_ticket for update;
 if not public.can_attach_to_ticket(p_customer,p_ticket) then raise exception 'Ticket unavailable' using errcode='42501'; end if;
 perform 1 from public.installations i join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where i.id=installation for share of i,c;
 if (select count(*) from public.documents where uploaded_by_client and created_by=auth.uid() and created_at>now()-interval '1 hour')>=10 then
 raise exception 'Client attachment rate limit reached' using errcode='P0001'; end if;
 select count(*),coalesce(sum(byte_size),0) into file_count,total_bytes from public.documents where ticket_id=p_ticket and uploaded_by_client;
 if file_count>=10 or total_bytes+p_size>52428800 then raise exception 'Client attachment ticket limit reached' using errcode='P0001'; end if;
 suffix:=case p_mime when 'application/pdf' then 'pdf' when 'image/jpeg' then 'jpg' else 'png' end;
 kind:=case p_mime when 'application/pdf' then 'other' else 'photo' end;
 insert into public.documents(id,installation_id,ticket_id,storage_path,file_name,document_type,upload_state,created_by,byte_size,mime_type,content_sha256,uploaded_by_client,visible_to_customer)
 values(p_id,installation,p_ticket,installation::text||'/'||p_id::text||'/file.'||suffix,p_name,kind,'pending',auth.uid(),p_size,p_mime,p_sha256,true,true)
 returning * into existing;
 return jsonb_build_object('id',existing.id,'storage_path',existing.storage_path,'upload_state','pending');
end $$;
create or replace function public.can_upload_document(p_path text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.documents d join public.installations i on i.id=d.installation_id
 join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where d.storage_path=p_path and d.upload_state='pending' and d.created_by=auth.uid() and i.status<>'archived' and c.archived_at is null
 and (public.can_manage_crm() or (d.uploaded_by_client and public.can_attach_to_ticket(c.id,d.ticket_id))));
$$;
create or replace function public.finish_document(p_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare d public.documents%rowtype;
begin
 select * into d from public.documents where id=p_id for update;
 if not found or d.created_by is distinct from auth.uid() or d.archived_at is not null then raise exception 'Document unavailable' using errcode='42501'; end if;
 if not public.can_manage_crm() then
  if not d.uploaded_by_client then raise exception 'No document write access' using errcode='42501'; end if;
  perform 1 from public.service_tickets where id=d.ticket_id for share;
  if not public.can_attach_to_ticket(public.customer_for_installation(d.installation_id),d.ticket_id) then raise exception 'Ticket unavailable' using errcode='42501'; end if;
 end if;
 if d.upload_state='ready' then return d.id; end if;
 perform 1 from public.installations i join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where i.id=d.installation_id and i.status<>'archived' and c.archived_at is null for share of i,c;
 if not found then raise exception 'Installation unavailable' using errcode='42501'; end if;
 if not exists(select 1 from storage.objects where bucket_id='hvac-documents' and name=d.storage_path
 and (metadata->>'size')::bigint=d.byte_size and metadata->>'mimetype'=d.mime_type) then raise exception 'Upload incomplete' using errcode='22023'; end if;
 update public.documents set upload_state='ready',version=version+1 where id=d.id;
 return d.id;
end $$;
create or replace function public.installation_documents(p_installation uuid,p_ticket uuid default null,p_page integer default 1,p_archived boolean default false,p_customer uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare customer uuid; manager boolean; result jsonb; total integer;
begin
 manager:=public.can_manage_crm();customer:=public.customer_for_installation(p_installation);
 if not public.can_access_customer(customer) or customer is null then raise exception 'Installation unavailable' using errcode='42501'; end if;
 if p_customer is not null then perform public.portal_assert_customer(p_customer);if customer<>p_customer then raise exception 'Customer mismatch' using errcode='42501'; end if;end if;
 if not public.can_read_internal_customer(customer) and p_customer is null then raise exception 'Customer context required' using errcode='42501'; end if;
 if p_ticket is not null and not exists(select 1 from public.service_tickets where id=p_ticket and installation_id=p_installation) then raise exception 'Ticket mismatch' using errcode='42501'; end if;
 if p_archived is null or (p_archived and (not manager or p_customer is not null)) then raise exception 'Archive unavailable' using errcode='42501'; end if;
 if p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid page' using errcode='22023'; end if;
 select count(*) into total from public.documents d where d.installation_id=p_installation and d.upload_state='ready'
 and (p_ticket is null or d.ticket_id=p_ticket) and (d.archived_at is not null)=p_archived
 and ((p_customer is null and public.can_read_internal_customer(customer)) or d.visible_to_customer);
 select coalesce(jsonb_agg(to_jsonb(rows)),'[]') into result from (
 select d.id,d.installation_id,d.ticket_id,d.file_name,d.document_type,d.byte_size,d.mime_type,d.visible_to_customer,d.uploaded_by_client,d.archived_at,d.version,d.created_at
 from public.documents d where d.installation_id=p_installation and d.upload_state='ready'
 and (p_ticket is null or d.ticket_id=p_ticket) and (d.archived_at is not null)=p_archived
 and ((p_customer is null and public.can_read_internal_customer(customer)) or d.visible_to_customer)
 order by d.created_at desc,d.id limit 20 offset(p_page-1)*20) rows;
 return jsonb_build_object('total',total,'documents',result);
end $$;

revoke all on function public.can_attach_to_ticket(uuid,uuid) from public,anon;
grant execute on function public.can_attach_to_ticket(uuid,uuid) to authenticated;
revoke all on function public.prepare_client_attachment(uuid,uuid,uuid,text,bigint,text,text) from public,anon;
grant execute on function public.prepare_client_attachment(uuid,uuid,uuid,text,bigint,text,text) to authenticated;
