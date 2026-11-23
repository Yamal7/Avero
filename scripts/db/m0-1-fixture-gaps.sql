-- M0.1 — rekordy w tabelach, których odtworzone testy pgTAP nie zostawiają (tylko lokalna baza).
-- Każda tabela w `public` ma po tym co najmniej jeden wiersz, więc test liczności sprawdza wszystkie.
begin;
insert into public.notification_email_preferences(user_id,enabled,enabled_at)
select user_id,true,now() from public.app_notifications group by user_id order by user_id limit 2;
insert into public.notification_email_queue(notification_id,user_id,recipient,category,state)
select n.id,n.user_id,coalesce(u.email,'fixture@example.invalid'),n.category,'local'
from public.app_notifications n join auth.users u on u.id=n.user_id order by n.created_at,n.id limit 3;
insert into public.notification_logs(maintenance_plan_id,due_on,channel,status)
select id,current_date,'email','sent' from public.maintenance_plans order by id limit 2;
insert into public.sales_inquiries(customer_id,message)
select id,'Zapytanie z testu liczności M0.1' from public.customers order by id limit 3;
insert into public.service_measurements(id,ticket_id,position,parameter,norm,before_value,after_value)
select gen_random_uuid(),id,0,'Ciśnienie ssania','6–8 bar','6,1','6,4' from public.service_tickets order by id limit 3;
commit;
