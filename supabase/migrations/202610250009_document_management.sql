-- Uploads are staged; incomplete and archived objects never appear in the portal.
alter table public.documents
 add column ticket_id uuid references public.service_tickets(id),
 add column upload_state text not null default 'ready' check(upload_state in ('pending','ready')),
 add column created_by uuid references auth.users(id),
 add column byte_size bigint check(byte_size between 1 and 10485760),
 add column mime_type text check(mime_type in ('application/pdf','image/jpeg','image/png')),
 add column content_sha256 text,
 add column archived_at timestamptz,
 add column version integer not null default 0;
create index documents_ticket_idx on public.documents(ticket_id) where ticket_id is not null;
create trigger documents_audit after insert or update on public.documents for each row execute function public.audit_crm_change();

-- Writes go through guarded RPCs. No overwriting of a published Storage object.
revoke insert,update,delete on public.documents from authenticated;
drop policy documents_staff_insert on public.documents;
drop policy documents_staff_update on public.documents;
alter policy documents_read on public.documents using (
 upload_state='ready' and archived_at is null and (
 public.can_read_internal_customer(public.customer_for_installation(installation_id))
 or (visible_to_customer and public.can_access_customer(public.customer_for_installation(installation_id)))));
alter policy hvac_files_read on storage.objects using (bucket_id='hvac-documents' and exists(
 select 1 from public.documents d where d.storage_path=name and d.upload_state='ready' and d.archived_at is null and (
 public.can_read_internal_customer(public.customer_for_installation(d.installation_id))
 or (d.visible_to_customer and public.can_access_customer(public.customer_for_installation(d.installation_id))))));
drop policy hvac_files_staff_update on storage.objects;
drop policy hvac_files_staff_delete on storage.objects;
-- The insert policy needs to resolve pending records despite their SELECT policy.
create function public.can_upload_document(p_path text) returns boolean
language sql stable security definer set search_path='' as $$
 select public.can_manage_crm() and exists(
 select 1 from public.documents d join public.installations i on i.id=d.installation_id
 join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where d.storage_path=p_path and d.upload_state='pending' and d.created_by=auth.uid()
 and i.status<>'archived' and c.archived_at is null);
$$;
alter policy hvac_files_staff_insert on storage.objects with check (bucket_id='hvac-documents' and public.can_upload_document(name));

