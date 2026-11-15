-- Immutable customer-facing editions. Internal calculations never appear in this table.
create table public.offer_publications (
 id uuid primary key, offer_id uuid not null references public.offers(id),
 customer_id uuid not null references public.customers(id), revision integer not null check(revision>0),
 offer_version integer not null, document_version integer not null,
 snapshot jsonb not null, document jsonb not null,
 state text not null default 'published' check(state in ('published','superseded','withdrawn','accepted')),
 published_at timestamptz not null default now(), published_by uuid not null references auth.users(id),
 accepted_at timestamptz, accepted_by uuid references auth.users(id), selected_variant_id uuid,
 unique(offer_id,revision),
 check((state='accepted')=(accepted_at is not null and accepted_by is not null and selected_variant_id is not null))
);
create unique index offer_publication_active on public.offer_publications(offer_id) where state in ('published','accepted');
create index offer_publications_customer on public.offer_publications(customer_id,published_at desc,id);
create table public.offer_publication_files (
 id uuid primary key references public.offer_publications(id), pdf bytea not null check(octet_length(pdf) between 5 and 2097152)
);
alter table public.offer_publications enable row level security;
alter table public.offer_publication_files enable row level security;
revoke all on public.offer_publications,public.offer_publication_files from public,anon,authenticated;
grant select on public.offer_publications to authenticated;
create policy offer_publications_staff on public.offer_publications for select to authenticated using(public.can_manage_crm());
create trigger offer_publications_audit after insert or update on public.offer_publications for each row execute function public.audit_crm_change();

