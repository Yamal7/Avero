create table public.offer_documents (
 id uuid primary key references public.offers(id) on delete cascade,
 data jsonb not null, version integer not null default 0 check(version>=0),
 updated_at timestamptz not null default now()
);
alter table public.offer_documents enable row level security;
revoke all on public.offer_documents from anon,authenticated;
grant select on public.offer_documents to authenticated;
create policy offer_documents_read on public.offer_documents for select to authenticated using(public.can_manage_crm());
create trigger offer_documents_audit after insert or update on public.offer_documents for each row execute function public.audit_crm_change();
create function public.validate_offer_document(p_data jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare k text; v text; lim integer;
begin
 if not coalesce(public.offer_keys(p_data,array['companyName','companyAddress','taxId','email','phone','website','issuedOn','validUntil','intro','paymentTerms','completionTerms','exclusions','note']),false) then return false;end if;
 for k,v in select key,value #>> '{}' from jsonb_each(p_data) loop
  if jsonb_typeof(p_data->k) is distinct from 'string' then return false;end if;
  lim:=case k when 'companyName' then 160 when 'companyAddress' then 240 when 'taxId' then 40 when 'email' then 160 when 'phone' then 50 when 'website' then 160 when 'issuedOn' then 10 when 'validUntil' then 10 else 2000 end;
  if length(v)>lim or v<>trim(v) then return false;end if;
  if k in ('intro','paymentTerms','completionTerms','exclusions','note') then
   if length(v)-length(replace(v,chr(10),''))>19 or replace(replace(v,chr(10),''),chr(9),'')~'[[:cntrl:]]' then return false;end if;
  elsif v~'[[:cntrl:]]' then return false;end if;
 end loop;
 if length(p_data->>'companyName')=0 or length(p_data->>'companyAddress')=0 then return false;end if;
 if p_data->>'issuedOn'!~'^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' or p_data->>'validUntil'!~'^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' then return false;end if;
 if to_char((p_data->>'issuedOn')::date,'YYYY-MM-DD')<>p_data->>'issuedOn' or to_char((p_data->>'validUntil')::date,'YYYY-MM-DD')<>p_data->>'validUntil' then return false;end if;
 return (p_data->>'validUntil')::date >= (p_data->>'issuedOn')::date;
 exception when datetime_field_overflow or invalid_datetime_format then return false;
end;$$;
create function public.offer_document_context(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 return (select jsonb_build_object('offer',public.offer_detail(o.id),'document',case when d.id is null then null else jsonb_build_object('version',d.version,'data',d.data) end) from public.offers o left join public.offer_documents d on d.id=o.id where o.id=p_id);
end;$$;
create function public.save_offer_document(p_id uuid,p_data jsonb,p_version integer,p_offer_version integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare current_offer public.offers; current_document public.offer_documents;
begin
 if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 if not public.validate_offer_document(p_data) then raise exception 'Invalid document' using errcode='22023';end if;
 -- The same offer row lock serializes against calculation saves.
 select * into current_offer from public.offers where id=p_id for update;
 if not found then raise exception 'Missing offer' using errcode='22023';end if;
 if p_offer_version is distinct from current_offer.version then raise exception 'Stale offer' using errcode='40001';end if;
 select * into current_document from public.offer_documents where id=p_id for update;
 if found then
  if current_document.data=p_data and (p_version=current_document.version or p_version=current_document.version-1 or p_version is null and current_document.version=0) then
   return jsonb_build_object('version',current_document.version,'data',current_document.data);
  end if;
  if p_version is distinct from current_document.version then raise exception 'Stale document' using errcode='40001';end if;
  update public.offer_documents set data=p_data,version=version+1,updated_at=now() where id=p_id returning * into current_document;
 else
  if p_version is not null then raise exception 'Missing document version' using errcode='40001';end if;
  insert into public.offer_documents(id,data) values(p_id,p_data) returning * into current_document;
 end if;
 return jsonb_build_object('version',current_document.version,'data',current_document.data);
end;$$;
revoke all on function public.validate_offer_document(jsonb),public.offer_document_context(uuid),public.save_offer_document(uuid,jsonb,integer,integer) from public,anon,authenticated;
grant execute on function public.offer_document_context(uuid),public.save_offer_document(uuid,jsonb,integer,integer) to authenticated;
