-- Store only bounded PNG snapshots; never fetch remote assets during document rendering.
create function public.valid_company_logo(p_logo text) returns boolean language plpgsql immutable set search_path='' as $$
declare bytes bytea;w bigint;h bigint;begin
 if p_logo is null or length(p_logo)>90000 or p_logo!~'^data:image/png;base64,[A-Za-z0-9+/]+={0,2}$' then return false;end if;
 bytes:=decode(substring(p_logo from 23),'base64');
 if octet_length(bytes) not between 45 and 65536 or encode(substring(bytes from 1 for 8),'hex')<>'89504e470d0a1a0a' or encode(substring(bytes from 9 for 8),'hex')<>'0000000d49484452' or encode(substring(bytes from octet_length(bytes)-11),'hex')<>'0000000049454e44ae426082' then return false;end if;
 w:=get_byte(bytes,16)::bigint*16777216+get_byte(bytes,17)*65536+get_byte(bytes,18)*256+get_byte(bytes,19);h:=get_byte(bytes,20)::bigint*16777216+get_byte(bytes,21)*65536+get_byte(bytes,22)*256+get_byte(bytes,23);
 return w between 1 and 512 and h between 1 and 512 and get_byte(bytes,24)=8 and get_byte(bytes,25) in(2,6) and get_byte(bytes,26)=0 and get_byte(bytes,27)=0 and get_byte(bytes,28)=0;
 exception when others then return false;
end;$$;
create or replace function public.validate_offer_document(p_data jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare k text; v text; lim integer;
begin
 if p_data?'logoPng' then
  if jsonb_typeof(p_data->'logoPng') is distinct from 'string' or not public.valid_company_logo(p_data->>'logoPng') then return false;end if;
  p_data:=p_data-'logoPng';
 end if;
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

create table public.company_profiles(singleton boolean primary key default true check(singleton),data jsonb not null,version integer not null default 0,updated_at timestamptz not null default now());
alter table public.company_profiles enable row level security;
revoke all on public.company_profiles from public,anon,authenticated;
-- A singleton's boolean key does not fit audit_crm_change's UUID row_id.
create function public.audit_company_profile() returns trigger language plpgsql security definer set search_path='' as $$begin
 insert into public.audit_logs(table_name,row_id,action,actor_id,old_data,new_data) values('company_profiles','00000000-0000-4000-8000-000000000021',TG_OP,auth.uid(),case when TG_OP='UPDATE' then to_jsonb(OLD)-'data' else null end,to_jsonb(NEW)-'data');return NEW;
end;$$;
create trigger company_profile_audit after insert or update on public.company_profiles for each row execute function public.audit_company_profile();
create function public.company_profile() returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 return(select jsonb_build_object('version',version,'data',data) from public.company_profiles where singleton);
end;$$;
create function public.save_company_profile(p_version integer,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare current public.company_profiles%rowtype;begin
 perform public.service_write_lock();
 if not public.is_admin() then raise exception 'Admin required' using errcode='42501';end if;
 if p_version<0 or p_version>2147483646 or jsonb_typeof(p_data->'validityDays') is distinct from 'number' or p_data->>'validityDays'!~'^[0-9]{1,3}$' or (p_data->>'validityDays')::integer not between 1 and 365 or not coalesce(public.validate_offer_document((p_data-'validityDays')||'{"issuedOn":"2026-01-01","validUntil":"2026-01-02"}'),false) or p_data?'issuedOn' or p_data?'validUntil' then raise exception 'Invalid company profile' using errcode='22023';end if;
 select * into current from public.company_profiles where singleton for update;
 if found then
  if current.data=p_data and (p_version=current.version or p_version=current.version-1 or p_version is null and current.version=0) then return public.company_profile();end if;
  if p_version is distinct from current.version then raise exception 'Stale company profile' using errcode='40001';end if;
  update public.company_profiles set data=p_data,version=version+1,updated_at=now() where singleton;
 else
  if p_version is not null then raise exception 'Missing company profile' using errcode='40001';end if;
  insert into public.company_profiles(data) values(p_data);
 end if;
 return public.company_profile();
end;$$;
revoke all on function public.valid_company_logo(text),public.audit_company_profile(),public.company_profile(),public.save_company_profile(integer,jsonb) from public,anon,authenticated;
grant execute on function public.company_profile(),public.save_company_profile(integer,jsonb) to authenticated;
