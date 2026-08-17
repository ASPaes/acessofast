import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Repassa a posição do cursor para TODOS os cards do grupo, cada um em
 * coordenadas próprias. Como é o mesmo ponto convertido para vários sistemas,
 * a luz continua de um card para o vizinho em vez de recomeçar em cada borda.
 */
function trackSpotlight(event: PointerEvent<HTMLDivElement>) {
  const cards = event.currentTarget.querySelectorAll<HTMLElement>("[data-spotlight]");
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  });
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
