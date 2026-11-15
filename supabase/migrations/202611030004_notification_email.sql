create table public.notification_email_preferences(user_id uuid primary key references auth.users(id),enabled boolean not null default false,enabled_at timestamptz,next_scan_at timestamptz not null default now(),version integer not null default 0);
create table public.notification_email_queue(id uuid primary key default gen_random_uuid(),notification_id uuid not null unique references public.app_notifications(id),user_id uuid not null references auth.users(id),recipient text not null,category text not null,state text not null default 'queued' check(state in('queued','sending','retry','accepted','delivered','bounced','failed','cancelled','uncertain','local')),attempts integer not null default 0,created_at timestamptz not null default now(),next_attempt_at timestamptz not null default now(),first_attempt_at timestamptz,lease uuid,lease_until timestamptz,transport text,sender text,app_url text,payload jsonb,provider_id text,last_error text,accepted_at timestamptz,delivered_at timestamptz,next_check_at timestamptz);
create index notification_email_pending on public.notification_email_queue(state,next_attempt_at);
alter table public.notification_email_preferences enable row level security;
alter table public.notification_email_queue enable row level security;
revoke all on public.notification_email_preferences,public.notification_email_queue from public,anon,authenticated;
create function public.my_email_notifications(p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$declare result jsonb;begin
 perform public.assert_notification_staff();if p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid page' using errcode='22023';end if;
 with visible as materialized(select q.* from public.notification_email_queue q join public.app_notifications n on n.id=q.notification_id join public.notification_sources() s on s.source_id=n.source_id and s.category=n.category where q.user_id=auth.uid()),paged as(select * from visible order by created_at desc,id desc limit 20 offset(p_page-1)*20)
 select jsonb_build_object('viewerId',auth.uid(),'enabled',coalesce((select enabled from public.notification_email_preferences where user_id=auth.uid()),false),'version',(select version from public.notification_email_preferences where user_id=auth.uid()),'total',(select count(*) from visible),'items',coalesce((select jsonb_agg(jsonb_build_object('id',id,'category',category,'state',state,'attempts',attempts,'createdAt',created_at,'nextAttemptAt',case when state in('queued','retry') then next_attempt_at else null end,'acceptedAt',accepted_at,'deliveredAt',delivered_at,'reason',last_error) order by created_at desc,id desc) from paged),'[]')) into result;return result;
end;$$;
create function public.save_my_email_notifications(p_enabled boolean,p_version integer) returns jsonb language plpgsql security definer set search_path='' as $$declare r public.notification_email_preferences%rowtype;begin
 perform public.assert_notification_staff();perform pg_advisory_xact_lock(hashtextextended('notifications:'||auth.uid()::text,0));
 if p_enabled is null or p_version<0 or p_version>2147483646 then raise exception 'Invalid email preference' using errcode='22023';end if;
 if p_enabled and not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null and email is not null) then raise exception 'Verified email required' using errcode='22023';end if;
 select * into r from public.notification_email_preferences where user_id=auth.uid() for update;
 if found then
  if r.enabled=p_enabled and (p_version in(r.version,r.version-1) or p_version is null and r.version=0) then return public.my_email_notifications();end if;
  if p_version is distinct from r.version then raise exception 'Stale preference' using errcode='40001';end if;
  update public.notification_email_preferences set enabled=p_enabled,enabled_at=case when p_enabled then now() else enabled_at end,next_scan_at=now(),version=version+1 where user_id=auth.uid();
 else
  if p_version is not null then raise exception 'Missing preference' using errcode='40001';end if;
  insert into public.notification_email_preferences(user_id,enabled,enabled_at) values(auth.uid(),p_enabled,case when p_enabled then now() end);
 end if;
 if not p_enabled then update public.notification_email_queue set state='cancelled',last_error='disabled' where user_id=auth.uid() and state in('queued','retry');end if;
 return public.my_email_notifications();
end;$$;
create function public.assert_email_worker() returns void language plpgsql stable security definer set search_path='' as $$begin
 if auth.role() is distinct from 'service_role' then raise exception 'Worker required' using errcode='42501';end if;
