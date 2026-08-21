import { useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { SpotlightCard, SpotlightGroup } from "@/components/site/SpotlightCard";
import { LaunchOfferBar } from "@/components/site/LaunchOfferBar";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { applyLaunchDiscount, fetchLaunchOffer, type LaunchOffer } from "@/lib/launch-offer";

/** Opções do toggle. "individual" é uma visão à parte, não um ciclo de cobrança. */
type View = "mensal" | "anual" | "individual";
type BillingCycle = "mensal" | "anual";
type PlanAction = "subscribe" | "trial" | "free" | "contact";

const VIEWS: { value: View; label: string }[] = [
  { value: "mensal", label: "Mensal" },
  { value: "anual", label: "Anual" },
  { value: "individual", label: "Individual" },
];

const PLAN_COLUMNS =
  "code,name,price_month_cents,price_year_cents,max_users,max_concurrent_per_tech,is_custom,is_active,sort_order" as const;

type Plan = Pick<
  Database["public"]["Tables"]["plans"]["Row"],
  | "code"
  | "name"
  | "price_month_cents"
  | "price_year_cents"
  | "max_users"
  | "max_concurrent_per_tech"
  | "is_custom"
  | "is_active"
  | "sort_order"
>;

type PlanButton = { action: PlanAction; label: string; variant: "primary" | "secondary" };

export type PricingProps = {
  /**
   * Recebe a intenção do visitante. A Tarefa 2 pluga o formulário aqui.
   * billingCycle continua só "mensal" | "anual": a view "individual" envia "mensal",
   * já que o ciclo é irrelevante para as ações free/trial e um ciclo "individual"
   * não existe do lado da cobrança.
   */
  onSelectPlan?: (planCode: string, action: PlanAction, billingCycle: BillingCycle) => void;
};

const brlWhole = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const brlCents = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatCents(cents: number) {
  const value = cents / 100;
  return Number.isInteger(value) ? brlWhole.format(value) : brlCents.format(value);
}

/** Total cobrado no ciclo: no anual é o ano inteiro, no mensal é o mês. */
function cycleCents(plan: Plan, billing: BillingCycle): number | null {
  return billing === "anual" ? plan.price_year_cents : plan.price_month_cents;
}

type PlanPrices = {
  /** Mensalidade exibida. No anual é o total do ano dividido por 12. */
  perMonth: number | null;
  /** Total do ciclo já com a oferta. No mensal é igual à mensalidade. */
  cycleTotal: number | null;
  /** Mensalidade de tabela, só quando a oferta está aplicada (preço riscado). */
  perMonthBefore: number | null;
};

/**
 * Preço do card. Quando a oferta de lançamento está valendo, o desconto é
 * aplicado sobre o TOTAL do ciclo e só depois dividido por 12 — a mesma ordem
 * da create-checkout-prod, senão o arredondamento faria a vitrine e a cobrança
 * divergirem em centavos.
 */
function planPrices(plan: Plan, billing: BillingCycle, offer: LaunchOffer | null): PlanPrices {
  const full = cycleCents(plan, billing);
  if (full === null) return { perMonth: null, cycleTotal: null, perMonthBefore: null };

  const meses = billing === "anual" ? 12 : 1;
  // Plano gratuito e enterprise ficam de fora: não há valor para descontar.
  const aplicaOferta = !!offer?.is_active && !plan.is_custom && full > 0;
  if (!aplicaOferta) {
    return { perMonth: full / meses, cycleTotal: full, perMonthBefore: null };
  }

  const comDesconto = applyLaunchDiscount(full, offer!.discount_percent);
  return {
    perMonth: comDesconto / meses,
    cycleTotal: comDesconto,
    perMonthBefore: full / meses,
  };
}

/**
 * Desconto do anual sobre o mensal, em %. Usa o MENOR desconto entre os planos pagos
 * para não prometer no toggle mais do que algum plano entrega. null quando não há desconto.
 *
 * Compara os valores que o visitante VÊ (já com a oferta de lançamento), não os de
 * tabela: é o selo dizendo quanto se economiza trocando o botão Mensal pelo Anual
 * naquele momento. Na prática dá o mesmo número, porque a oferta derruba os dois
 * lados na mesma proporção — mas se um dia o desconto passar a valer só para um
 * ciclo, o selo acompanha em vez de mentir.
 */
function annualDiscountPercent(plans: Plan[], offer: LaunchOffer | null): number | null {
  const rates: number[] = [];
  for (const plan of plans) {
    if (plan.is_custom) continue;
    const mensal = planPrices(plan, "mensal", offer).perMonth;
    const anual = planPrices(plan, "anual", offer).perMonth;
    if (mensal === null || anual === null || mensal <= 0) continue;
    const rate = 1 - anual / mensal;
    if (rate > 0) rates.push(rate);
  }
  if (rates.length === 0) return null;
  const percent = Math.round(Math.min(...rates) * 100);
  return percent > 0 ? percent : null;
}

function usersLabel(plan: Plan) {
  if (plan.max_users === null) return "Usuários sob medida";
  if (plan.max_users === 1) return "1 usuário";
  return `Até ${plan.max_users} usuários`;
}

function concurrencyLabel(plan: Plan) {
  // null tem dois significados: personalizado no enterprise, ilimitado nos demais.
  if (plan.is_custom) return "Configuração personalizada";
  if (plan.max_concurrent_per_tech === null) return "Acessos simultâneos ilimitados por técnico";
  if (plan.max_concurrent_per_tech === 1) return "Até 1 acesso simultâneo por técnico";
  return `Até ${plan.max_concurrent_per_tech} acessos simultâneos por técnico`;
}

function planButtons(plan: Plan): PlanButton[] {
  if (plan.is_custom || plan.code === "enterprise") {
    return [{ action: "contact", label: "Falar com especialista", variant: "primary" }];
  }
  if (plan.code === "individual") {
    return [{ action: "free", label: "Criar conta grátis", variant: "primary" }];
  }
  if (plan.code === "team" || plan.code === "business") {
    return [
      { action: "trial", label: "Testar 7 dias grátis", variant: "secondary" },
      { action: "subscribe", label: "Assinar", variant: "primary" },
    ];
  }
  // scale (e qualquer plano novo pago): sem trial.
  return [{ action: "subscribe", label: "Assinar", variant: "primary" }];
}

/** Plano em destaque na grade (mensal e anual). Não aparece na visão individual. */
const RECOMMENDED_PLAN_CODE = "business";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-btn bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]";
const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-btn border border-primary/40 bg-transparent px-5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 hover:-translate-y-[1px]";

