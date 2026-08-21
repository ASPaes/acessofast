-- AcessoFast — oferta de lancamento passa a ter PRAZO (12 meses)
--
-- A versao anterior tratava o preco de lancamento como definitivo para quem
-- entrasse entre as primeiras empresas. A regra mudou: o valor promocional vale
-- pelos N primeiros meses e depois a assinatura volta ao preco de tabela.
--
-- No ANUAL nada muda: a cobranca e unica e ja cobre 12 meses, entao o desconto
-- se esgota sozinho quando o periodo acaba.
--
-- No MENSAL o Asaas cobraria o valor reduzido para sempre — e exatamente o
-- problema que public.promo_subscription_windows ja resolve para o voucher com
-- discount_months. Em vez de criar um segundo mecanismo, a oferta de lancamento
-- passa a abrir uma janela igual; a unica coisa que impedia isso era a janela
-- exigir um resgate de voucher.

-- ---------------------------------------------------------------------
-- 1. Janela sem voucher
-- ---------------------------------------------------------------------
-- redemption_id continua sendo a procedencia quando o desconto veio de um
-- voucher; null passa a significar "desconto da oferta de lancamento". A janela
-- nunca dependeu dele para funcionar: quem a encontra e o signup_intent_id (no
-- primeiro pagamento) e o asaas_subscription_id (nos seguintes).
alter table public.promo_subscription_windows
  alter column redemption_id drop not null;

comment on column public.promo_subscription_windows.redemption_id is
  'Resgate de voucher que originou o desconto. NULL = desconto da oferta de lancamento (public.launch_offer), que nao passa por voucher.';

-- ---------------------------------------------------------------------
-- 2. Prazo configuravel na oferta
-- ---------------------------------------------------------------------
alter table public.launch_offer
  add column if not exists discount_months integer default 12
    check (discount_months is null or discount_months >= 1);

comment on column public.launch_offer.discount_months is
  'Meses de cobranca com o preco de lancamento no plano mensal. NULL = enquanto a assinatura durar. No anual nao se aplica: a cobranca unica ja cobre o periodo.';

-- ---------------------------------------------------------------------
-- 3. launch_offer_status devolve o prazo
-- ---------------------------------------------------------------------
-- Trocar o retorno de uma function que devolve table exige recriar.
drop function if exists public.launch_offer_status();

create or replace function public.launch_offer_status()
returns table (
  is_active        boolean,
  discount_percent integer,
  discount_months  integer,
  slots_total      integer,
  slots_taken      integer,
  slots_left       integer
)
language plpgsql
stable
security definer
set search_path = public, private, pg_temp
as $$
declare
  o      public.launch_offer;
  v_take integer;
  v_left integer;
begin
  select * into o from public.launch_offer where id;

  if o.id is null then
    return query select false, 0, null::integer, 0, 0, 0;
    return;
  end if;

  v_take := private.launch_offer_taken();
  v_left := greatest(o.slots_total - v_take, 0);

  return query select
    (o.is_active and v_left > 0),
    o.discount_percent,
    o.discount_months,
    o.slots_total,
    least(v_take, o.slots_total),
    v_left;
end;
$$;

revoke all on function public.launch_offer_status() from public;
grant execute on function public.launch_offer_status() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- 4. set_launch_offer ganha o prazo
-- ---------------------------------------------------------------------
-- p_clear_discount_months existe porque null em p_discount_months significa
-- "nao mexe"; sem a flag nao haveria como voltar o prazo para "sem prazo".
create or replace function public.set_launch_offer(
  p_is_active              boolean default null,
  p_discount_percent       integer default null,
  p_slots_total            integer default null,
  p_manual_taken           integer default null,
  p_discount_months        integer default null,
  p_clear_discount_months  boolean default false
) returns public.launch_offer
language plpgsql
volatile
security definer
set search_path = public, private, pg_temp
as $$
declare
  o public.launch_offer;
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.launch_offer
     set is_active        = coalesce(p_is_active, is_active),
         discount_percent = coalesce(p_discount_percent, discount_percent),
         slots_total      = coalesce(p_slots_total, slots_total),
         manual_taken     = coalesce(p_manual_taken, manual_taken),
         discount_months  = case
                              when p_clear_discount_months then null
                              else coalesce(p_discount_months, discount_months)
                            end
   where id
  returning * into o;

  return o;
end;
$$;

-- A assinatura antiga (4 argumentos) some com a nova; refazer os grants.
drop function if exists public.set_launch_offer(boolean, integer, integer, integer);

revoke all on function public.set_launch_offer(boolean, integer, integer, integer, integer, boolean)
  from public, anon;
grant execute on function public.set_launch_offer(boolean, integer, integer, integer, integer, boolean)
  to authenticated;
