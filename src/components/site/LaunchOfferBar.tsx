import { useEffect, useState, type CSSProperties } from "react";

import { Zap } from "lucide-react";

import {
  ProgressiveFluxLoader,
  type ProgressiveFluxPhase,
} from "@/components/ui/progressive-flux-loader";
import type { LaunchOffer } from "@/lib/launch-offer";

/* Não aparecem na tela (o rótulo grande do loader fica desligado): é o que o
   leitor de tela anuncia junto com a porcentagem, via aria-valuetext. */
const FASES: ProgressiveFluxPhase[] = [
  { at: 0, label: "vagas abertas" },
  { at: 50, label: "metade das vagas preenchidas" },
  { at: 80, label: "últimas vagas" },
  { at: 100, label: "vagas esgotadas" },
];

/* As duas pontas do gradiente saem do tema em vez do azul embutido no
   componente, para a barra ser da marca e não de outro produto. */
const CORES_DA_MARCA = {
  "--flux-from": "var(--primary)",
  "--flux-to": "var(--brand-cyan)",
} as CSSProperties;

/**
 * Aviso da oferta de lançamento + barra de vagas.
 *
 * A barra é o próprio argumento de escassez: enche sozinha a cada empresa que
 * fecha contrato (public.launch_offer_status conta as assinaturas pagas), e
 * quando enche a oferta acaba e este bloco some da página — quem cuida disso é
 * o `is_active` que vem do banco, não uma data no código.
 *
 * O preenchimento é o ProgressiveFluxLoader com `showLabel={false}`: o rótulo
 * gigante dele é de tela de carregamento e brigaria com o título do card, mas o
 * brilho e o sheen deslizando são justamente o que faz a barra parecer viva em
 * vez de um número parado.
 */
export function LaunchOfferBar({ offer }: { offer: LaunchOffer }) {
  const pct = Math.min(100, Math.round((offer.slots_taken / offer.slots_total) * 100));

  /* A barra nasce vazia e cresce até a posição real depois do primeiro paint:
     ela é o elemento que conta a história, e um preenchimento já pronto na
     montagem passa despercebido. O loader anima a mudança de `value` sozinho. */
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setValue(pct), 120);
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

      {/* idleSheen: com 0 contratações não há preenchimento nenhum para mostrar,
          e uma barra chapada lê como quebrada. O brilho passando pelo trilho diz
          "está valendo, ninguém pegou ainda" sem fingir vaga preenchida. */}
      <ProgressiveFluxLoader
        value={value}
        phases={FASES}
        showLabel={false}
        idleSheen
        style={CORES_DA_MARCA}
        className="mt-4 max-w-none"
        barClassName="h-4 bg-bg/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
        ariaLabel={`Vagas do preço de lançamento: ${offer.slots_taken} de ${offer.slots_total}`}
      />

      <div className="mt-2 flex items-baseline justify-between text-sm">
        <span className="font-semibold text-text">
          {/* Zero vagas preenchidas é notícia boa para quem está lendo: em vez de
              anunciar que ninguém comprou, convida a ser o primeiro. */}
          {offer.slots_taken === 0
            ? `Seja a primeira das ${offer.slots_total} empresas`
            : `${offer.slots_taken} de ${offer.slots_total} vagas preenchidas`}
        </span>
        <span className="text-text-muted">{pct}%</span>
      </div>
    </div>
  );
}