end;$$;
-- The worker impersonates only the recipient for the existing scoped source projection.
create function public.email_job_eligible(p_id uuid) returns boolean language plpgsql stable security definer set search_path='' as $$declare q public.notification_email_queue%rowtype;old_sub text;result boolean;begin
 select * into q from public.notification_email_queue where id=p_id;if not found then return false;end if;
 if not public.account_enabled(q.user_id) or not exists(select 1 from public.staff_users where user_id=q.user_id and role in('admin','office','technician')) or not exists(select 1 from auth.users where id=q.user_id and email_confirmed_at is not null and lower(email)=lower(q.recipient)) or not exists(select 1 from public.notification_email_preferences where user_id=q.user_id and enabled) then return false;end if;
 old_sub:=current_setting('request.jwt.claim.sub',true);perform set_config('request.jwt.claim.sub',q.user_id::text,true);
 select exists(select 1 from public.app_notifications n join public.notification_sources() s on s.source_id=n.source_id and s.category=n.category and s.event_key=n.event_key where n.id=q.notification_id and n.user_id=q.user_id and s.active and not (n.read_at is not null) and (public.my_notification_preferences()->>n.category)::boolean) into result;
 perform set_config('request.jwt.claim.sub',coalesce(old_sub,''),true);return result;
end;$$;
create function public.prepare_notification_emails(p_allowed text[]) returns integer language plpgsql security definer set search_path='' as $$declare u record;old_sub text;added integer:=0;n integer;begin
 perform public.assert_email_worker();if coalesce(cardinality(p_allowed),0) not between 1 and 100 then raise exception 'Explicit recipients required' using errcode='22023';end if;
 old_sub:=current_setting('request.jwt.claim.sub',true);
 for u in select p.user_id,p.enabled_at,a.email from public.notification_email_preferences p join auth.users a on a.id=p.user_id join public.staff_users s on s.user_id=p.user_id where p.enabled and p.next_scan_at<=now() and public.account_enabled(p.user_id) and a.email_confirmed_at is not null and lower(a.email)=any(p_allowed) and s.role in('admin','office','technician') order by p.next_scan_at,p.user_id limit 20 loop
  if not pg_try_advisory_xact_lock(hashtextextended('notifications:'||u.user_id::text,0)) then continue;end if;
  perform set_config('request.jwt.claim.sub',u.user_id::text,true);perform public.sync_my_notifications();
  insert into public.notification_email_queue(notification_id,user_id,recipient,category)
  select n.id,u.user_id,u.email,n.category from public.app_notifications n join public.notification_sources() s on s.source_id=n.source_id and s.category=n.category and s.event_key=n.event_key where n.user_id=u.user_id and n.created_at>=u.enabled_at and n.read_at is null and s.active and (public.my_notification_preferences()->>n.category)::boolean and not exists(select 1 from public.notification_email_queue q where q.notification_id=n.id) order by n.created_at,n.id limit 200 on conflict(notification_id) do nothing;
  get diagnostics n=row_count;added:=added+n;update public.notification_email_preferences set next_scan_at=now()+interval '1 minute' where user_id=u.user_id;
 end loop;
 perform set_config('request.jwt.claim.sub',coalesce(old_sub,''),true);return added;
end;$$;
create function public.claim_notification_email(p_transport text,p_sender text,p_app_url text,p_allowed text[]) returns jsonb language plpgsql security definer set search_path='' as $$declare q public.notification_email_queue%rowtype;i integer:=0;begin
 perform public.assert_email_worker();if p_transport not in('local','resend') or p_transport is null or p_sender is null or length(p_sender)>200 or p_app_url is null or length(p_app_url)>200 or coalesce(cardinality(p_allowed),0) not between 1 and 100 then raise exception 'Invalid worker configuration' using errcode='22023';end if;
 update public.notification_email_queue set state=case when transport='resend' and attempts<5 and first_attempt_at>now()-interval '20 hours' then 'retry' else 'uncertain' end,last_error='lease_expired' where state='sending' and lease_until<now();
 loop
  i:=i+1;if i>30 then return null;end if;
  select * into q from public.notification_email_queue where state in('queued','retry') and next_attempt_at<=now() order by next_attempt_at,id limit 1 for update skip locked;
  if not found then return null;end if;
  if not public.email_job_eligible(q.id) or not(lower(q.recipient)=any(p_allowed)) or q.transport is not null and q.transport<>p_transport then update public.notification_email_queue set state='cancelled',last_error='ineligible' where id=q.id;continue;end if;
  if q.first_attempt_at is not null and (q.attempts>=5 or q.first_attempt_at<=now()-interval '20 hours') then update public.notification_email_queue set state='uncertain',last_error='retry_limit' where id=q.id;continue;end if;
  update public.notification_email_queue set state='sending',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),lease=gen_random_uuid(),lease_until=now()+interval '2 minutes',transport=coalesce(transport,p_transport),sender=coalesce(sender,p_sender),app_url=coalesce(app_url,p_app_url) where id=q.id returning * into q;
  return jsonb_build_object('id',q.id,'lease',q.lease,'recipient',q.recipient,'category',q.category,'sender',q.sender,'appUrl',q.app_url,'payload',q.payload);
 end loop;
