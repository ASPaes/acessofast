-- AcessoFast — oferta de lancamento (preco reduzido para as N primeiras empresas)
--
-- O preco de tabela continua em public.plans, intacto. A oferta e um DESCONTO
-- aplicado por cima dele enquanto houver vaga, em dois lugares que precisam
-- concordar:
--   1. o site comercial, que mostra o preco com desconto e a barra de vagas;
--   2. a create-checkout-prod, que cobra esse mesmo valor no Asaas.
-- Por isso o calculo do desconto e a contagem de vagas vivem AQUI, numa RPC so,
-- e nao duplicados nos dois lados.
--
-- Quando as vagas acabam (ou is_active vira false) nada mais precisa ser feito:
-- launch_offer_status devolve is_active=false, o site volta a mostrar o preco
-- cheio e o checkout volta a cobrar cheio. Quem ja assinou mantem o valor com
-- que a assinatura foi criada no Asaas — o desconto de lancamento e definitivo
-- para as primeiras empresas, sem janela de restauracao (ao contrario do
-- desconto de voucher, que tem promo_subscription_windows).

-- ---------------------------------------------------------------------
-- 1. launch_offer — linha unica de configuracao
-- ---------------------------------------------------------------------
create table if not exists public.launch_offer (
  -- Singleton: id e sempre true, entao so existe uma linha possivel.
  id                boolean primary key default true check (id),

  discount_percent  integer not null default 30
                      check (discount_percent between 1 and 90),
  slots_total       integer not null default 50 check (slots_total >= 1),

  -- Contratacoes fechadas FORA do site (enterprise/venda assistida) nao geram
  -- signup_intents pago, entao nao entram na contagem automatica. O comercial
  -- soma essas aqui para a barra refletir a realidade.
  manual_taken      integer not null default 0 check (manual_taken >= 0),

  is_active         boolean not null default true,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.launch_offer is
  'Oferta de lancamento (linha unica): desconto percentual sobre public.plans valido enquanto houver vaga entre as slots_total primeiras contratacoes.';
comment on column public.launch_offer.manual_taken is
  'Contratacoes fechadas fora do site (enterprise/venda assistida). Somam a contagem automatica de signup_intents pagos.';
comment on column public.launch_offer.is_active is
  'Chave geral. Mesmo true, a oferta acaba sozinha quando as vagas se esgotam.';

insert into public.launch_offer (id) values (true) on conflict (id) do nothing;

drop trigger if exists set_updated_at on public.launch_offer;
create trigger set_updated_at before update on public.launch_offer
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- 2. Contagem de vagas usadas
-- ---------------------------------------------------------------------
-- Uma "contratacao" e uma EMPRESA pagante: intent provisionada, de producao e
-- com valor > 0. O filtro por amount_cents descarta trial e plano gratuito, que
-- tambem geram signup_intents provisionadas (com amount_cents = 0). O distinct
-- por tenant_id evita contar duas vezes a mesma empresa que trocou de plano ou
-- converteu o trial em assinatura.
create or replace function private.launch_offer_taken()
returns integer
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select coalesce((select manual_taken from public.launch_offer where id), 0)
       + coalesce((
           select count(distinct s.tenant_id)
             from public.signup_intents s
            where s.status = 'provisioned'
              and s.environment = 'production'
              and s.amount_cents > 0
              and s.tenant_id is not null
         ), 0)::integer;
$$;

-- ---------------------------------------------------------------------
-- 3. launch_offer_status — o que o site e o checkout leem
-- ---------------------------------------------------------------------
-- is_active ja vem combinado com as vagas: true significa "pode aplicar o
-- desconto agora", e nenhum dos dois lados precisa repetir essa regra.
-- slots_taken vem limitado a slots_total para a barra nunca passar de 100%;
-- um estouro (vendas simultaneas fechando a ultima vaga) so significa oferta
-- encerrada, e nao "51 de 50".
create or replace function public.launch_offer_status()
returns table (
  is_active        boolean,
  discount_percent integer,
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
    return query select false, 0, 0, 0, 0;
    return;
  end if;

  v_take := private.launch_offer_taken();
  v_left := greatest(o.slots_total - v_take, 0);

  return query select
    (o.is_active and v_left > 0),
    o.discount_percent,
    o.slots_total,
    least(v_take, o.slots_total),
    v_left;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. set_launch_offer — gestao pelo comercial (super_admin)
-- ---------------------------------------------------------------------
-- Todo parametro e opcional: null mantem o valor atual.
create or replace function public.set_launch_offer(
  p_is_active        boolean default null,
  p_discount_percent integer default null,
  p_slots_total      integer default null,
  p_manual_taken     integer default null
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
         manual_taken     = coalesce(p_manual_taken, manual_taken)
   where id
  returning * into o;

  return o;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. RLS e grants
-- ---------------------------------------------------------------------
alter table public.launch_offer enable row level security;

-- A tabela nao e lida direto por ninguem de fora: o visitante e o app passam
-- pela RPC. O super_admin enxerga para conferir a configuracao.
drop policy if exists launch_offer_select on public.launch_offer;
create policy launch_offer_select on public.launch_offer
  for select to authenticated
  using ( private.is_super_admin() );

grant select on public.launch_offer to authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.launch_offer from authenticated;
revoke all on public.launch_offer from anon;

revoke all on function private.launch_offer_taken() from public, anon, authenticated;

-- Status e publico de proposito: e o preco anunciado na vitrine.
revoke all on function public.launch_offer_status() from public;
grant execute on function public.launch_offer_status() to anon, authenticated, service_role;

-- O guard de super_admin esta dentro da funcao.
revoke all on function public.set_launch_offer(boolean, integer, integer, integer) from public, anon;
grant execute on function public.set_launch_offer(boolean, integer, integer, integer) to authenticated;
