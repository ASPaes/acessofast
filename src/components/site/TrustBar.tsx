import { useState } from "react";
import { MapPin, ScrollText, Headphones } from "lucide-react";

type ClientLogo = { name: string; src: string } | null;

/* null = vaga ainda sem logo, renderiza o placeholder. */
const CLIENT_LOGOS: ClientLogo[] = [
  { name: "ASP Softwares", src: "/logo-asp.png" },
  null,
  null,
  null,
  null,
];

const badges = [
  { icon: MapPin, label: "Dados em região brasileira" },
  { icon: ScrollText, label: "LGPD-ready" },
  { icon: Headphones, label: "Suporte em PT-BR" },
];

/* Cai no placeholder se a imagem não carregar, pra uma vaga mal preenchida não
   virar ícone quebrado na home. */
function ClientLogoSlot({ logo }: { logo: ClientLogo }) {
  const [failed, setFailed] = useState(false);

  if (!logo || failed) {
    return (
      <div
        data-placeholder="client-logo"
        className="flex h-10 items-center justify-center rounded-md bg-surface-2 text-sm font-medium text-text-muted"
      >
        Logo cliente
      </div>
    );
  }

  return (
    <div className="flex h-10 items-center justify-center rounded-md bg-surface-2 px-3">
      <img
        src={logo.src}
        alt={logo.name}
        className="max-h-6 w-auto object-contain"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function TrustBar() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Confiam na Acessofast
        </p>
        <div className="mt-6 grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-5">
          {CLIENT_LOGOS.map((logo, i) => (
            <ClientLogoSlot key={logo?.name ?? `slot-${i}`} logo={logo} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {badges.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-text"
            >
              <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
