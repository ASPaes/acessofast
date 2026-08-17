import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect não existe no servidor (e o React avisa se for chamado lá).
 * No cliente ele roda antes do paint, que é o que evita o pisca de um quadro
 * quando o efeito mede o DOM e reposiciona algo.
 */
export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
