import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Otto, type OttoEstado } from "@/components/otto/otto";
import { cn } from "@/lib/utils";

// A frase do topo do site, encenada: um computador com problema, o Otto conecta,
// atende e resolve. "Conectou." e "Resolveu." acendem junto com a cena, em
// laço. Para quem pediu movimento reduzido, fica parada no final feliz.

type Fase = "problema" | "conectando" | "atendendo" | "resolvido";

const ROTEIRO: { fase: Fase; dura: number }[] = [
  { fase: "problema", dura: 1500 },
  { fase: "conectando", dura: 1400 },
  { fase: "atendendo", dura: 1700 },
  { fase: "resolvido", dura: 2900 },
];

const CARA: Record<Fase, OttoEstado> = {
  problema: "parado",
  conectando: "conectando",
  atendendo: "atendendo",
  resolvido: "concluido",
};

const TELA: Record<Fase, string> = {
  problema: "#2a1217",
  conectando: "#121a2c",
  atendendo: "#10204a",
  resolvido: "#0e281f",
};

/** O computador do cliente, do outro lado da conexão. */
function Computador({ fase }: { fase: Fase }) {
  return (
    <svg viewBox="0 0 100 90" className="h-full w-full overflow-visible" aria-hidden>
      <rect
        x={6}
        y={4}
        width={88}
        height={62}
        rx={11}
        fill="#1b2232"
        stroke="#2d3852"
        strokeWidth={2}
      />
      <rect
        x={14}
        y={12}
        width={72}
        height={46}
        rx={6}
        fill={TELA[fase]}
        className="transition-[fill] duration-500"
      />
      <rect x={44} y={66} width={12} height={11} fill="#2d3852" />
      <rect x={30} y={76} width={40} height={8} rx={4} fill="#2d3852" />

      {fase === "problema" && (
        <g className="otto-cena-alerta">
          <circle cx={50} cy={35} r={13} fill="#f05252" opacity={0.25} />
          <circle cx={50} cy={35} r={9} fill="#f05252" />
          <path d="M50 29.5V36" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
          <circle cx={50} cy={40} r={1.6} fill="#fff" />
        </g>
      )}
      {fase === "conectando" && (
        <g fill="#64a4ff">
          <circle className="otto-cena-ponto" cx={40} cy={35} r={3} />
          <circle className="otto-cena-ponto" cx={50} cy={35} r={3} />
          <circle className="otto-cena-ponto" cx={60} cy={35} r={3} />
        </g>
      )}
      {fase === "atendendo" && (
        <g>
          <rect x={22} y={20} width={56} height={30} rx={3} fill="#1d3a7a" />
          <rect x={22} y={20} width={56} height={6} rx={3} fill="#2c67fa" />
          <path className="otto-cena-cursor" d="M0 0V12L3 9 5.5 14 8 13 5.5 8H10Z" fill="#fff" />
        </g>
      )}
      {fase === "resolvido" && (
        <g>
          <circle cx={50} cy={35} r={14} fill="#31c48d" opacity={0.22} />
          <path
            d="M42 35.5 47.5 41 58.5 29.5"
            fill="none"
            stroke="#31c48d"
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
}

export function OttoCena() {
  const [passo, setPasso] = useState(ROTEIRO.length - 1);
  const fase = ROTEIRO[passo].fase;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let atual = 0;
    let timer = 0;
    const avancar = () => {
      setPasso(atual);
      timer = window.setTimeout(() => {
        atual = (atual + 1) % ROTEIRO.length;
        avancar();
      }, ROTEIRO[atual].dura);
    };
    avancar();
    return () => window.clearTimeout(timer);
  }, []);

  const ligado = fase !== "problema";
  const conectou = fase === "atendendo" || fase === "resolvido";
  const resolveu = fase === "resolvido";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* O Otto da cena é também a porta para a página dele: mascote atrai clique. */}
        <Link
          to="/otto"
          aria-label="Conheça o Otto"
          title="Conheça o Otto"
          className="rounded-full outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Otto estado={CARA[fase]} olhar={[1, 0.1]} className="w-20 sm:w-24" />
        </Link>
        {/* a conexão: some no problema, corre azul enquanto conecta e atende, fica verde no
            fim. Só anima ao ligar; no recomeço do laço some de uma vez. */}
        <div
          aria-hidden
          className="relative h-1 w-20 overflow-hidden rounded-full bg-white/5 sm:w-32"
        >
          <div
            className={cn(
              "otto-cena-fio absolute inset-0 origin-left rounded-full",
              ligado && "transition-transform duration-700 ease-out",
              resolveu && "otto-cena-fio-ok",
            )}
            style={{ transform: `scaleX(${ligado ? 1 : 0})` }}
          />
        </div>
        <div aria-hidden className="w-16 sm:w-20">
          <Computador fase={fase} />
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em]">
        <span
          className={cn(
            "transition-colors duration-500",
            conectou ? "text-primary" : "text-text-faint",
          )}
        >
          Conectou.
        </span>{" "}
        <span
          className={cn(
            "transition-colors duration-500",
            resolveu ? "text-success" : "text-text-faint",
          )}
        >
          Resolveu.
        </span>
      </p>
    </div>
  );
}
