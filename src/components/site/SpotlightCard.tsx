import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Repassa a posição do cursor para TODOS os cards do grupo, cada um em
 * coordenadas próprias. Como é o mesmo ponto convertido para vários sistemas,
 * a luz continua de um card para o vizinho em vez de recomeçar em cada borda.
 */
/* pointermove dispara muito mais que 60x por segundo, e cada volta lê o rect de
   todos os cards — leitura que força o navegador a recalcular layout no meio do
   movimento do mouse. Então guardamos só a última posição e aplicamos uma vez
   por quadro, que é a taxa em que a tela realmente muda. */
let pendingFrame = 0;
let pendingHost: HTMLElement | null = null;
let pendingX = 0;
let pendingY = 0;

function applySpotlight() {
  pendingFrame = 0;
  const host = pendingHost;
  if (!host) return;
  const cards = host.querySelectorAll<HTMLElement>("[data-spotlight]");
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${pendingX - rect.left}px`);
    card.style.setProperty("--spot-y", `${pendingY - rect.top}px`);
  });
}

function trackSpotlight(event: PointerEvent<HTMLDivElement>) {
  pendingHost = event.currentTarget;
  pendingX = event.clientX;
  pendingY = event.clientY;
  if (pendingFrame) return;
  pendingFrame = requestAnimationFrame(applySpotlight);
}

/**
 * Container dos cards — normalmente a própria grade. É ele que segue o cursor e
 * que dispara o brilho no hover, para a luz já existir nos cards vizinhos quando
 * chegar perto deles.
 */
export function SpotlightGroup({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div onPointerMove={trackSpotlight} className={cn("spotlight-host", className)}>
      {children}
    </div>
  );
}

export function SpotlightCard({
  /** Moldura mais grossa na cor primária, para o card em destaque. */
  strong = false,
  /** Vai na superfície interna: cor de fundo, padding, layout. */
  className,
  /** Vai na moldura externa: hover, sombra. */
  wrapperClassName,
  children,
}: {
  strong?: boolean;
  className?: string;
  wrapperClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-spotlight
      className={cn(
        "spotlight h-full",
        strong ? "spotlight-strong" : "shadow-soft",
        wrapperClassName,
      )}
    >
      <div className={cn("spotlight-inner", className)}>{children}</div>
    </div>
  );
}
