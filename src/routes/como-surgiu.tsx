import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  FileQuestion,
  FolderSearch,
  Gauge,
  Hourglass,
  Laptop,
  Monitor,
  Smartphone,
  TabletSmartphone,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SpotlightCard, SpotlightGroup } from "@/components/site/SpotlightCard";
import { Otto } from "@/components/otto/otto";

export const Route = createFileRoute("/como-surgiu")({
  component: ComoSurgiuPage,
  head: () => ({
    meta: [
      { title: "Como surgiu o AcessoFast — acesso remoto criado por uma equipe de suporte" },
      {
        name: "description",
        content:
          "O AcessoFast foi desenvolvido por uma equipe de suporte técnico a partir de quatro limitações das ferramentas de acesso remoto: limite de acessos, contratos pouco transparentes, endpoints desorganizados e aceite manual a cada sessão.",
      },
    ],
  }),
});

// A história de origem, em tom técnico. Regras do time (19/10/2026): nenhum
// nome de concorrente, nenhum nome de pessoa, e nada além do que de fato
// aconteceu. Cada limitação aparece duas vezes de propósito: primeiro como
// problema, depois como a decisão de produto que nasceu dela.

const dores = [
  {
    icon: Gauge,
    title: "Limite de acessos",
    desc: "As licenças das ferramentas que usávamos limitavam a quantidade de acessos. No volume de uma equipe de suporte, esse teto virava o gargalo da operação.",
  },
  {
    icon: FileQuestion,
    title: "Contratos pouco transparentes",
    desc: "Regras de licenciamento difíceis de entender e de prever, e valores que não acompanhavam a realidade de quem presta suporte.",
  },
  {
    icon: FolderSearch,
    title: "Endpoints desorganizados",
    desc: "Os computadores dos clientes ficavam em listas soltas, sem vínculo com o cliente nem agrupamento. Localizar a máquina certa consumia tempo de atendimento.",
  },
  {
    icon: Hourglass,
    title: "Aceite manual a cada sessão",
    desc: "Toda conexão dependia de alguém, do lado do cliente, autorizar o acesso. Uma etapa humana obrigatória que atrasava o início de cada atendimento.",
  },
];

const missao = [
  {
    quando: "Ponto de partida",
    title: "Uma ferramenta própria",
    desc: "A equipe de suporte reuniu essas limitações e definiu o objetivo: desenvolver a própria ferramenta de acesso remoto, atacando exatamente esses pontos fracos.",
  },
  {
    quando: "10 dias",
    title: "Primeira versão",
    desc: "O prazo para a primeira versão funcional foi de 10 dias, em ciclos intensos de desenvolvimento, muitas vezes até tarde.",
  },
  {
    quando: "Depois dos 10 dias",
    title: "Estabilização",
    desc: "A primeira versão trouxe bugs, corrigidos um a um. O objetivo era uma ferramenta útil não só para a equipe, mas para qualquer profissional que dependa de acesso remoto.",
  },
  {
    quando: "Hoje",
    title: "Em operação",
    desc: "O AcessoFast funciona em excelentes condições no Windows e no Android.",
  },
  {
    quando: "Próximos passos",
    title: "iOS e macOS",
    desc: "As versões para iOS e macOS estão em desenvolvimento.",
  },
];

const respostas = [
  {
    dor: "Limite de acessos",
    resposta:
      "Computadores cadastrados sem limite. A capacidade é definida em acessos simultâneos por técnico, conforme o plano.",
  },
  {
    dor: "Contratos pouco transparentes",
    resposta:
      "Preço fechado e publicado no site, sem cobrança por máquina, sem excedente e sem reajuste surpresa.",
  },
  {
    dor: "Endpoints desorganizados",
    resposta:
      "Painel web central: cada computador vinculado ao seu cliente, com marcadores, busca por ID, nome ou CNPJ e o status de cada máquina: online, offline ou em atendimento.",
  },
  {
    dor: "Aceite manual a cada sessão",
    resposta:
      "Acesso não assistido: o computador cadastrado no painel recebe a conexão sem depender de alguém para aceitar, e cada sessão fica registrada na auditoria.",
  },
];

