import { Check } from "lucide-react";

const perks = [
  "Cobrança por técnico simultâneo, não por endpoint",
  "Endpoints ilimitados por assento",
  "Sem cota de sessões nem excedente",
  "Contratos anuais com preço travado",
];

export function Pricing() {
  return (
    <section id="preco" className="bg-surface py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Preço e posicionamento
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
              Preço justo, no seu ritmo de crescimento.
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              Cada operação tem um contexto diferente — número de técnicos, endpoints e SLA.
              Por isso trabalhamos com proposta personalizada, sempre no modelo por assento
              simultâneo, sem letras miúdas.
            </p>
            <a
              href="#contato"
              className="mt-8 inline-flex h-12 items-center rounded-btn bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]"
            >
              Receber proposta
            </a>
          </div>
          <div className="rounded-card border border-border bg-surface-2 p-8 shadow-soft">
            <p className="text-sm font-medium text-text-muted">Modelo</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-text">
              Por assento (técnico simultâneo)
            </p>
            <ul className="mt-6 space-y-3">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-[15px] text-text">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
