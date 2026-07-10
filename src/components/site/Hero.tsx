import { ArrowRight, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24 mesh-hero">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs font-medium text-text-muted backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
            Plataforma brasileira · LGPD-ready
          </span>
          <h1 className="mt-6 text-balance text-5xl font-extrabold tracking-tight text-text sm:text-6xl md:text-[68px] md:leading-[1.05]">
            Acesso remoto e suporte de TI,
            <span className="block text-primary">sem surpresa no custo.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-text-muted">
            A alternativa brasileira ao AnyDesk e ao TeamViewer para MSPs, clínicas e
            departamentos de TI. Cobrança transparente por assento, soberania de dados e
            suporte em português.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#contato"
              className="group inline-flex h-12 items-center gap-2 rounded-btn bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]"
            >
              Solicitar demonstração
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </a>
            <a
              href="#recursos"
              className="inline-flex h-12 items-center rounded-btn border border-border bg-surface px-6 text-[15px] font-semibold text-text transition-all hover:bg-surface-2"
            >
              Ver recursos
            </a>
          </div>
        </div>

        {/* Visual de infraestrutura (placeholder) */}
        <div
          data-placeholder="hero-illustration"
          className="relative mx-auto mt-20 aspect-[16/8] max-w-5xl overflow-hidden rounded-card border border-border bg-surface shadow-lift"
        >
          <div className="absolute inset-0 mesh-hero" />
          <div className="absolute inset-0 grid grid-cols-6 gap-px opacity-40">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="border-r border-b border-border/60" />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl border border-border bg-surface/80 px-6 py-4 shadow-soft backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_0_4px_color-mix(in_oklab,var(--success)_20%,transparent)]" />
                <span className="text-sm font-medium text-text">
                  Sessão conectada · <span className="font-mono text-accent-blue">ID 481 902 337</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
