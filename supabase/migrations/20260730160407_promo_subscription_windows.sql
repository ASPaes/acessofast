-- AcessoFast — promo_subscription_windows (desconto por N meses no mensal)
--
-- POR QUE ISSO EXISTE
-- O checkout do Asaas nao tem objeto de desconto: o `subscription` aceita so
-- cycle/nextDueDate/endDate, e o unico jeito de cobrar menos e baixar
-- items[].value. Isso resolve dois casos e deixa um de fora:
--
--   anual  (DETACHED/INSTALLMENT) -> cobranca unica, o desconto no value ja e
--                                    o comportamento final. discount_months nao
--                                    se aplica: um pagamento cobre os 12 meses.
--   mensal com discount_months null -> "todas as cobrancas enquanto durar".
--                                    Baixar o value e exatamente isso.
--   mensal com discount_months = N -> o Asaas cobraria o valor com desconto
--                                    PARA SEMPRE. E este caso que a janela
--                                    abaixo resolve.
--
-- COMO FUNCIONA
-- A create-checkout-prod abre uma janela quando o voucher tem desconto por N
-- meses num plano mensal. A asaas-webhook-prod conta as cobrancas pagas da
-- assinatura e, ao chegar em N, faz PUT /v3/subscriptions/{id} com o valor
-- cheio e updatePendingPayments=true (para corrigir tambem a cobranca N+1 que
-- o Asaas ja tenha gerado). A partir dai a assinatura segue no preco de tabela.
--
-- A contagem e por asaas_payment_id, nao por evento: PAYMENT_CONFIRMED e
-- PAYMENT_RECEIVED chegam para a MESMA cobranca e contariam em dobro.

-- ---------------------------------------------------------------------
-- 1. Janela de desconto de uma assinatura
-- ---------------------------------------------------------------------
create table if not exists public.promo_subscription_windows (
  id                      uuid primary key default gen_random_uuid(),
  redemption_id           uuid not null
                            references public.promo_code_redemptions(id) on delete cascade,
  -- No checkout ainda nao existe assinatura no Asaas: ela nasce quando a
  -- primeira cobranca e paga. Ate la a janela se identifica pelo intent.
  signup_intent_id        uuid references public.signup_intents(id) on delete set null,
  asaas_subscription_id   text,
  environment             text not null default 'production',

  full_value_cents        integer not null check (full_value_cents > 0),
  discounted_value_cents  integer not null check (discounted_value_cents > 0),
  discount_months         integer not null check (discount_months >= 1),

  payments_counted        integer not null default 0 check (payments_counted >= 0),
  status                  text not null default 'pending_link'
                            check (status in ('pending_link','active','restored','failed','cancelled')),

  -- Tentativas do PUT no Asaas. O sweep desiste depois de MAX_ATTEMPTS.
  attempts                integer not null default 0,
  last_error              text,
  restored_at             timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint ck_promo_window_desconto
    check (discounted_value_cents < full_value_cents)
);

-- Uma assinatura tem no maximo uma janela.
create unique index if not exists uq_promo_window_subscription
  on public.promo_subscription_windows(asaas_subscription_id)
  where asaas_subscription_id is not null;

create index if not exists idx_promo_window_abertas
  on public.promo_subscription_windows(status, updated_at)
  where status in ('pending_link','active');

create index if not exists idx_promo_window_intent
  on public.promo_subscription_windows(signup_intent_id)
  where signup_intent_id is not null;

comment on table public.promo_subscription_windows is
  'Desconto de voucher por N meses numa assinatura mensal do Asaas. Ao atingir N cobrancas pagas o valor cheio e restaurado via PUT /v3/subscriptions.';
comment on column public.promo_subscription_windows.status is
  'pending_link = criada no checkout, sem assinatura ainda. active = amarrada, contando. restored = valor cheio devolvido. failed = desistiu apos varias tentativas. cancelled = manual.';

-- ---------------------------------------------------------------------
-- 2. Cobrancas ja contadas — a PK e a idempotencia
-- ---------------------------------------------------------------------
create table if not exists public.promo_window_payments (
  window_id         uuid not null
                      references public.promo_subscription_windows(id) on delete cascade,
  asaas_payment_id  text not null,
  counted_at        timestamptz not null default now(),
  primary key (window_id, asaas_payment_id)
);

comment on table public.promo_window_payments is
  'Cobrancas ja contadas numa janela. A PK impede que CONFIRMED e RECEIVED da mesma cobranca contem duas vezes.';

