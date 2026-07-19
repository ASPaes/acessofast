const steps = [
  {
    n: "01",
    title: "Instale o cliente",
    desc: "Um instalador enxuto para Windows, macOS e Linux. Deploy silencioso via MSI ou script.",
  },
  {
    n: "02",
    title: "Dispositivo no painel",
    desc: "Cada máquina aparece automaticamente no seu address book, organizada por cliente e tag.",
  },
  {
    n: "03",
    title: "Conecte com 1 clique",
    desc: "Selecione, conecte e atenda. Reconexão automática caso a máquina reinicie no meio da sessão.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Como funciona
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            Do zero ao primeiro atendimento em segundos.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-card border border-border bg-surface p-8 shadow-soft"
            >
              <span className="font-mono text-sm font-semibold text-accent-blue">{s.n}</span>
              <h3 className="mt-3 text-xl font-semibold text-text">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
