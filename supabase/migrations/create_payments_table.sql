-- ============================================================
-- MIGRACIÓN: Tabla de Cobros (payments)
-- Correr en: Supabase → SQL Editor → New Query
--
-- Columna dueño: user_id (alineada con patients, consultations, etc.)
-- Si ya tenías nutritionist_id, ejecutá antes:
--   supabase/migrations/unify_owner_column_to_user_id.sql
-- ============================================================

create table if not exists public.payments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  patient_id        uuid references public.patients(id) on delete set null,
  patient_name      text not null,
  patient_email     text not null default '',
  description       text not null,
  amount            numeric(12, 2) not null default 0,
  currency          text not null default 'ARS',
  status            text not null default 'pending' check (status in ('pending', 'paid', 'partial', 'cancelled')),
  method            text not null default 'cash' check (method in ('cash', 'transfer', 'card', 'mercadopago')),
  notes             text not null default '',
  paid_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_patient_id_idx on public.payments(patient_id);
create index if not exists payments_status_idx on public.payments(status);
create index if not exists payments_created_at_idx on public.payments(created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at
  before update on public.payments
  for each row execute procedure public.set_updated_at();

alter table public.payments enable row level security;

drop policy if exists "nutritionist_own_payments" on public.payments;
drop policy if exists "payments_owner_all" on public.payments;
create policy "payments_owner_all"
  on public.payments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
