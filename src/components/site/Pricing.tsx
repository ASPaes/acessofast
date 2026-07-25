import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Billing = "mensal" | "anual";
type PlanAction = "subscribe" | "trial" | "free" | "contact";

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
  /** Recebe a intenção do visitante. A Tarefa 2 pluga o formulário aqui. */
  onSelectPlan?: (planCode: string, action: PlanAction, billingCycle: Billing) => void;
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

/** Valor mensal exibido. No anual é calculado: price_year_cents é o TOTAL do ano. */
function monthlyCents(plan: Plan, billing: Billing): number | null {
  if (billing === "anual") {
    return plan.price_year_cents === null ? null : plan.price_year_cents / 12;
  }
  return plan.price_month_cents;
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

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-btn bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]";
const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-btn border border-primary/40 bg-transparent px-5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 hover:-translate-y-[1px]";

export function Pricing({ onSelectPlan }: PricingProps) {
  const [billing, setBilling] = useState<Billing>("anual");

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

  const handleSelect = (planCode: string, action: PlanAction) => {
    if (onSelectPlan) {
      onSelectPlan(planCode, action, billing);
      return;
    }
    console.log("[pricing] select", planCode, action, billing);
  };

  const hasPlans = !!plans && plans.length > 0;

  return (
    <section id="preco" className="bg-surface py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Planos e preços</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">Escolha o plano da sua operação.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-muted">Preço fechado, sem excedente e sem reajuste surpresa.</p>
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-bg p-1">
            <button type="button" onClick={() => setBilling("mensal")} className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${billing === "mensal" ? "bg-primary text-primary-foreground" : "text-text-muted hover:text-text"}`}>Mensal</button>
            <button type="button" onClick={() => setBilling("anual")} className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${billing === "anual" ? "bg-primary text-primary-foreground" : "text-text-muted hover:text-text"}`}>Anual</button>
          </div>
        </div>

        {isPending ? (
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex animate-pulse flex-col rounded-card border border-border bg-surface-2 p-6 shadow-soft">
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
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => {
              const isFree = !p.is_custom && p.price_month_cents === 0;
              const perMonth = monthlyCents(p, billing);

              return (
                <div key={p.code} className="flex flex-col rounded-card border border-border bg-surface-2 p-6 shadow-soft">
                  <h3 className="text-lg font-bold tracking-tight text-text">{p.name}</h3>
                  {isFree ? (
                    <div className="mt-4"><span className="text-3xl font-extrabold tracking-tight text-text">Grátis</span></div>
                  ) : p.is_custom || perMonth === null ? (
                    <div className="mt-4"><span className="text-3xl font-extrabold tracking-tight text-text">Sob consulta</span></div>
                  ) : (
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold tracking-tight text-text">{formatCents(perMonth)}</span>
                        <span className="text-sm text-text-muted">/mês</span>
                      </div>
                      <p className="mt-1 text-sm text-text-muted">{billing === "anual" && p.price_year_cents !== null ? `${formatCents(p.price_year_cents)} cobrados por ano` : "Cobrança mensal, sem fidelidade"}</p>
                    </div>
                  )}
                  <ul className="mt-6 flex-1 space-y-3 text-left">
                    <li className="flex items-start gap-3"><span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success/15 text-success"><Check className="h-3.5 w-3.5" strokeWidth={2.5} /></span><span className="text-[15px] text-text">{usersLabel(p)}</span></li>
                    <li className="flex items-start gap-3"><span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success/15 text-success"><Check className="h-3.5 w-3.5" strokeWidth={2.5} /></span><span className="text-[15px] text-text">{concurrencyLabel(p)}</span></li>
                  </ul>
                  <div className="mt-8 flex flex-col gap-2">
                    {planButtons(p).map((b) => (
                      <button
                        key={b.action}
                        type="button"
                        onClick={() => handleSelect(p.code, b.action)}
                        className={b.variant === "primary" ? primaryButtonClass : secondaryButtonClass}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
