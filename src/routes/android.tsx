import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Hand,
  LockKeyhole,
  Monitor,
  ShieldCheck,
  Smartphone,
  UserX,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BotaoGooglePlay } from "@/components/site/BotaoGooglePlay";
import { SpotlightCard, SpotlightGroup } from "@/components/site/SpotlightCard";
import { Otto } from "@/components/otto/otto";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/android")({
  component: AndroidPage,
  head: () => ({
    meta: [
      { title: "App AcessoFast para Android — suporte remoto no celular" },
      {
        name: "description",
        content:
          "No app AcessoFast para Android, o celular ou tablet é atendido à distância, com a autorização de quem está com ele, e o técnico acessa os computadores da empresa pelo celular. Disponível no Google Play.",
      },
    ],
  }),
});

// Página do app Android. O que ela promete é o que o app publicado faz, no
// mesmo desenho do protótipo abaixo e das imagens da ficha da Google Play
// (08/10/2026): o celular pode ser atendido, e o técnico entra com a conta do
// painel para acessar os computadores. Para ser atendido, o app mostra só o
// ID: a senha é automática pelo painel, e quem vem de fora precisa da
// aprovação de quem está com o celular. (A descrição longa da ficha ainda fala
// em "ID e senha", do app de antes.) Mudou o app, mude aqui também.
//
// O celular do topo é o protótipo clicável do app (public/prototipo-android),
// cópia de acessofast-desktop/prototipo-mobile no commit a27fd46 (20/10/2026, com o Otto),
// a mesma base que gerou as imagens da ficha. Única mudança na cópia: noindex.

const LADOS = {
  atendido: {
    rotulo: "Ser atendido",
    src: "/prototipo-android/index.html?embed=1&cen=cliente&tab=celular&tema=escuro",
  },
  tecnico: {
    rotulo: "Atender pelo celular",
    src: "/prototipo-android/index.html?embed=1&cen=plano&tab=acessar&tema=escuro",
  },
} as const;
type Lado = keyof typeof LADOS;

const passos = [
  "Instale o AcessoFast pelo Google Play e abra o app. Ele mostra o ID deste celular.",
  "No computador, o técnico usa o AcessoFast, disponível em acessofast.com.br/download, e conecta com esse ID.",
  "Celular cadastrado no painel da empresa: o técnico entra direto, com a senha automática. Fora do painel, o pedido aparece no celular e só entra quem você aprovar.",
  "O Android pede autorização para compartilhar a tela. O atendimento só começa depois que você aceita.",
];

const doisLados = [
  {
    icon: Smartphone,
    title: "Ser atendido",
    desc: "O celular ou tablet recebe o suporte. Sem cadastro: o app mostra o ID do aparelho, o técnico conecta e o Android pede a sua autorização antes de começar.",
  },
  {
    icon: Monitor,
    title: "Atender pelo celular",
    desc: "O técnico entra com a conta do painel e vê os computadores da empresa agrupados por cliente, com situação, marcadores e busca por nome, ID ou CNPJ. Conecta com um toque.",
  },
];

const garantias = [
  {
    icon: UserX,
    title: "Sem cadastro para ser atendido",
    desc: "Quem recebe o suporte não faz login nem informa nome, e-mail ou telefone. A identificação é o ID do aparelho. Os técnicos da empresa entram pela senha automática do painel; qualquer outra pessoa só entra se você aprovar na hora.",
  },
  {
    icon: Hand,
    title: "Você autoriza cada atendimento",
    desc: "Nenhuma sessão começa sem a permissão de compartilhar a tela, pedida pelo próprio Android a quem está com o aparelho.",
  },
  {
    icon: ShieldCheck,
    title: "Toque e digitação só na sessão",
    desc: "O serviço de Acessibilidade do Android reproduz os toques e a digitação do técnico durante o atendimento autorizado, e para nada além disso.",
  },
  {
    icon: LockKeyhole,
    title: "Criptografado e sem gravação",
    desc: "Tela, toques, mensagens e arquivos trafegam criptografados entre os dois aparelhos e não são gravados pelo AcessoFast.",
  },
];

