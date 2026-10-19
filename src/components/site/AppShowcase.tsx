import { PrototipoDesktop } from "@/components/site/PrototipoDesktop";

export function AppShowcase() {
  return (
    <section id="app" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">O app</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            Simples para o técnico. Claro para o cliente.
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            O AcessoFast instalado no computador: tudo em português, com abas para atender vários
            clientes ao mesmo tempo.
          </p>
        </div>
        <div className="mt-12">
          <PrototipoDesktop />
        </div>
        <p className="mt-4 text-center text-xs text-text-faint">
          Protótipo do app AcessoFast · clique à vontade: conecte num computador, abra os arquivos e
          use o simulador embaixo da janela. Dados ilustrativos.
        </p>
      </div>
    </section>
  );
}