drop trigger if exists set_updated_at on public.promo_subscription_windows;
create trigger set_updated_at before update on public.promo_subscription_windows
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. promo_window_open — chamada pela create-checkout-prod
-- ---------------------------------------------------------------------
create or replace function public.promo_window_open(
  p_redemption_id           uuid,
  p_signup_intent_id        uuid,
  p_full_value_cents        integer,
  p_discounted_value_cents  integer,
  p_discount_months         integer,
  p_environment             text default 'production'
) returns uuid
language plpgsql
volatile
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_id uuid;
begin
  insert into public.promo_subscription_windows (
    redemption_id, signup_intent_id, full_value_cents,
    discounted_value_cents, discount_months, environment
  ) values (
    p_redemption_id, p_signup_intent_id, p_full_value_cents,
    p_discounted_value_cents, p_discount_months, coalesce(p_environment, 'production')
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. promo_window_register_payment — chamada pela asaas-webhook-prod
-- ---------------------------------------------------------------------
-- Amarra a janela a assinatura na primeira cobranca, conta a cobranca (uma vez
-- so, por asaas_payment_id) e diz se ja e hora de devolver o preco cheio.
-- Nao devolve linha nenhuma quando nao ha janela: o webhook simplesmente segue.
create or replace function public.promo_window_register_payment(
  p_signup_intent_id  uuid,
  p_subscription_id   text,
  p_payment_id        text
) returns table (
  window_id         uuid,
  needs_restore     boolean,
  full_value_cents  integer
)
language plpgsql
volatile
security definer
set search_path = public, private, pg_temp
as $$
declare
  w         public.promo_subscription_windows;
  v_novo    boolean;
begin
  if p_subscription_id is null or p_payment_id is null then
    return;
  end if;

  -- Janela ja amarrada a esta assinatura (2a cobranca em diante).
  select * into w
    from public.promo_subscription_windows
   where asaas_subscription_id = p_subscription_id
   for update;

  -- Primeira cobranca: a assinatura acabou de nascer, amarra pelo intent.
  if w.id is null and p_signup_intent_id is not null then
    select * into w
      from public.promo_subscription_windows
     where signup_intent_id = p_signup_intent_id
       and asaas_subscription_id is null
       and status = 'pending_link'
     for update;

    if w.id is not null then
      update public.promo_subscription_windows
         set asaas_subscription_id = p_subscription_id,
             status = 'active'
       where id = w.id
      returning * into w;
    end if;
  end if;

  if w.id is null then
    return;
  end if;

  -- restored / failed / cancelled: nao conta mais nada.
  if w.status <> 'active' then
    return;
  end if;

  insert into public.promo_window_payments (window_id, asaas_payment_id)
  values (w.id, p_payment_id)
  on conflict do nothing;
  v_novo := found;

  if v_novo then
    update public.promo_subscription_windows
       set payments_counted = payments_counted + 1
     where id = w.id
    returning * into w;
  end if;

  return query
    select w.id, (w.payments_counted >= w.discount_months), w.full_value_cents;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. Desfecho do PUT no Asaas
-- ---------------------------------------------------------------------
create or replace function public.promo_window_mark_restored(p_window_id uuid)
returns void
language sql
volatile
security definer
set search_path = public, private, pg_temp
as $$
  update public.promo_subscription_windows
     set status = 'restored', restored_at = now(), last_error = null
   where id = p_window_id;
$$;

-- Nao muda o status: a janela continua 'active' para o proximo evento (ou o
-- sweep) tentar de novo. So vira 'failed' quando estoura o teto de tentativas.
create or replace function public.promo_window_mark_failed(
  p_window_id     uuid,
  p_error         text,
  p_max_attempts  integer default 10
) returns void
language plpgsql
volatile
security definer
set search_path = public, private, pg_temp
as $$
begin
  update public.promo_subscription_windows
     set attempts    = attempts + 1,
         last_error  = left(coalesce(p_error, ''), 500),
         status      = case when attempts + 1 >= p_max_attempts then 'failed' else status end
   where id = p_window_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 6. promo_windows_due_restore — rede de seguranca (promo-restore-sweep)
-- ---------------------------------------------------------------------
-- Janelas que ja bateram o numero de cobrancas mas cujo PUT nao completou.
-- No caminho feliz isto volta vazio: o webhook restaura na hora.
create or replace function public.promo_windows_due_restore(
  p_limit integer default 50
) returns table (
  window_id             uuid,
  asaas_subscription_id text,
  full_value_cents      integer,
  attempts              integer
)
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select w.id, w.asaas_subscription_id, w.full_value_cents, w.attempts
    from public.promo_subscription_windows w
   where w.status = 'active'
     and w.asaas_subscription_id is not null
     and w.payments_counted >= w.discount_months
   order by w.updated_at
   limit greatest(coalesce(p_limit, 50), 1);
$$;

-- ---------------------------------------------------------------------
-- 7. RLS e grants — mesmo criterio das outras tabelas de voucher
-- ---------------------------------------------------------------------
alter table public.promo_subscription_windows enable row level security;
alter table public.promo_window_payments      enable row level security;

drop policy if exists promo_windows_select on public.promo_subscription_windows;
create policy promo_windows_select on public.promo_subscription_windows
  for select to authenticated
  using ( private.is_super_admin() );

drop policy if exists promo_window_payments_select on public.promo_window_payments;
create policy promo_window_payments_select on public.promo_window_payments
  for select to authenticated
  using ( private.is_super_admin() );

grant select on public.promo_subscription_windows to authenticated;
grant select on public.promo_window_payments      to authenticated;

revoke insert, update, delete, truncate, references, trigger
  on public.promo_subscription_windows, public.promo_window_payments
  from authenticated;

revoke all on public.promo_subscription_windows from anon;
revoke all on public.promo_window_payments      from anon;

-- Tudo aqui e backend. Nem o visitante nem o app logado chamam.
revoke all on function public.promo_window_open(uuid, uuid, integer, integer, integer, text) from public, anon, authenticated;
revoke all on function public.promo_window_register_payment(uuid, text, text)                from public, anon, authenticated;
revoke all on function public.promo_window_mark_restored(uuid)                               from public, anon, authenticated;
revoke all on function public.promo_window_mark_failed(uuid, text, integer)                  from public, anon, authenticated;
revoke all on function public.promo_windows_due_restore(integer)                             from public, anon, authenticated;

grant execute on function public.promo_window_open(uuid, uuid, integer, integer, integer, text) to service_role;
grant execute on function public.promo_window_register_payment(uuid, text, text)                to service_role;
grant execute on function public.promo_window_mark_restored(uuid)                               to service_role;
grant execute on function public.promo_window_mark_failed(uuid, text, integer)                  to service_role;
grant execute on function public.promo_windows_due_restore(integer)                             to service_role;
