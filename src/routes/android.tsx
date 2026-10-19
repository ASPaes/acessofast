import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Hand, LockKeyhole, ShieldCheck, UserX } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BotaoGooglePlay } from "@/components/site/BotaoGooglePlay";
import { SpotlightCard, SpotlightGroup } from "@/components/site/SpotlightCard";
import { Otto } from "@/components/otto/otto";

export const Route = createFileRoute("/android")({
  component: AndroidPage,
  head: () => ({
    meta: [
      { title: "App AcessoFast para Android — suporte remoto no celular" },
      {
        name: "description",
        content:
          "Com o app AcessoFast para Android, o técnico atende o celular ou tablet à distância: vê a tela, toca e digita, com a autorização de quem está com o aparelho. Disponível no Google Play.",
      },
    ],
  }),
});

// Página do app Android. O que ela promete é o que a ficha da Google Play diz
// (texto publicado em 08/10/2026): o app vai no aparelho que RECEBE o
// atendimento; quem atende usa o AcessoFast no computador. Mudou a ficha,
// mude aqui também — as duas não podem se contradizer.

const passos = [
  "Instale o AcessoFast pelo Google Play e abra o app. Ele mostra um ID e uma senha de acesso.",
  "No computador, o técnico usa o AcessoFast, disponível em acessofast.com.br/download.",
  "Passe esse ID e essa senha para o técnico conectar.",
  "O Android pede autorização para compartilhar a tela. O atendimento só começa depois que você aceita.",
];

const garantias = [
  {
    icon: UserX,
    title: "Sem cadastro no aparelho",
    desc: "O app não tem login e não pede nome, e-mail ou telefone. A identificação é o ID do aparelho, e quem controla o acesso é a senha exibida na tela.",
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

/** Celular ilustrativo, na tela que o app mostra ao abrir: ID e senha. */
function CelularIlustrativo() {
  return (
    <div className="relative w-[210px] shrink-0 rounded-[2.2rem] border border-border-strong bg-[#0b0f18] p-2.5 shadow-soft">
      <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-white/10" />
      <div className="flex h-[360px] flex-col rounded-[1.6rem] border border-border bg-surface px-4 py-5 text-left">
        <p className="text-sm font-semibold text-text">AcessoFast</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Pronto para receber suporte
        </p>
        <div className="mt-8 rounded-xl border border-border bg-bg/60 p-3">
          <p className="text-[11px] uppercase tracking-wide text-text-muted">Seu ID</p>
          <p className="mt-1 font-mono text-lg font-semibold whitespace-nowrap text-text">
            123 456 789
          </p>
        </div>
        <div className="mt-3 rounded-xl border border-border bg-bg/60 p-3">
          <p className="text-[11px] uppercase tracking-wide text-text-muted">Senha</p>
          <p className="mt-1 font-mono text-xl font-semibold tracking-[0.2em] text-text">••••••</p>
        </div>
        <p className="mt-auto text-center text-xs leading-relaxed text-text-muted">
          Passe esses dados para o técnico que vai te atender.
        </p>
      </div>
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
                Com o app AcessoFast para Android, o técnico atende o celular ou o tablet à
                distância: vê a tela, toca e digita, com a autorização de quem está com o aparelho.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <BotaoGooglePlay />
                <p className="text-sm text-text-muted">
                  Grátis para instalar · Android 7.0 ou mais novo
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-5" aria-hidden>
              <Otto
                estado="conectando"
                olhar={[1, 0.15]}
                className="hidden w-24 sm:block sm:w-28"
              />
              <div className="relative hidden h-1 w-14 overflow-hidden rounded-full bg-white/5 sm:block sm:w-20">
                <div className="otto-cena-fio absolute inset-0 rounded-full" />
              </div>
              <CelularIlustrativo />
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-6xl px-6 text-right text-xs text-text-faint">
            Tela ilustrativa.
          </p>
        </section>

        <section id="android-passos" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Como funciona
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                Do celular do cliente ao atendimento em quatro passos.
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

        <section id="android-uso" className="py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Para quem é
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
                Para quem atende aparelhos Android à distância.
              </h2>
            </div>
            <div className="space-y-4 text-lg leading-relaxed text-text-muted">
              <p>
                Ferramenta profissional para equipes de TI e prestadores de suporte: conferir uma
                configuração, orientar um usuário, resolver um problema sem deslocamento.
              </p>
              <p>
                O app vai no aparelho que <strong className="text-text">recebe</strong> o
                atendimento. Quem atende usa o AcessoFast no computador, como em qualquer outro
                atendimento.
              </p>
            </div>
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
              Baixe o app e comece a atender celulares.
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