function PlanCard({
  plan,
  billing,
  offer,
  onSelect,
}: {
  plan: Plan;
  billing: BillingCycle;
  offer: LaunchOffer | null;
  onSelect: (planCode: string, action: PlanAction) => void;
}) {
  const isFree = !plan.is_custom && plan.price_month_cents === 0;
  const { perMonth, cycleTotal, perMonthBefore } = planPrices(plan, billing, offer);
  const isRecommended = plan.code === RECOMMENDED_PLAN_CODE;

  return (
    <SpotlightCard strong={isRecommended} className="flex flex-col bg-surface-2 p-6">
      {isRecommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-soft">
          Recomendado
        </span>
      )}
      <h3 className="text-lg font-bold tracking-tight text-text">{plan.name}</h3>
      {isFree ? (
        <div className="mt-4">
          <span className="text-3xl font-extrabold tracking-tight text-text">Grátis</span>
        </div>
      ) : plan.is_custom || perMonth === null ? (
        <div className="mt-4">
          <span className="text-3xl font-extrabold tracking-tight text-text">Sob consulta</span>
        </div>
      ) : (
        <div className="mt-4">
          {/* Preço de tabela riscado só existe enquanto a oferta vale. */}
          {perMonthBefore !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-faint line-through">
                {formatCents(perMonthBefore)}
              </span>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                -{offer!.discount_percent}%
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-text">
              {formatCents(perMonth)}
            </span>
            <span className="text-sm text-text-muted">/mês</span>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            {billing === "anual" && cycleTotal !== null
              ? `Equivale a ${formatCents(cycleTotal)}/ano · em até 3x no cartão`
              : "Cobrança mensal, sem fidelidade"}
          </p>
          {/* Ao lado do preço, o prazo importa mais que a contagem de vagas —
              a escassez já está no bloco logo abaixo da grade. */}
          {perMonthBefore !== null && (
            <p className="mt-1 text-sm font-medium text-brand">
              {offer!.discount_months === null
                ? "Preço de lançamento"
                : `Preço de lançamento · ${offer!.discount_months} primeiros meses`}
            </p>
          )}
        </div>
      )}
      <ul className="mt-6 flex-1 space-y-3 text-left">
        <li className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] text-text">{usersLabel(plan)}</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] text-text">{concurrencyLabel(plan)}</span>
        </li>
      </ul>
      <div className="mt-8 flex flex-col gap-2">
        {planButtons(plan).map((b) => (
          <button
            key={b.action}
            type="button"
            onClick={() => onSelect(plan.code, b.action)}
            className={b.variant === "primary" ? primaryButtonClass : secondaryButtonClass}
          >
            {b.label}
          </button>
        ))}
      </div>
    </SpotlightCard>
  );
}

