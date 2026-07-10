import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  component: PrivacidadePage,
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Acessofast" },
      {
        name: "description",
        content:
          "Política de Privacidade da Acessofast: como tratamos seus dados conforme a LGPD.",
      },
    ],
  }),
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <Link to="/" className="text-sm font-medium text-primary hover:underline">
          ← Voltar para o site
        </Link>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-text">
          Política de Privacidade
        </h1>
        <p className="mt-4 text-text-muted">
          Esta é uma versão preliminar da Política de Privacidade da Acessofast, um produto
          da ASP Softwares. O documento completo será publicado em breve.
        </p>
        <div className="prose prose-slate mt-8 max-w-none text-text">
          <h2 className="mt-8 text-xl font-semibold">Dados que coletamos</h2>
          <p className="text-text-muted">
            Coletamos apenas as informações fornecidas voluntariamente no formulário de
            contato (nome, empresa, e-mail corporativo, telefone, tamanho da equipe,
            segmento e mensagem) com o objetivo de apresentar a solução e responder à sua
            solicitação.
          </p>
          <h2 className="mt-8 text-xl font-semibold">Base legal (LGPD)</h2>
          <p className="text-text-muted">
            O tratamento se baseia no seu consentimento e no legítimo interesse para
            atendimento comercial B2B.
          </p>
          <h2 className="mt-8 text-xl font-semibold">Seus direitos</h2>
          <p className="text-text-muted">
            Você pode solicitar a qualquer momento acesso, correção ou exclusão dos seus
            dados. Basta responder ao contato do nosso time comercial.
          </p>
        </div>
      </div>
    </div>
  );
}
