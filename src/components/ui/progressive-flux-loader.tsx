"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type Transition,
} from "framer-motion";

import { cn } from "@/lib/utils";

/* ── types ───────────────────────────────────────────────────── */

export interface ProgressiveFluxPhase {
  /** Progress threshold (`0`–`100`) at or past which `label` is shown. */
  at: number;
  /** Text revealed once this threshold is reached. */
  label: string;
}

export interface ProgressiveFluxLoaderProps {
  /**
   * Controlled progress, `0`–`100`. When set, the loader follows this value and
   * the phase label switches at the configured thresholds. Omit it to let the
   * loader run its own looping sweep.
   */
  value?: number;
  /** Phase thresholds and their labels. Each `at` is a `0`–`100` mark. */
  phases?: ProgressiveFluxPhase[];
  /** Seconds for one full sweep when uncontrolled. Default `12`. */
  duration?: number;
  /** Restart from `0` after reaching `100` (uncontrolled only). Default `true`. */
  loop?: boolean;
  /** Show the animated phase label above the bar. Default `true`. */
  showLabel?: boolean;
  /**
   * CSS background for the empty part of the track. Defaults to the theme's
   * `muted`. Pass a dimmed version of the fill to get an "unlit tube" that the
   * fill lights up — worth it when the bar can sit near zero for a while (a
   * seat counter, a quota), where a neutral track reads as broken rather than
   * as "nothing yet".
   */
  trackBackground?: string;
  /**
   * CSS background for the bar fill. Defaults to the signature vivid blue → cyan
   * flux gradient. Pass any CSS background to replace it, or recolor the default
   * via the `--flux-from` / `--flux-to` CSS variables (e.g. set them to
   * `hsl(var(--primary))` to follow the theme).
   */
  gradient?: string;
  /** Fires once when progress reaches `100` — in both controlled and uncontrolled modes. */
  onComplete?: () => void;
  /**
   * Accessible name of the progressbar. Default `"Loading"` — override it when
   * the bar measures something that is not a load (a quota, a countdown, seats
   * taken), so the screen reader announces what is actually filling.
   */
  ariaLabel?: string;
  /** Inline styles for the root wrapper — where `--flux-from` / `--flux-to` go. */
  style?: React.CSSProperties;
  /** Classes for the root wrapper. */
  className?: string;
  /** Classes for the bar track. */
  barClassName?: string;
  /** Classes for the phase label. */
  textClassName?: string;
}

/* ── constants ───────────────────────────────────────────────── */

const DEFAULT_PHASES: ProgressiveFluxPhase[] = [
  { at: 0, label: "starting up" },
  { at: 25, label: "loading assets" },
  { at: 55, label: "preparing magic" },
  { at: 80, label: "almost there" },
  { at: 100, label: "all done" },
];

// Signature "flux" palette — a vivid blue → cyan → blue fill. The two end
// colors are read from CSS variables with built-in defaults, so the bar can be
// recolored per instance without touching the component: set `--flux-from` /
// `--flux-to` (e.g. to `hsl(var(--primary))` to follow the theme), or override
// the whole fill with the `gradient` prop. The surrounding track and label stay
// on shadcn theme tokens, so the loader still adapts to light and dark. These
// are component-level custom properties, so the v3 build leaves them untouched
// and the fill renders identically on Tailwind v3 and v4.
const FLUX_FROM = "var(--flux-from, #1d6ffb)";
const FLUX_TO = "var(--flux-to, #74e1ff)";
const FLUX_MID = `color-mix(in oklab, ${FLUX_FROM}, ${FLUX_TO})`;

const DEFAULT_GRADIENT = `linear-gradient(90deg, ${FLUX_FROM} 0%, ${FLUX_MID} 35%, ${FLUX_TO} 55%, ${FLUX_MID} 78%, ${FLUX_FROM} 100%)`;

// Colored glow drawn from the same flux palette, plus a deep-blue inset for
// depth.
//
// O brilho branco de topo do original (`inset 0 1.5px 0 rgba(255,255,255,.5)`)
// saiu: numa barra `rounded-full` esse traço acompanha o raio das pontas e se
// acumula na quina esquerda, aparecendo como um ponto branco solto sobre o
// fundo escuro. A profundidade fica por conta do inset azul de baixo.
const BAR_SHADOW = `0 0 18px color-mix(in oklab, ${FLUX_FROM} 55%, transparent), 0 0 32px color-mix(in oklab, ${FLUX_TO} 40%, transparent), inset 0 -2px 3px rgba(0, 40, 120, 0.35)`;

