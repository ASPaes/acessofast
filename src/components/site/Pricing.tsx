import { useState } from "react";

import { Check } from "lucide-react";

type Billing = "mensal" | "anual";

const plans = [
  { name: "AcessoFast Team", users: "Até 10 usuários", sessions: "Até 5 acessos simultâneos por técnico", mensal: "R$ 299", anualMes: "R$ 249", anualTotal: "R$ 2.988" },
  { name: "AcessoFast Business", users: "Até 20 usuários", sessions: "Até 10 acessos simultâneos por técnico", mensal: "R$ 539", anualMes: "R$ 449", anualTotal: "R$ 5.388" },
  { name: "AcessoFast Scale", users: "Até 50 usuários", sessions: "Acessos simultâneos ilimitados por técnico", note: true, mensal: "R$ 1.079", anualMes: "R$ 899", anualTotal: "R$ 10.788" },
  { name: "AcessoFast Enterprise", users: "Usuários sob medida", sessions: "Configuração personalizada", custom: true },
];

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("anual");

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

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div key={p.name} className="flex flex-col rounded-card border border-border bg-surface-2 p-6 shadow-soft">
              <h3 className="text-lg font-bold tracking-tight text-text">{p.name}</h3>
              {p.custom ? (
                <div className="mt-4"><span className="text-3xl font-extrabold tracking-tight text-text">Sob consulta</span></div>
              ) : (
                <div className="mt-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight text-text">{billing === "anual" ? p.anualMes : p.mensal}</span>
                    <span className="text-sm text-text-muted">/mês</span>
                  </div>
                  <p className="mt-1 text-sm text-text-muted">{billing === "anual" ? `${p.anualTotal} cobrados por ano` : "Cobrança mensal, sem fidelidade"}</p>
                </div>
              )}
              <ul className="mt-6 flex-1 space-y-3 text-left">
                <li className="flex items-start gap-3"><span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success/15 text-success"><Check className="h-3.5 w-3.5" strokeWidth={2.5} /></span><span className="text-[15px] text-text">{p.users}</span></li>
                <li className="flex items-start gap-3"><span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success/15 text-success"><Check className="h-3.5 w-3.5" strokeWidth={2.5} /></span><span className="text-[15px] text-text">{p.sessions}{p.note && <sup className="ml-0.5 text-primary">*</sup>}</span></li>
              </ul>
              {/* TODO: trocar href="#contato" pelo link de pagamento do Asaas deste plano */}
              <a href="#contato" className="mt-8 inline-flex h-11 items-center justify-center rounded-btn bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]">
                {p.custom ? "Falar com especialista" : "Quero contratar"}
              </a>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-text-muted">* Sem limite de acessos simultâneos por técnico.</p>
      </div>
    </section>
  );
}
