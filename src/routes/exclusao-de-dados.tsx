import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/exclusao-de-dados")({
  component: ExclusaoDeDadosPage,
  head: () => ({
    meta: [
      { title: "Exclusão de dados — Acessofast" },
      {
        name: "description",
        content:
          "Como solicitar a exclusão dos dados do seu aparelho no Acessofast: o que é apagado, o que é mantido e em quanto tempo.",
      },
    ],
  }),
});

function ExclusaoDeDadosPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <Link to="/" className="text-sm font-medium text-primary hover:underline">
          ← Voltar para o site
        </Link>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-text">
          Exclusão de dados
        </h1>
        <p className="mt-4 text-text-muted">
          O Acessofast é um serviço de suporte remoto contratado por empresas. O aplicativo Android
          não cria conta pessoal: quem cadastra o aparelho é a empresa que presta o atendimento.
        </p>
        <div className="prose prose-slate mt-8 max-w-none text-text">
          <h2 className="mt-8 text-xl font-semibold">Como pedir a exclusão</h2>
          <p className="text-text-muted">
            Envie um e-mail para{" "}
            <a
              href="mailto:suporte@acessofast.com.br?subject=Exclus%C3%A3o%20de%20dados"
              className="font-medium text-primary hover:underline"
            >
              suporte@acessofast.com.br
            </a>{" "}
            com o assunto “Exclusão de dados” e informe o número de identificação que aparece na
            tela inicial do aplicativo. Se preferir, informe também o nome da empresa que faz o seu
            atendimento. O pedido é atendido em até 30 dias.
          </p>
          <h2 className="mt-8 text-xl font-semibold">O que é excluído</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-text-muted">
            <li>
              O cadastro do aparelho: número de identificação, apelido, modelo e versão do
              aplicativo.
            </li>
            <li>A credencial de acesso e a senha do aparelho, guardadas de forma cifrada.</li>
            <li>O histórico de atendimentos: data, hora e duração de cada acesso.</li>
          </ul>
          <h2 className="mt-8 text-xl font-semibold">O que é mantido</h2>
          <p className="text-text-muted">
            Registros exigidos por lei, como comprovantes de cobrança do serviço prestado à empresa
            contratante, são mantidos pelo prazo legal. Esses registros não contêm o conteúdo da
            tela nem dados pessoais de quem usa o aparelho.
          </p>
          <h2 className="mt-8 text-xl font-semibold">Desinstalar o aplicativo</h2>
          <p className="text-text-muted">
            Desinstalar o Acessofast encerra o acesso imediatamente, mas não apaga sozinho o
            cadastro do aparelho no nosso sistema. Para isso, envie o pedido pelo e-mail acima.
          </p>
        </div>
      </div>
    </div>
  );
}