create function public.offer_customer_snapshot(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare o jsonb; variants jsonb;
begin
 if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 o:=public.offer_detail(p_id);if o is null then return null;end if;
 select jsonb_agg(jsonb_build_object('id',v->'id','name',v->'name','note',v->'customerNote',
 'netCents',o->'computed'->(v->>'id')->'netCents','vatCents',o->'computed'->(v->>'id')->'vatCents','grossCents',o->'computed'->(v->>'id')->'grossCents',
 'lines',(select jsonb_agg(jsonb_build_object('name',l->'name','description',l->'description','unit',l->'unit','quantityMills',l->'quantityMills','vatBasisPoints',l->'vatBasisPoints',
 'netCents',o->'computed'->(v->>'id')->'lines'->(n-1)::int->'netCents','vatCents',o->'computed'->(v->>'id')->'lines'->(n-1)::int->'vatCents','grossCents',o->'computed'->(v->>'id')->'lines'->(n-1)::int->'grossCents') order by n)
 from jsonb_array_elements(v->'lines') with ordinality as t(l,n))) order by pos) into variants
 from jsonb_array_elements(o->'variants') with ordinality as a(v,pos);
 return jsonb_build_object('number',o->'number','title',o->'title','customer',o->'customerSnapshot','mainVariantId',o->'mainVariantId','variants',variants);
end;$$;
create function public.offer_publication_json(p_id uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',p.id,'offerId',p.offer_id,'revision',p.revision,'offerVersion',p.offer_version,'documentVersion',p.document_version,
 'snapshot',p.snapshot,'document',p.document,'state',p.state,'publishedAt',p.published_at,'acceptedAt',p.accepted_at,'selectedVariantId',p.selected_variant_id,
 'expired',(p.document->>'validUntil')::date<(clock_timestamp() at time zone 'Europe/Warsaw')::date)
 from public.offer_publications p where p.id=p_id;
$$;
-- This helper deliberately has no grants: callers must authorize the selected customer first.
create function public.staff_offer_publications(p_offer uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 return (select jsonb_build_object('total',count(*),'items',coalesce((select jsonb_agg(public.offer_publication_json(id) order by revision desc) from (select id,revision from public.offer_publications where offer_id=p_offer order by revision desc limit 20) p),'[]')) from public.offer_publications where offer_id=p_offer);
end;$$;
create function public.publish_offer(p_id uuid,p_offer uuid,p_offer_version integer,p_document_version integer,p_pdf_base64 text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.offers; d public.offer_documents; existing public.offer_publications; pdf bytea; rev integer; today date:=(clock_timestamp() at time zone 'Europe/Warsaw')::date;
begin
 if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 if p_id is null or p_pdf_base64 is null or length(p_pdf_base64)>2796204 then raise exception 'Invalid PDF' using errcode='22023';end if;
 select * into o from public.offers where id=p_offer for update;
 if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 if not found then raise exception 'Missing offer' using errcode='22023';end if;
 select * into existing from public.offer_publications where id=p_id;
 if found then
  if existing.offer_id=p_offer and existing.offer_version=p_offer_version and existing.document_version=p_document_version then return public.offer_publication_json(p_id);end if;
  raise exception 'Request identity conflict' using errcode='40001';
 end if;
 if o.version is distinct from p_offer_version or (o.data->>'archived')::boolean then raise exception 'Stale or archived offer' using errcode='40001';end if;
 select * into d from public.offer_documents where id=p_offer for update;
 if not found or d.version is distinct from p_document_version then raise exception 'Stale document' using errcode='40001';end if;
 if not exists(select 1 from public.customers where id=o.customer_id and archived_at is null) then raise exception 'Archived customer' using errcode='40001';end if;
 if (d.data->>'validUntil')::date<today or (d.data->>'issuedOn')::date>today then raise exception 'Offer date unavailable' using errcode='40001';end if;
 if exists(select 1 from jsonb_array_elements(o.data->'variants') v where jsonb_array_length(v->'lines')=0) then raise exception 'Empty variant' using errcode='22023';end if;
 if exists(select 1 from public.offer_publications where offer_id=p_offer and state='accepted') then raise exception 'Already accepted offer' using errcode='40001';end if;
 pdf:=decode(p_pdf_base64,'base64');if octet_length(pdf) not between 5 and 2097152 or substring(pdf from 1 for 5)<>convert_to('%PDF-','UTF8') then raise exception 'Invalid PDF' using errcode='22023';end if;
 -- Retry under a new request id must not create duplicate editions of the same saved versions.
 select * into existing from public.offer_publications where offer_id=p_offer and offer_version=p_offer_version and document_version=p_document_version and state='published';
 if found then return public.offer_publication_json(existing.id);end if;
 select coalesce(max(revision),0)+1 into rev from public.offer_publications where offer_id=p_offer;
 update public.offer_publications set state='superseded' where offer_id=p_offer and state='published';
 insert into public.offer_publications(id,offer_id,customer_id,revision,offer_version,document_version,snapshot,document,published_by)
 values(p_id,p_offer,o.customer_id,rev,o.version,d.version,public.offer_customer_snapshot(p_offer),d.data,auth.uid());
 insert into public.offer_publication_files(id,pdf) values(p_id,pdf);
 return public.offer_publication_json(p_id);
end;$$;
create function public.withdraw_offer_publication(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare target uuid; p public.offer_publications;
begin
 if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 select offer_id into target from public.offer_publications where id=p_id;if target is null then raise exception 'Missing publication' using errcode='22023';end if;
 perform 1 from public.offers where id=target for update;
 if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 select * into p from public.offer_publications where id=p_id for update;
 if p.state='withdrawn' then return public.offer_publication_json(p_id);end if;
 if p.state<>'published' then raise exception 'Cannot withdraw this state' using errcode='40001';end if;
 update public.offer_publications set state='withdrawn' where id=p_id;
 return public.offer_publication_json(p_id);
end;$$;
create function public.portal_offers(p_customer uuid,p_page integer default 1) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 perform public.portal_assert_customer(p_customer);
 if public.current_access()->>'role' not in ('admin','office','client') then raise exception 'Forbidden role' using errcode='42501';end if;
 if p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid page' using errcode='22023';end if;
 return jsonb_build_object('total',(select count(*) from public.offer_publications where customer_id=p_customer),
 'items',coalesce((select jsonb_agg(jsonb_build_object('id',id,'offerId',offer_id,'number',snapshot->>'number','title',snapshot->>'title','revision',revision,'state',state,'publishedAt',published_at,'acceptedAt',accepted_at,'selectedVariantId',selected_variant_id,'validUntil',document->>'validUntil',
 'expired',(document->>'validUntil')::date<(clock_timestamp() at time zone 'Europe/Warsaw')::date,
 'grossCents',(select v->'grossCents' from jsonb_array_elements(snapshot->'variants') v where v->>'id'=coalesce(selected_variant_id::text,snapshot->>'mainVariantId'))) order by published_at desc,id)
 from (select * from public.offer_publications where customer_id=p_customer order by published_at desc,id limit 20 offset(p_page-1)*20) p),'[]'));
end;$$;
create function public.portal_offer(p_customer uuid,p_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 perform public.portal_assert_customer(p_customer);
 if public.current_access()->>'role' not in ('admin','office','client') then raise exception 'Forbidden role' using errcode='42501';end if;
 if not exists(select 1 from public.offer_publications where id=p_id and customer_id=p_customer) then return null;end if;
 return public.offer_publication_json(p_id);
end;$$;
create function public.offer_publication_pdf(p_customer uuid,p_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 perform public.portal_assert_customer(p_customer);
 if public.current_access()->>'role' not in ('admin','office','client') then raise exception 'Forbidden role' using errcode='42501';end if;
 return (select jsonb_build_object('number',p.snapshot->>'number','revision',p.revision,'base64',encode(f.pdf,'base64')) from public.offer_publications p join public.offer_publication_files f on f.id=p.id where p.id=p_id and p.customer_id=p_customer);
end;$$;
create function public.accept_offer_publication(p_customer uuid,p_id uuid,p_variant uuid,p_confirm boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare target uuid; p public.offer_publications;
begin
 perform public.portal_assert_customer(p_customer);
 if public.current_access()->>'role' not in ('admin','office','client') then raise exception 'Forbidden role' using errcode='42501';end if;
 if public.current_access()->>'role' is distinct from 'client' or not public.is_customer_member(p_customer) then raise exception 'Client account required' using errcode='42501';end if;
 if p_confirm is distinct from true then raise exception 'Confirmation required' using errcode='22023';end if;
 select offer_id into target from public.offer_publications where id=p_id and customer_id=p_customer;
 if target is null then raise exception 'Missing offer' using errcode='42501';end if;
 perform 1 from public.offers where id=target for update;
 perform public.portal_assert_customer(p_customer);
 if public.current_access()->>'role' is distinct from 'client' then raise exception 'Client account required' using errcode='42501';end if;
 select * into p from public.offer_publications where id=p_id for update;
 if p.state='accepted' and p.selected_variant_id=p_variant then return public.offer_publication_json(p_id);end if;
 if p.state<>'published' or (p.document->>'validUntil')::date<(clock_timestamp() at time zone 'Europe/Warsaw')::date
 or (p.document->>'issuedOn')::date>(clock_timestamp() at time zone 'Europe/Warsaw')::date
 or not exists(select 1 from public.customers where id=p_customer and archived_at is null) then raise exception 'Offer unavailable' using errcode='40001';end if;
 if p_variant is null or not exists(select 1 from jsonb_array_elements(p.snapshot->'variants') v where v->>'id'=p_variant::text) then raise exception 'Invalid variant' using errcode='22023';end if;
 update public.offer_publications set state='accepted',selected_variant_id=p_variant,accepted_by=auth.uid(),accepted_at=clock_timestamp() where id=p_id;
 return public.offer_publication_json(p_id);
end;$$;
create function public.offer_publication_summaries(p_offers uuid[]) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 if p_offers is null or cardinality(p_offers)>25 then raise exception 'Invalid selection' using errcode='22023';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('offerId',offer_id,'state',state,'revision',revision,'selectedVariantId',selected_variant_id,'selectedVariantName',(select v->>'name' from jsonb_array_elements(snapshot->'variants') v where v->>'id'=selected_variant_id::text),'netCents',(select v->'netCents' from jsonb_array_elements(snapshot->'variants') v where v->>'id'=selected_variant_id::text),'grossCents',(select v->'grossCents' from jsonb_array_elements(snapshot->'variants') v where v->>'id'=selected_variant_id::text))) from
 (select distinct on(offer_id) offer_id,state,revision,selected_variant_id,snapshot from public.offer_publications where offer_id=any(p_offers) order by offer_id,revision desc) p),'[]');
end;$$;
do $$declare f record;begin
 for f in select oid from pg_proc where pronamespace='public'::regnamespace and proname in ('offer_customer_snapshot','offer_publication_json','staff_offer_publications','publish_offer','withdraw_offer_publication','portal_offers','portal_offer','offer_publication_pdf','accept_offer_publication','offer_publication_summaries') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);
 end loop;
end;$$;
grant execute on function public.staff_offer_publications(uuid),public.publish_offer(uuid,uuid,integer,integer,text),public.withdraw_offer_publication(uuid),public.portal_offers(uuid,integer),public.portal_offer(uuid,uuid),public.offer_publication_pdf(uuid,uuid),public.accept_offer_publication(uuid,uuid,uuid,boolean),public.offer_publication_summaries(uuid[]) to authenticated;
