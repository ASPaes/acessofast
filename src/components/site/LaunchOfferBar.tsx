import { useEffect, useMemo, useState, type CSSProperties } from "react";

import {
  DIMMED_TRACK,
  ProgressiveFluxLoader,
  type ProgressiveFluxPhase,
} from "@/components/ui/progressive-flux-loader";
import type { LaunchOffer } from "@/lib/launch-offer";

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
 */
export function LaunchOfferBar({ offer }: { offer: LaunchOffer }) {
  const pct = Math.min(100, Math.round((offer.slots_taken / offer.slots_total) * 100));

  /* Sem nenhuma contratação a barra ficaria parada em zero, que é o momento em
     que ela mais precisa chamar atenção. Então enquanto o contador está zerado
     ela roda o sweep em loop (o modo sem `value` do componente) e vira enfeite;
     na primeira empresa que fecha, passa a marcar a posição real e nunca mais
     volta a girar. */
  const aindaSemContratacoes = offer.slots_taken === 0;

  /* A barra nasce vazia e cresce até a posição real depois do primeiro paint:
     ela é o elemento que conta a história, e um preenchimento já pronto na
     montagem passa despercebido. O loader anima a mudança de `value` sozinho. */
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setValue(pct), 120);
    return () => window.clearTimeout(timer);
  }, [pct]);

  /* Uma fase só, com o número real dentro: o rótulo do loader reanima toda vez
     que o texto muda, então cada empresa nova faz a contagem voar na tela. Com
     várias faixas fixas ("metade", "últimas") o número sumiria, que é o dado que
     importa aqui. */
  const fases: ProgressiveFluxPhase[] = useMemo(
    () => [
      {
        at: 0,
        label:
          offer.slots_left === 0
            ? "vagas esgotadas"
            : offer.slots_left === 1
              ? "última vaga"
              : `restam ${offer.slots_left} vagas`,
      },
    ],
    [offer.slots_left],
  );

  return (
    // Sem card: o bloco fica sobre o fundo da página, sem moldura nem fundo próprio.
    <div className="mx-auto mt-14 max-w-2xl text-center">
      <h3 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Preço de lançamento · {offer.discount_percent}% de desconto
      </h3>

      <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
        Válido apenas para as{" "}
        <strong className="font-semibold text-text">primeiras {offer.slots_total} empresas</strong>{" "}
        contratantes.{" "}
        {offer.discount_months === null ? (
          <>O valor promocional vale enquanto a assinatura durar.</>
        ) : (
          <>
            O valor promocional vale pelos{" "}
            <strong className="font-semibold text-text">
              {offer.discount_months} primeiros meses
            </strong>
            ; depois disso, volta o preço de tabela.
          </>
        )}
      </p>

      {/* trackBackground: com 0 contratações não há preenchimento para mostrar,
          e um trilho cinza lê como quebrado. O trilho apagado na cor da marca já
          é a barra — o fill só acende o pedaço vendido. */}
      <ProgressiveFluxLoader
        // Sem `value` o loader assume o comando e roda sozinho, em loop.
        {...(aindaSemContratacoes ? { duration: 3.5, loop: true } : { value })}
        phases={fases}
        style={CORES_DA_MARCA}
        trackBackground={DIMMED_TRACK}
        className="mt-6 max-w-none gap-4"
        /* O componente traz sombra de tema claro no trilho (com uma linha
             branca embaixo) e o `dark:` dele não pega aqui, porque este site não
             usa a classe .dark — é escuro direto no :root. */
        barClassName="shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)]"
        textClassName="text-2xl font-bold text-text sm:text-3xl"
        ariaLabel={`Vagas do preço de lançamento: ${offer.slots_taken} de ${offer.slots_total}`}
      />

      <div className="mt-3 flex items-baseline justify-center gap-2 text-sm">
        <span className="font-semibold text-text">
          {/* Zero vagas preenchidas é notícia boa para quem está lendo: em vez de
              anunciar que ninguém comprou, convida a ser o primeiro. */}
          {aindaSemContratacoes
            ? `Seja a primeira das ${offer.slots_total} empresas`
            : `${offer.slots_taken} de ${offer.slots_total} vagas preenchidas`}
        </span>
        {/* Com a barra girando, um "0%" fixo ao lado desmentiria o que se vê. */}
        {!aindaSemContratacoes && <span className="text-text-muted">· {pct}%</span>}
      </div>
    </div>
  );
}
