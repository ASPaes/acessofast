import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/baixar")({
  component: BaixarPage,
  head: () => ({
    meta: [
      { title: "Baixar o Acessofast — app de acesso remoto para Windows" },
      {
        name: "description",
        content:
          "Baixe o aplicativo Acessofast para Windows e receba suporte remoto do seu time de TI, com a sua autorização. Sem cadastro.",
      },
    ],
  }),
});

const steps = [
  "Baixe e abra o instalador do Acessofast.",
  "Informe o ID e a senha exibidos ao seu técnico.",
  "Pronto — o atendimento começa com a sua autorização.",
];

function BaixarPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <section className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Recebeu um pedido de suporte?
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            Baixe o Acessofast
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-lg text-text-muted">
            Instale o aplicativo, informe seu ID ao técnico e pronto. Sem cadastro, sem configuração.
          </p>

          <a
            href="https://github.com/ASPaes/acessofast-agent/releases/latest/download/AcessoFastSetup.exe"
            className="group mt-8 inline-flex h-14 items-center gap-3 rounded-btn bg-primary px-8 text-base font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]"
          >
            <Download className="h-5 w-5" strokeWidth={2} />
            Baixar para Windows
          </a>

          <p className="mt-3 text-sm text-text-muted">
            Windows 10 ou superior · instalador .exe
          </p>

          <ol className="mt-10 space-y-4 text-left">
            {steps.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-card border border-border bg-surface p-4 shadow-soft"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-[15px] leading-relaxed text-text">{s}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            <Link
              to="/"
              className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              ← Voltar para o site
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