// White sweep over the colored fill (blended with `screen`), so the highlight
// reads as a bright glide regardless of theme.
const SHEEN_GRADIENT =
  "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.55) 50%, transparent 100%)";

// Trilho apagado sugerido para `trackBackground`: o mesmo gradiente do
// preenchimento, rebaixado. A barra já é azul no 0%; o fill só a acende.
export const DIMMED_TRACK = `linear-gradient(90deg, color-mix(in oklab, ${FLUX_FROM} 16%, transparent) 0%, color-mix(in oklab, ${FLUX_TO} 20%, transparent) 55%, color-mix(in oklab, ${FLUX_FROM} 16%, transparent) 100%)`;

const Z_TRANSITION: Transition = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };
const LETTER_TRANSITION: Transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
};
// Respiro entre uma volta e outra do sweep, no modo não controlado.
const SWEEP_RESTART_MS = 700;

/* Alvo do sweep, criado uma vez só. Um objeto novo a cada render faria o
   framer-motion entender "alvo mudou" e recomeçar a animação do zero na troca
   de fase — a barra engasgaria no meio da volta. */
const SWEEP_KEYFRAMES = { width: ["0%", "100%"] };

const FILL_TRANSITION: Transition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };
const FILL_TRANSITION_REDUCED: Transition = { duration: 0 };
const EXIT_TRANSITION: Transition = { duration: 0.45, ease: [0.7, 0, 0.84, 0] };

/* ── helpers ─────────────────────────────────────────────────── */

/** Latest label whose threshold has been crossed. Expects pre-sorted phases. */
function pickLabel(value: number, sortedPhases: ProgressiveFluxPhase[]) {
  let active = sortedPhases[0]?.label ?? "";
  for (const phase of sortedPhases) {
    if (value >= phase.at) active = phase.label;
  }
  return active;
}

/* ── label ───────────────────────────────────────────────────── */

interface FluxLabelProps {
  label: string;
  /** Render plain, static text instead of the 3D fly-in (reduced motion). */
  reduced: boolean;
  className?: string;
}

