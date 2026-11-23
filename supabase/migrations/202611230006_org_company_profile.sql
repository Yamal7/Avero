-- M0.1 Wielofirmowość (KRA-27), krok 6: profil firmy per organizacja + konto bankowe.
-- Dotychczasowy jedyny profil zostaje profilem Kranz HVACR (org_id z kroku 2). company_profile() i
-- save_company_profile działają dla aktywnej firmy dzięki org_isolation — zmienia się tylko klucz i walidacja.
alter table public.company_profiles drop constraint company_profiles_pkey, add constraint company_profiles_pkey primary key(org_id);

-- Numer rachunku: pusty albo IBAN (np. PL + 26 cyfr, spacje dozwolone) albo polski NRB (26 cyfr), z poprawną sumą
-- kontrolną mod 97. Tylko profil firmy — nie trafia do dokumentu oferty.
create function public.valid_bank_account(p_value text) returns boolean
language plpgsql immutable set search_path='' as $$
declare v text; moved text; digits text:=''; ch text;
begin
 if p_value is null or p_value<>trim(p_value) or length(p_value)>42 or p_value~'[[:cntrl:]]' then return false; end if;
 if p_value='' then return true; end if;
 v:=upper(replace(p_value,' ',''));
 if v~'^[0-9]{26}$' then v:='PL'||v; end if;
 if v!~'^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$' then return false; end if;
 moved:=substr(v,5)||substr(v,1,4);
 foreach ch in array regexp_split_to_array(moved,'') loop
  digits:=digits||case when ch~'[A-Z]' then (ascii(ch)-55)::text else ch end;
 end loop;
 return digits::numeric % 97 = 1;
end $$;

create or replace function public.save_company_profile(p_version integer, p_data jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare current public.company_profiles%rowtype;begin
 perform public.service_write_lock();
 if not public.is_admin() then raise exception 'Admin required' using errcode='42501';end if;
 if p_version<0 or p_version>2147483646 or jsonb_typeof(p_data->'validityDays') is distinct from 'number' or p_data->>'validityDays'!~'^[0-9]{1,3}$' or (p_data->>'validityDays')::integer not between 1 and 365
 or p_data?'bankAccount' and (jsonb_typeof(p_data->'bankAccount') is distinct from 'string' or not public.valid_bank_account(p_data->>'bankAccount'))
 or not coalesce(public.validate_offer_document((p_data-'validityDays'-'bankAccount')||'{"issuedOn":"2026-01-01","validUntil":"2026-01-02"}'),false) or p_data?'issuedOn' or p_data?'validUntil' then raise exception 'Invalid company profile' using errcode='22023';end if;
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
