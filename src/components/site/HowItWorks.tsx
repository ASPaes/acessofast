import { SpotlightCard, SpotlightGroup } from "@/components/site/SpotlightCard";
import { Otto, type OttoEstado } from "@/components/otto/otto";

// O Otto conta a mesma história dos passos: aparece, conecta e resolve.
const steps: { n: string; title: string; desc: string; otto: OttoEstado }[] = [
  {
    n: "01",
    otto: "ola",
    title: "Instale o cliente",
    desc: "Um instalador único para Windows, rápido de instalar e sem configuração. macOS e Linux em desenvolvimento.",
  },
  {
    n: "02",
    otto: "conectando",
    title: "Adicione o dispositivo",
    desc: "Adicione no painel o ID que aparece no cliente. Ele fica salvo no seu address book, organizado por cliente e tag.",
  },
  {
    n: "03",
    otto: "concluido",
    title: "Conecte com 1 clique",
    desc: "Selecione, conecte e atenda. Reconexão automática caso a máquina reinicie no meio da sessão.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Como funciona
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            Do zero ao primeiro atendimento em segundos.
          </h2>
        </div>
        <SpotlightGroup className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <SpotlightCard key={s.n} className="bg-surface p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-sm font-semibold text-accent-blue">{s.n}</span>
                <Otto estado={s.otto} seguirMouse className="-mt-4 -mr-3 w-24" />
              </div>
              <h3 className="mt-1 text-xl font-semibold text-text">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{s.desc}</p>
            </SpotlightCard>
          ))}
        </SpotlightGroup>
      </div>
    </section>
  );
}