// The label is decorative and `aria-hidden`; the progressbar carries the spoken
// progress via `aria-valuetext`. Under reduced motion it is plain static text.
function FluxLabel({ label, reduced, className }: FluxLabelProps) {
  const base = cn(
    "absolute inset-0 flex items-center justify-center text-center text-3xl font-semibold tracking-tight text-muted-foreground sm:text-4xl",
    className,
  );

  if (reduced) {
    return (
      <div aria-hidden className={base}>
        {label}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={label}
        aria-hidden
        className={base}
        style={{ transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, z: -380, scale: 0.65, filter: "blur(14px)" }}
        animate={{
          opacity: [0, 1, 1, 1],
          z: [-380, 60, -8, 0],
          scale: [0.65, 1.08, 0.985, 1],
          filter: ["blur(14px)", "blur(0px)", "blur(0px)", "blur(0px)"],
        }}
        exit={{
          opacity: 0,
          z: 220,
          scale: 1.35,
          filter: "blur(10px)",
          transition: EXIT_TRANSITION,
        }}
        transition={Z_TRANSITION}
      >
        <span className="inline-flex">
          {label.split("").map((char, index) => (
            <motion.span
              key={`${label}-${index}`}
              className="inline-block"
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ ...LETTER_TRANSITION, delay: 0.18 + index * 0.035 }}
            >
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── component ───────────────────────────────────────────────── */

export function ProgressiveFluxLoader({
  value,
  phases = DEFAULT_PHASES,
  duration = 12,
  loop = true,
  showLabel = true,
  trackBackground,
  gradient = DEFAULT_GRADIENT,
  onComplete,
  ariaLabel = "Loading",
  style,
  className,
  barClassName,
  textClassName,
}: ProgressiveFluxLoaderProps) {
  const reduced = !!useReducedMotion();
  const isControlled = typeof value === "number";
  const [internal, setInternal] = React.useState(0);

  // Keep the latest `onComplete` in a ref so a fresh inline callback on every
  // parent render never tears down and restarts the sweep below.
  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const completedRef = React.useRef(false);

  // Nada anima fora da tela: um loader abaixo da dobra girando o tempo todo
  // custa quadro a quadro sem ninguém ver. A margem começa um pouco antes de
  // entrar, para a animação já estar em curso quando aparece.
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "200px" });

  const sortedPhases = React.useMemo(() => [...phases].sort((a, b) => a.at - b.at), [phases]);
  const sweepMs = Math.max(500, duration * 1000);

  /**
   * Sweep próprio (modo não controlado).
   *
   * O preenchimento é animado por keyframes lá embaixo — quem desenha é o
   * framer-motion, sem passar por React. Aqui só marcamos a troca de FASE, com
   * um timer por limiar: são cinco re-renders por volta em vez de um por
   * quadro. A versão anterior fazia setState a 60 fps e travava a página
   * inteira, porque cada quadro re-renderizava a árvore e reprogramava a
   * animação de largura.
   */
  React.useEffect(() => {
    if (isControlled || !inView) return;
    const timers: number[] = [];

    const volta = () => {
      setInternal(0);
      completedRef.current = false;
      for (const phase of sortedPhases) {
        if (phase.at <= 0 || phase.at >= 100) continue;
        timers.push(window.setTimeout(() => setInternal(phase.at), (phase.at / 100) * sweepMs));
      }
      timers.push(
        window.setTimeout(() => {
          setInternal(100);
          if (!completedRef.current) {
            completedRef.current = true;
            onCompleteRef.current?.();
          }
          if (loop) timers.push(window.setTimeout(volta, SWEEP_RESTART_MS));
        }, sweepMs),
      );
    };

    volta();
    return () => timers.forEach(clearTimeout);
  }, [isControlled, inView, loop, sweepMs, sortedPhases]);

  const raw = isControlled ? value! : internal;
  const current = Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;

  // Controlled completion: fire once when `value` crosses 100, re-arm below it.
  React.useEffect(() => {
    if (!isControlled) return;
    if (current >= 100 && !completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    } else if (current < 100) {
      completedRef.current = false;
    }
  }, [isControlled, current]);

  const label = React.useMemo(() => pickLabel(current, sortedPhases), [current, sortedPhases]);
  const rounded = Math.round(current);

  // Quem desenha o sweep: keyframes do framer-motion, fora do ciclo do React.
  const varrendo = !isControlled && !reduced && inView;
  const sweepTransition = React.useMemo<Transition>(
    () => ({
      duration: sweepMs / 1000,
      ease: "linear",
      repeat: loop ? Infinity : 0,
      repeatDelay: SWEEP_RESTART_MS / 1000,
    }),
    [sweepMs, loop],
  );

  return (
    <div
      ref={rootRef}
      style={style}
      className={cn("mx-auto flex w-full max-w-md flex-col items-center gap-8", className)}
    >
      {showLabel && (
        <div
          className="relative h-16 w-full select-none"
          style={reduced ? undefined : { perspective: "1000px" }}
        >
          <FluxLabel label={label} reduced={reduced} className={textClassName} />
        </div>
      )}

      <div
        className={cn(
          "relative h-5 w-full overflow-hidden rounded-full bg-muted shadow-[inset_0_2px_3px_rgba(0,0,0,0.09),inset_0_-1px_2px_rgba(255,255,255,0.7)] dark:shadow-[inset_0_2px_3px_rgba(0,0,0,0.45),inset_0_-1px_2px_rgba(255,255,255,0.05)]",
          barClassName,
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-valuetext={label ? `${rounded}% – ${label}` : `${rounded}%`}
        style={trackBackground ? { background: trackBackground } : undefined}
        aria-label={ariaLabel}
      >
        <motion.div
          /* overflow-hidden prende o sheen ao preenchimento. Sem ele quem
             recorta é o trilho, que tem a largura toda — então o brilho passava
             do azul e seguia deslizando sobre a parte apagada. Não afeta o
             glow: box-shadow externo é desenhado fora da caixa e overflow não
             mexe nele. */
          className="relative h-full overflow-hidden rounded-full"
          style={{ background: gradient, boxShadow: BAR_SHADOW }}
          initial={false}
          animate={varrendo ? SWEEP_KEYFRAMES : { width: `${current}%` }}
          transition={
            varrendo ? sweepTransition : reduced ? FILL_TRANSITION_REDUCED : FILL_TRANSITION
          }
        >
          {/* Também pausa fora da tela: é uma animação infinita. */}
          {!reduced && inView && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-full"
              style={{ background: SHEEN_GRADIENT, mixBlendMode: "screen" }}
              animate={{ x: ["-110%", "210%"] }}
              transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ProgressiveFluxLoader;