create function public.prepare_document(p_id uuid,p_installation uuid,p_ticket uuid,p_name text,p_type text,p_size bigint,p_mime text,p_sha256 text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare existing public.documents%rowtype; suffix text;
begin
 if not public.can_manage_crm() then raise exception 'No document write access' using errcode='42501'; end if;
 if p_id is null or p_name is null or length(p_name) not between 1 and 240 or p_name~'[[:cntrl:]/\\]' or trim(p_name)='' or p_name in ('.','..')
 or p_type is null or p_type not in ('manual','warranty','photo','other') or p_size is null or p_size not between 1 and 10485760
 or p_mime is null or p_mime not in ('application/pdf','image/jpeg','image/png') or p_sha256 is null or p_sha256!~'^[0-9a-f]{64}$' then raise exception 'Invalid document' using errcode='22023'; end if;
 -- Serialize retries for the same id, without allowing metadata or content replacement.
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into existing from public.documents where id=p_id for update;
 if found then
  if existing.created_by is distinct from auth.uid() or existing.installation_id is distinct from p_installation or existing.ticket_id is distinct from p_ticket
  or existing.file_name is distinct from p_name or existing.document_type is distinct from p_type or existing.byte_size is distinct from p_size
  or existing.mime_type is distinct from p_mime or existing.content_sha256 is distinct from p_sha256 or existing.archived_at is not null then
   raise exception 'Request conflict' using errcode='40001';
  end if;
  return jsonb_build_object('id',existing.id,'storage_path',existing.storage_path,'upload_state',existing.upload_state);
 end if;
 perform 1 from public.installations i join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where i.id=p_installation and i.status<>'archived' and c.archived_at is null for share of i,c;
 if not found then raise exception 'Installation unavailable' using errcode='42501'; end if;
 if p_ticket is not null and not exists(select 1 from public.service_tickets where id=p_ticket and installation_id=p_installation) then raise exception 'Ticket mismatch' using errcode='42501'; end if;
 suffix:=case p_mime when 'application/pdf' then 'pdf' when 'image/jpeg' then 'jpg' else 'png' end;
 insert into public.documents(id,installation_id,ticket_id,storage_path,file_name,document_type,upload_state,created_by,byte_size,mime_type,content_sha256)
 values(p_id,p_installation,p_ticket,p_installation::text||'/'||p_id::text||'/file.'||suffix,p_name,p_type,'pending',auth.uid(),p_size,p_mime,p_sha256)
 returning * into existing;
 return jsonb_build_object('id',existing.id,'storage_path',existing.storage_path,'upload_state','pending');
end $$;
create function public.finish_document(p_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare d public.documents%rowtype;
begin
 if not public.can_manage_crm() then raise exception 'No document write access' using errcode='42501'; end if;
 select * into d from public.documents where id=p_id for update;
 if not found or d.created_by is distinct from auth.uid() or d.archived_at is not null then raise exception 'Document unavailable' using errcode='42501'; end if;
 if d.upload_state='ready' then return d.id; end if;
 perform 1 from public.installations i join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where i.id=d.installation_id and i.status<>'archived' and c.archived_at is null for share of i,c;
 if not found then raise exception 'Installation unavailable' using errcode='42501'; end if;
 if not exists(select 1 from storage.objects where bucket_id='hvac-documents' and name=d.storage_path
 and (metadata->>'size')::bigint=d.byte_size and metadata->>'mimetype'=d.mime_type) then raise exception 'Upload incomplete' using errcode='22023'; end if;
 update public.documents set upload_state='ready',version=version+1 where id=d.id;
 return d.id;
end $$;
create function public.change_document(p_id uuid,p_version integer,p_visible boolean,p_archived boolean) returns uuid
language plpgsql security definer set search_path='' as $$
declare d public.documents%rowtype;
begin
 if not public.can_manage_crm() then raise exception 'No document write access' using errcode='42501'; end if;
 if p_visible is null or p_archived is null or p_version is null or p_version<0 or (p_archived and p_visible) then raise exception 'Invalid document state' using errcode='22023'; end if;
 select * into d from public.documents where id=p_id and upload_state='ready' for update;
 if not found then raise exception 'Document unavailable' using errcode='42501'; end if;
 if d.version<>p_version then raise exception 'Document changed' using errcode='40001'; end if;
 update public.documents set visible_to_customer=p_visible,archived_at=case when p_archived then coalesce(archived_at,now()) else null end,version=version+1 where id=p_id;
 return p_id;
end $$;
create function public.installation_documents(p_installation uuid,p_ticket uuid default null,p_page integer default 1,p_archived boolean default false,p_customer uuid default null) returns jsonb
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
 select d.id,d.installation_id,d.ticket_id,d.file_name,d.document_type,d.byte_size,d.mime_type,d.visible_to_customer,d.archived_at,d.version,d.created_at
 from public.documents d where d.installation_id=p_installation and d.upload_state='ready'
 and (p_ticket is null or d.ticket_id=p_ticket) and (d.archived_at is not null)=p_archived
 and ((p_customer is null and public.can_read_internal_customer(customer)) or d.visible_to_customer)
 order by d.created_at desc,d.id limit 20 offset(p_page-1)*20) rows;
 return jsonb_build_object('total',total,'documents',result);
end $$;
-- Only a permitted, ready and unarchived document can be resolved to Storage.
create function public.document_file(p_id uuid) returns jsonb
language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('id',id,'file_name',file_name,'storage_path',storage_path) from public.documents where id=p_id;
$$;
do $$declare f record;begin
 for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace and proname in ('can_upload_document','prepare_document','finish_document','change_document','installation_documents','document_file') loop
 execute format('revoke all on function %s from public, anon',f.signature);
 execute format('grant execute on function %s to authenticated',f.signature);
 end loop;
end $$;
