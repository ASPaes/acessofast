import { MapPin, ScrollText, Headphones } from "lucide-react";

export function TrustBar() {
  const badges = [
    { icon: MapPin, label: "Dados em região brasileira" },
    { icon: ScrollText, label: "LGPD-ready" },
    { icon: Headphones, label: "Suporte em PT-BR" },
  ];
  return (
    <section className="border-y border-border bg-surface/60 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Confiam na Acessofast
        </p>
        <div className="mt-6 grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              data-placeholder="client-logo"
              className="flex h-10 items-center justify-center rounded-md bg-surface-2 text-sm font-medium text-text-muted"
            >
              Logo cliente
            </div>
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
