-- Karta firmy from the design: tax id (NIP) and payment terms shown in the details panel.
alter table public.customers
  add column tax_id text check(tax_id is null or length(tax_id) between 1 and 40),
  add column payment_terms text check(payment_terms is null or length(payment_terms) between 1 and 80);
