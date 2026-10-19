import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Otto, type OttoEstado } from "@/components/otto/otto";

export const Route = createFileRoute("/otto")({
  component: OttoPage,
  head: () => ({
    meta: [
      { title: "Conheça o Otto — o mascote do AcessoFast" },
      {
        name: "description",
        content:
          "O Otto é a cara do AcessoFast: um monitorzinho que muda de cara conforme o atendimento. Conheça as caras dele e assista ao curta de apresentação.",
      },
    ],
  }),
});

// Página do Otto, fora da home (pedido do Ryan, 19/10/2026): as caras dele, as
// mesmas que a pessoa vê no site e no painel, e o curta de apresentação. O vídeo
// só carrega quando a pessoa dá play (preload="none"): horizontal no computador,
// vertical no celular. Os arquivos em public/otto/ são versões leves do curta
// do Estúdio de Vídeos.

const CARAS: { estado: OttoEstado; nome: string }[] = [
  { estado: "conectando", nome: "Conectando" },
  { estado: "atendendo", nome: "Em atendimento" },
  { estado: "concluido", nome: "Resolvido" },
  { estado: "aguardando", nome: "Esperando você" },
  { estado: "erro", nome: "Deu erro" },
  { estado: "offline", nome: "Dormindo" },
];

function OttoPage() {
  return (
    <div className="min-h-screen text-text">
      <Header />
      <main>
        {/* id "otto": é por ele que o Otto do canto comenta ao chegar aqui */}
        <section id="otto" className="mesh-hero pt-36 pb-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Conheça o Otto
              </p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                O Otto é a cara do AcessoFast.
              </h1>
              <p className="mt-4 text-lg text-text-muted">
                Um monitorzinho que muda de cara conforme o que está acontecendo. Bateu o olho nele,
                já sabe como anda o atendimento.
              </p>
              <ul className="mt-8 grid grid-cols-3 gap-3">
                {CARAS.map((c) => (
                  <li
                    key={c.estado}
                    className="flex flex-col items-center gap-1 rounded-card border border-border bg-surface px-2 pt-2 pb-3 text-center"
                  >
                    <Otto estado={c.estado} seguirMouse className="w-16 sm:w-20" />
                    <span className="text-[13px] font-medium text-text-muted">{c.nome}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-card border border-border bg-surface shadow-soft">
              <video
                className="hidden aspect-video w-full md:block"
                controls
                playsInline
                preload="none"
                poster="/otto/otto-curta-horizontal.jpg"
                aria-label="Curta de apresentação do Otto"
              >
                <source src="/otto/otto-curta-horizontal.mp4" type="video/mp4" />
              </video>
              <video
                className="mx-auto aspect-[9/16] w-full max-w-sm md:hidden"
                controls
                playsInline
                preload="none"
                poster="/otto/otto-curta-vertical.jpg"
                aria-label="Curta de apresentação do Otto"
              >
                <source src="/otto/otto-curta-vertical.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-card border border-border bg-surface px-6 py-12 text-center shadow-soft sm:px-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              Agora que você conhece o Otto, conheça o AcessoFast.
            </h2>
            <p className="max-w-xl text-lg text-text-muted">
              Acesso remoto e suporte de TI com preço fechado, sem excedente e sem surpresa na
              renovação.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/#recursos"
                className="inline-flex h-12 items-center gap-2 rounded-btn bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]"
              >
                Ver recursos
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/#preco"
                data-otto-feliz
                className="inline-flex h-12 items-center rounded-btn border border-border-strong px-6 text-sm font-semibold text-text transition-colors hover:bg-white/5"
              >
                Ver planos
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
