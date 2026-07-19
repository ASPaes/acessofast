import { Coins, ShieldOff, Database, Flag } from "lucide-react";

const items = [
  {
    icon: Coins,
    title: "Custo transparente por assento",
    desc:
      "Você paga por técnico simultâneo. Sem cobrança por endpoint, sem cota de sessões com excedente, sem aumento surpresa na renovação.",
  },
  {
    icon: ShieldOff,
    title: "Sem policiamento de uso comercial",
    desc:
      "B2B desde o primeiro dia. Nada de mensagens acusando \"uso comercial detectado\" no meio de um atendimento.",
  },
  {
    icon: Database,
    title: "Soberania de dados",
    desc:
      "Tráfego de controle remoto criptografado ponta-a-ponta, com relay próprio e metadados hospedados em região brasileira. Pensado para LGPD.",
  },
  {
    icon: Flag,
    title: "Foco Brasil",
    desc:
      "Produto, documentação e suporte em português. Time comercial brasileiro que entende sua operação e o seu SLA.",
  },
];

export function Differentiators() {
  return (
    <section id="diferenciais" className="bg-surface py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Por que Acessofast
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            O que você não encontra nas alternativas globais.
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Construído para resolver as dores reais de MSPs e times de TI no Brasil.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-card border border-border bg-surface-2 p-8 shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-text">
                {title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
