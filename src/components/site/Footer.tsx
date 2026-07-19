import logoAsset from "@/assets/acessofast-logo-real.png.asset.json";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <img
              src={logoAsset.url}
              alt="Acessofast"
              className="h-11 w-auto"
              width={256}
              height={195}
            />
            <p className="mt-4 max-w-sm text-sm text-text-muted">
              Plataforma brasileira de acesso remoto e suporte de TI. Um produto da ASP Softwares.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-text">Produto</p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li><a href="#recursos" className="hover:text-text">Recursos</a></li>
              <li><a href="#diferenciais" className="hover:text-text">Diferenciais</a></li>
              <li><a href="#preco" className="hover:text-text">Preço</a></li>
              <li><a href="#faq" className="hover:text-text">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-text">Contato</p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li><a href="#contato" className="hover:text-text">Falar com especialista</a></li>
              <li><a href="/privacidade" className="hover:text-text">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-text-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} ASP Softwares. Todos os direitos reservados.</span>
          <span>Feito no Brasil · Dados em região brasileira</span>
        </div>
      </div>
    </footer>
  );
}