end;$$;
create function public.bind_notification_email(p_id uuid,p_lease uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$declare q public.notification_email_queue%rowtype;begin
 perform public.assert_email_worker();select * into q from public.notification_email_queue where id=p_id for update;
 if not found or q.state<>'sending' or q.lease is distinct from p_lease or q.lease_until<now() then raise exception 'Lease unavailable' using errcode='40001';end if;
 if not public.email_job_eligible(q.id) then update public.notification_email_queue set state='cancelled',last_error='ineligible' where id=q.id;return null;end if;
 if q.payload is null then
  if not coalesce(public.offer_keys(p_payload,array['from','to','subject','text','html']),false) or octet_length(p_payload::text)>12000 or p_payload->>'from'<>q.sender or p_payload->'to'<>jsonb_build_array(q.recipient) then raise exception 'Invalid payload' using errcode='22023';end if;
  update public.notification_email_queue set payload=p_payload where id=q.id returning * into q;
 end if;return q.payload;
end;$$;
create function public.finish_notification_email(p_id uuid,p_lease uuid,p_outcome text,p_provider text default null,p_reason text default null) returns void language plpgsql security definer set search_path='' as $$declare q public.notification_email_queue%rowtype;begin
 perform public.assert_email_worker();if p_outcome is null or p_outcome not in('accepted','local','retry','failed','uncertain') or length(coalesce(p_provider,''))>200 or p_reason is not null and p_reason not in('transport_error','rate_limited','provider_rejected','invalid_response','payload_changed') then raise exception 'Invalid mail result' using errcode='22023';end if;
 select * into q from public.notification_email_queue where id=p_id for update;
 if not found or q.lease is distinct from p_lease then raise exception 'Lease conflict' using errcode='40001';end if;
 if q.state<>'sending' then return;end if;
 if p_outcome in('accepted','local') and coalesce(length(p_provider),0)=0 then raise exception 'Provider identity required' using errcode='22023';end if;
 update public.notification_email_queue set state=case when p_outcome='retry' and attempts>=5 then 'uncertain' else p_outcome end,provider_id=case when p_outcome in('accepted','local') then p_provider else provider_id end,last_error=p_reason,accepted_at=case when p_outcome in('accepted','local') then now() else accepted_at end,next_attempt_at=now()+make_interval(secs=>case attempts when 1 then 30 when 2 then 120 when 3 then 600 else 1800 end),next_check_at=case when p_outcome='accepted' then now()+interval '1 minute' else null end,lease_until=null where id=q.id;
end;$$;
create function public.notification_email_checks() returns jsonb language plpgsql security definer set search_path='' as $$declare items jsonb;begin
 perform public.assert_email_worker();
 with selected as(select id from public.notification_email_queue where state='accepted' and transport='resend' and next_check_at<=now() and accepted_at>now()-interval '24 hours' order by next_check_at,id limit 5 for update skip locked),claimed as(update public.notification_email_queue set next_check_at=now()+interval '2 minutes' where id in(select id from selected) returning id,provider_id,recipient)
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'providerId',provider_id,'recipient',recipient)),'[]') into items from claimed;return items;
end;$$;
create function public.finish_notification_email_check(p_id uuid,p_state text) returns void language plpgsql security definer set search_path='' as $$begin
 perform public.assert_email_worker();if p_state is null or p_state not in('accepted','delivered','bounced','failed') then raise exception 'Invalid delivery result' using errcode='22023';end if;
 update public.notification_email_queue set state=p_state,delivered_at=case when p_state='delivered' then now() else delivered_at end,next_check_at=case when p_state='accepted' then next_check_at else null end where id=p_id and state='accepted';
end;$$;
revoke all on function public.my_email_notifications(integer),public.save_my_email_notifications(boolean,integer),public.assert_email_worker(),public.email_job_eligible(uuid),public.prepare_notification_emails(text[]),public.claim_notification_email(text,text,text,text[]),public.bind_notification_email(uuid,uuid,jsonb),public.finish_notification_email(uuid,uuid,text,text,text),public.notification_email_checks(),public.finish_notification_email_check(uuid,text) from public,anon,authenticated;
grant execute on function public.my_email_notifications(integer),public.save_my_email_notifications(boolean,integer) to authenticated;
grant execute on function public.prepare_notification_emails(text[]),public.claim_notification_email(text,text,text,text[]),public.bind_notification_email(uuid,uuid,jsonb),public.finish_notification_email(uuid,uuid,text,text,text),public.notification_email_checks(),public.finish_notification_email_check(uuid,text) to service_role;
