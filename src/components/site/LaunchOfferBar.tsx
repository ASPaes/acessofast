import { useEffect, useState } from "react";

import { Zap } from "lucide-react";

import type { LaunchOffer } from "@/lib/launch-offer";

/**
 * Aviso da oferta de lançamento + barra de vagas.
 *
 * A barra é o próprio argumento de escassez: enche sozinha a cada empresa que
 * fecha contrato (public.launch_offer_status conta as assinaturas pagas), e
 * quando enche a oferta acaba e este bloco some da página — quem cuida disso é
 * o `is_active` que vem do banco, não uma data no código.
 */
export function LaunchOfferBar({ offer }: { offer: LaunchOffer }) {
  const pct = Math.min(100, Math.round((offer.slots_taken / offer.slots_total) * 100));

  /* A barra nasce vazia e cresce até a posição real depois do primeiro paint:
     ela é o elemento que conta a história, e um preenchimento já pronto na
     montagem passa despercebido. */
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setWidth(pct), 120);
    return () => window.clearTimeout(timer);
  }, [pct]);

  const restantes = offer.slots_left;

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-card border border-brand/30 bg-brand-soft/60 p-5 text-left shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-text">
          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand/15 text-brand">
            <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          Preço de lançamento · {offer.discount_percent}% de desconto
        </span>
        <span className="rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand">
          {restantes === 1 ? "Última vaga" : `Restam ${restantes} vagas`}
        </span>
      </div>

      <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
        Válido apenas para as{" "}
        <strong className="font-semibold text-text">primeiras {offer.slots_total} empresas</strong>{" "}
        contratantes. Quem entrar nessa janela mantém o valor promocional na renovação; depois
        disso, volta o preço de tabela.
      </p>

      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-border-strong"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={offer.slots_total}
        aria-valuenow={offer.slots_taken}
        aria-label={`${offer.slots_taken} de ${offer.slots_total} vagas preenchidas`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-cyan transition-[width] duration-1000 ease-out motion-reduce:transition-none"
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="mt-2 flex items-baseline justify-between text-sm">
        <span className="font-semibold text-text">
          {offer.slots_taken} de {offer.slots_total} vagas preenchidas
        </span>
        <span className="text-text-muted">{pct}%</span>
      </div>
    </div>
  );
}
