import { ArrowRight } from "lucide-react";
import heroMockup from "@/assets/acessofast-dashboard-screenshot.png.asset.json";


export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24 mesh-hero">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            <span className="h-px w-8 bg-primary/50" />
            Conectou. Resolveu.
          </span>
          <h1 className="mt-6 text-balance text-5xl font-extrabold tracking-tight text-text sm:text-6xl md:text-[68px] md:leading-[1.05]">
            Acesso remoto e suporte de TI,
            <span className="block text-primary">sem surpresa no custo.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-text-muted">
            A plataforma brasileira de acesso remoto e suporte de TI para MSPs, provedores de suporte e
            equipes de TI. Cobrança transparente por técnico simultâneo, soberania de dados.
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

        {/* Visual da tela de acesso remoto */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="relative overflow-hidden rounded-card border border-border bg-surface shadow-lift">
            <img
              src={heroMockup.url}
              alt="Painel do Acessofast mostrando dispositivos cadastrados no address book"
              className="w-full"
              width={1903}
              height={912}
              loading="eager"
            />
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
            <div className="rounded-2xl border border-border bg-surface/90 px-6 py-4 shadow-soft backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_0_4px_color-mix(in_oklab,var(--success)_20%,transparent)]" />
                <span className="text-sm font-medium text-text">
                  12 dispositivos · <span className="font-mono text-success">3 online</span>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