const plataformas = [
  { icon: Monitor, nome: "Windows", pronto: true },
  { icon: Smartphone, nome: "Android", pronto: true },
  { icon: Laptop, nome: "macOS", pronto: false },
  { icon: TabletSmartphone, nome: "iOS", pronto: false },
];

function ComoSurgiuPage() {
  return (
    <div className="min-h-screen text-text">
      <Header />
      <main>
        <section className="mesh-hero relative overflow-hidden pt-36 pb-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Como surgiu
            </p>
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-text sm:text-6xl">
              Nasceu dentro de uma operação de suporte.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-text-muted">
              O AcessoFast foi desenvolvido por uma equipe de suporte técnico a partir de quatro
              limitações recorrentes nas ferramentas de acesso remoto: limite de acessos, contratos
              pouco transparentes, falta de organização dos endpoints e aceite manual a cada sessão.
            </p>
          </div>
        </section>

        <section id="problema" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                O problema
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                Quatro limitações que travavam a operação.
              </h2>
            </div>
            <SpotlightGroup className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {dores.map(({ icon: Icon, title, desc }) => (
                <SpotlightCard key={title} className="bg-surface p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/15 text-danger">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-text">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{desc}</p>
                </SpotlightCard>
              ))}
            </SpotlightGroup>
          </div>
        </section>

        <section id="decisao" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                A decisão
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                Desenvolver uma ferramenta própria, em 10 dias.
              </h2>
            </div>
            <ol className="relative mt-12 max-w-3xl space-y-10 border-l border-border-strong pl-8">
              {missao.map((m, i) => (
                <li key={m.quando} className="relative">
                  <span
                    aria-hidden
                    className={
                      "absolute -left-[41px] top-1 h-4 w-4 rounded-full border-4 border-bg " +
                      (i === missao.length - 1 ? "bg-border-strong" : "bg-primary")
                    }
                  />
                  <p className="font-mono text-sm font-semibold text-primary">{m.quando}</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-text">{m.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{m.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="resultado" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                O resultado
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                Cada limitação virou uma decisão de produto.
              </h2>
            </div>
            <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {respostas.map((r) => (
                <li
                  key={r.dor}
                  className="flex items-start gap-4 rounded-card border border-border bg-surface p-6 shadow-soft"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="text-sm text-text-faint line-through decoration-text-faint/60">
                      {r.dor}
                    </p>
                    <p className="mt-1 text-[15px] leading-relaxed text-text">{r.resposta}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="plataformas" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Plataformas
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                Em operação no Windows e no Android.
              </h2>
            </div>
            <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {plataformas.map(({ icon: Icon, nome, pronto }) => (
                <li
                  key={nome}
                  className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-6 text-center"
                >
                  <Icon
                    className={"h-8 w-8 " + (pronto ? "text-text" : "text-text-faint")}
                    strokeWidth={1.5}
                  />
                  {nome === "Android" ? (
                    <a
                      href="/android"
                      className="text-lg font-semibold text-text hover:text-primary"
                    >
                      {nome}
                    </a>
                  ) : (
                    <p className="text-lg font-semibold text-text">{nome}</p>
                  )}
                  <span
                    className={
                      "rounded-full px-2.5 py-0.5 text-xs font-medium " +
                      (pronto ? "bg-success/15 text-success" : "bg-white/5 text-text-muted")
                    }
                  >
                    {pronto ? "Em operação" : "Em desenvolvimento"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-card border border-border bg-surface px-6 py-12 text-center shadow-soft sm:px-12">
            <Otto estado="concluido" seguirMouse className="w-28" />
            <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              Feito por técnicos, para técnicos.
            </h2>
            <p className="max-w-xl text-lg text-text-muted">
              Se a sua operação esbarra nas mesmas limitações, o AcessoFast foi feito para ela.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/#preco"
                data-otto-feliz
                className="inline-flex h-12 items-center gap-2 rounded-btn bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]"
              >
                Ver planos
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/#contato"
                className="inline-flex h-12 items-center rounded-btn border border-border-strong px-6 text-sm font-semibold text-text transition-colors hover:bg-white/5"
              >
                Falar com especialista
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