export function Pricing({ onSelectPlan }: PricingProps) {
  const [view, setView] = useState<View>("anual");
  // A view "individual" não é um ciclo: para cálculo/callback ela equivale a mensal.
  const billing: BillingCycle = view === "individual" ? "mensal" : view;

  const {
    data: plans,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["site", "plans"],
    queryFn: async (): Promise<Plan[]> => {
      const { data, error } = await supabase
        .from("plans")
        .select(PLAN_COLUMNS)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  /* Oferta de lançamento. Fica em query separada de propósito: se ela falhar, a
     página cai no preço de tabela em vez de ficar sem preço nenhum. staleTime
     curto porque a barra precisa acompanhar as contratações. */
  const { data: offerData } = useQuery({
    queryKey: ["site", "launch-offer"],
    queryFn: fetchLaunchOffer,
    staleTime: 60 * 1000,
  });
  const offer = offerData?.is_active ? offerData : null;

  const handleSelect = (planCode: string, action: PlanAction) => {
    if (onSelectPlan) {
      onSelectPlan(planCode, action, billing);
      return;
    }
    console.log("[pricing] select", planCode, action, billing);
  };

  // Individual sai da grade e vira uma visão própria do toggle.
  const visiblePlans = (plans ?? []).filter((p) =>
    view === "individual" ? p.code === "individual" : p.code !== "individual",
  );
  const hasPlans = visiblePlans.length > 0;
  const annualDiscount = annualDiscountPercent(plans ?? [], offer);

  /* A pílula do toggle é medida a partir do botão ativo em vez de ter posições
     fixas: as opções têm larguras diferentes, e a do "Anual" ainda muda quando o
     selo de desconto some. Medir antes do paint evita o pisca na montagem. */
  const toggleRef = useRef<HTMLDivElement>(null);
  const viewRefs = useRef<Partial<Record<View, HTMLButtonElement | null>>>({});
  const [pill, setPill] = useState({ left: 0, top: 0, width: 0, height: 0 });

  useIsomorphicLayoutEffect(() => {
    const container = toggleRef.current;
    const active = viewRefs.current[view];
    if (!container || !active) return;

    const measure = () =>
      setPill({
        left: active.offsetLeft,
        top: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
      });

    measure();
    // Fonte carregando ou quebra de linha em tela estreita mudam as medidas.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(active);
    return () => observer.disconnect();
    // annualDiscount e offer entram porque o selo aparecendo — e o "mais " que a
    // oferta acrescenta a ele — mudam a largura dos botões.
  }, [view, annualDiscount, offer]);

  return (
    <section id="preco" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Planos e preços
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            Escolha o plano da sua operação.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-muted">
            Preço fechado, sem excedente e sem reajuste surpresa.
          </p>
          <div
            ref={toggleRef}
            className="relative mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-bg p-1"
          >
            {/* Pílula única que desliza entre as opções, em vez de um fundo por
                botão que apenas acende. Largura também é animada porque o selo
                de desconto muda o tamanho do botão "Anual". */}
            <span
              aria-hidden
              className="absolute top-0 left-0 rounded-full bg-primary transition-[transform,width,height] duration-300 ease-out motion-reduce:transition-none"
              style={{
                transform: `translate(${pill.left}px, ${pill.top}px)`,
                width: pill.width,
                height: pill.height,
              }}
            />
            {VIEWS.map((v) => (
              <button
                key={v.value}
                ref={(el) => {
                  viewRefs.current[v.value] = el;
                }}
                type="button"
                onClick={() => setView(v.value)}
                className={`relative inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-colors ${view === v.value ? "text-primary-foreground" : "text-text-muted hover:text-text"}`}
              >
                {v.label}
                {/* Só como isca: com o Anual já selecionado o selo vira ruído dentro do botão ativo. */}
                {v.value === "anual" && view !== "anual" && annualDiscount !== null && (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                    {/* Com a oferta na tela, "mais" evita a leitura de que 17% e 30%
                        são a mesma promoção disputando lugar: um desconto entra em
                        cima do outro. Sem oferta, o "mais" não teria referência. */}
                    {offer ? "mais " : ""}
                    {annualDiscount}% de desconto
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isPending ? (
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse flex-col rounded-card border border-border bg-surface-2 p-6 shadow-soft"
              >
                <div className="h-5 w-2/3 rounded bg-border-strong" />
                <div className="mt-5 h-9 w-1/2 rounded bg-border-strong" />
                <div className="mt-2 h-4 w-3/4 rounded bg-border" />
                <div className="mt-6 flex-1 space-y-3">
                  <div className="h-4 w-full rounded bg-border" />
                  <div className="h-4 w-5/6 rounded bg-border" />
                </div>
                <div className="mt-8 h-11 w-full rounded-btn bg-border-strong" />
              </div>
            ))}
          </div>
        ) : isError || !hasPlans ? (
          <p className="mt-14 text-center text-[15px] text-text-muted">
            Não foi possível carregar os planos. Recarregue a página.
          </p>
        ) : view === "individual" ? (
          <div className="mt-14 mx-auto flex max-w-3xl flex-col items-center gap-8 md:flex-row md:items-stretch md:justify-center">
            <div className="max-w-sm text-center md:text-left md:self-center">
              <h3 className="text-2xl font-extrabold tracking-tight text-text">Comece sem custo</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
                Ideal para técnicos autônomos — 1 usuário, 1 acesso sem custo.
              </p>
            </div>
            <SpotlightGroup className="w-full max-w-sm">
              {visiblePlans.map((p) => (
                <PlanCard
                  key={p.code}
                  plan={p}
                  billing={billing}
                  offer={offer}
                  onSelect={handleSelect}
                />
              ))}
            </SpotlightGroup>
          </div>
        ) : (
          <SpotlightGroup className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {visiblePlans.map((p) => (
              <PlanCard
                key={p.code}
                plan={p}
                billing={billing}
                offer={offer}
                onSelect={handleSelect}
              />
            ))}
          </SpotlightGroup>
        )}

        {/* Depois da grade: os planos já foram lidos, e aqui a barra fecha com o
            motivo de decidir agora. Some sozinha quando a oferta acaba ou as
            vagas se esgotam. */}
        {offer && !isPending && !isError && hasPlans && <LaunchOfferBar offer={offer} />}
      </div>
    </section>
  );
}
