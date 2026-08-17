import { ArrowRight } from "lucide-react";
import { AppDemo } from "@/components/site/app-demo/AppDemo";
import { ParticlesBackground } from "@/components/site/ParticlesBackground";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24 mesh-hero">
      <ParticlesBackground />
      <div className="relative mx-auto max-w-6xl px-6">
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
            A plataforma brasileira de acesso remoto e suporte de TI para MSPs, provedores de
            suporte e equipes de TI. Preço transparente e previsível, soberania de dados.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#contato"
              className="group inline-flex h-12 items-center gap-2 rounded-btn bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]"
            >
              Solicitar demonstração
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </a>
            <a
              href="#recursos"
              className="inline-flex h-12 items-center rounded-btn border border-border bg-surface px-6 text-[15px] font-semibold text-text transition-all hover:bg-surface-2"
            >
              Ver recursos
            </a>
          </div>
        </div>
      </div>

      {/* Réplica navegável do painel — sai um pouco da coluna de texto de propósito */}
      <div className="relative mx-auto mt-20 max-w-7xl px-6">
        <AppDemo />
        <p className="mt-4 text-center text-xs text-text-faint">
          Painel real do AcessoFast · clique no menu lateral para navegar. Dados ilustrativos.
        </p>
      </div>
    </section>
  );
}