/**
 * O protótipo dentro de um celular. A tela do protótipo é desenhada em 390x844
 * (um celular comum) e entra reduzida para caber na moldura, sem mudar nada
 * nela: toque, rolagem e navegação funcionam como no app.
 */
function CelularComPrototipo() {
  const [lado, setLado] = useState<Lado>("atendido");
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-[2.6rem] bg-[#05080e] p-[9px] shadow-[0_0_0_1.5px_#2a3448,0_40px_80px_-20px_rgba(0,0,0,0.8),0_0_120px_-20px_rgba(44,103,250,0.35)]">
        <div className="relative h-[649px] w-[300px] overflow-hidden rounded-[2.1rem] bg-[#060d18]">
          <iframe
            key={lado}
            src={LADOS[lado].src}
            title={`Protótipo do app AcessoFast para Android: ${LADOS[lado].rotulo}`}
            scrolling="no"
            loading="lazy"
            className="absolute top-0 left-0 h-[844px] w-[390px] origin-top-left scale-[0.76923] border-0"
          />
        </div>
      </div>
      <div className="inline-flex rounded-full border border-border bg-bg p-1" role="group">
        {(Object.keys(LADOS) as Lado[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLado(l)}
            aria-pressed={lado === l}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              lado === l ? "bg-primary text-primary-foreground" : "text-text-muted hover:text-text",
            )}
          >
            {LADOS[l].rotulo}
          </button>
        ))}
      </div>
      <p className="text-xs text-text-faint">
        Protótipo do app · toque para navegar. Dados ilustrativos.
      </p>
    </div>
  );
}

function AndroidPage() {
  return (
    <div className="min-h-screen text-text">
      <Header />
      <main>
        <section className="mesh-hero relative overflow-hidden pt-36 pb-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                App Android
              </p>
              <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-text sm:text-6xl">
                Suporte remoto também no celular.
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-text-muted">
                No app AcessoFast para Android, o celular ou tablet é atendido à distância, com a
                autorização de quem está com ele. E o técnico acessa os computadores da empresa pelo
                celular, entrando com a conta do painel.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <BotaoGooglePlay />
                <p className="text-sm text-text-muted">
                  Grátis para instalar · Android 7.0 ou mais novo
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-5">
              {/* O Otto conectando no celular, só onde sobra espaço ao lado dele. */}
              <div className="hidden items-center gap-5 xl:flex" aria-hidden>
                <Otto estado="conectando" olhar={[1, 0.15]} className="w-24" />
                <div className="relative h-1 w-14 overflow-hidden rounded-full bg-white/5">
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="otto-cena-listra" />
                  </div>
                </div>
              </div>
              <CelularComPrototipo />
            </div>
          </div>
        </section>

        <section id="android-uso" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Um app, dois lados
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                Para quem recebe o suporte e para quem atende.
              </h2>
            </div>
            <SpotlightGroup className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {doisLados.map(({ icon: Icon, title, desc }) => (
                <SpotlightCard key={title} className="bg-surface p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-text">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{desc}</p>
                </SpotlightCard>
              ))}
            </SpotlightGroup>
          </div>
        </section>

        <section id="android-passos" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Como funciona
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                Para ser atendido pelo celular, quatro passos.
              </h2>
            </div>
            <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {passos.map((p, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 rounded-card border border-border bg-surface p-6 shadow-soft"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-[15px] leading-relaxed text-text">{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="android-seguranca" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Segurança e privacidade
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                O controle fica com quem está com o aparelho.
              </h2>
            </div>
            <SpotlightGroup className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {garantias.map(({ icon: Icon, title, desc }) => (
                <SpotlightCard key={title} className="bg-surface p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-text">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{desc}</p>
                </SpotlightCard>
              ))}
            </SpotlightGroup>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-card border border-border bg-surface px-6 py-12 text-center shadow-soft sm:px-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
              Leve o AcessoFast no bolso.
            </h2>
            <p className="max-w-xl text-lg text-text-muted">
              O AcessoFast é contratado pela empresa no painel web. Não há compra dentro do app.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <BotaoGooglePlay />
              <a
                href="/#preco"
                className="inline-flex h-14 items-center gap-2 rounded-btn border border-border-strong px-6 text-sm font-semibold text-text transition-colors hover:bg-white/5"
              >
                Ver planos
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
