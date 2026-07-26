import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/obrigado")({
  component: ObrigadoPage,
  head: () => ({
    meta: [
      { title: "Pagamento confirmado — Acessofast" },
      {
        name: "description",
        content:
          "Pagamento confirmado. Em instantes você recebe um e-mail com o link para definir sua senha e acessar o painel do Acessofast.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ObrigadoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <section className="mx-auto w-full max-w-xl rounded-card border border-border bg-surface p-8 text-center shadow-soft sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Pagamento confirmado!
          </h1>

          <p className="mx-auto mt-4 max-w-md text-pretty text-lg leading-relaxed text-text">
            Estamos preparando sua conta. Em instantes você receberá um e-mail com o link para
            definir sua senha e acessar o painel.
          </p>

          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-text-muted">
            Não recebeu em alguns minutos? Verifique sua caixa de spam. O e-mail é enviado para o
            endereço usado na compra.
          </p>

          <div className="mt-8 border-t border-border pt-6">
            <a
              href="https://app.acessofast.com.br"
              className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Já definiu sua senha? Entrar no painel
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
