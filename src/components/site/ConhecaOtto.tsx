import { Otto, type OttoEstado } from "@/components/otto/otto";

// Apresenta o Otto como a cara do AcessoFast: as caras dele (as mesmas que a
// pessoa vê no site e no painel) e o curta de apresentação. O vídeo só carrega
// quando a pessoa dá play (preload="none"): horizontal no computador, vertical
// no celular. Os arquivos em public/otto/ são versões leves do curta do Estúdio.

const CARAS: { estado: OttoEstado; nome: string }[] = [
  { estado: "conectando", nome: "Conectando" },
  { estado: "atendendo", nome: "Em atendimento" },
  { estado: "concluido", nome: "Resolvido" },
  { estado: "aguardando", nome: "Esperando você" },
  { estado: "erro", nome: "Deu erro" },
  { estado: "offline", nome: "Dormindo" },
];

export function ConhecaOtto() {
  return (
    <section id="otto" className="py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Conheça o Otto
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            O Otto é a cara do AcessoFast.
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Um monitorzinho que muda de cara conforme o que está acontecendo. Bateu o olho nele, já
            sabe como anda o atendimento.
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
  );
}
