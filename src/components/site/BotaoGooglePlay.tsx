import { PLAY_STORE_URL } from "@/lib/play-store";
import { cn } from "@/lib/utils";

// Botão no formato de selo de loja, levando à ficha do app na Google Play.
// Desenhado aqui (triângulo genérico de "play", sem o logo do Google) para não
// depender de imagem externa.
export function BotaoGooglePlay({ className }: { className?: string }) {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-otto-feliz
      className={cn(
        "inline-flex h-14 items-center gap-3 rounded-xl border border-white/20 bg-black px-5 text-left text-white shadow-soft transition-all hover:-translate-y-[1px] hover:border-white/40",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <path
          d="M5 3.5v17a1 1 0 0 0 1.5.86l14.3-8.5a1 1 0 0 0 0-1.72L6.5 2.64A1 1 0 0 0 5 3.5Z"
          fill="currentColor"
        />
      </svg>
      <span className="leading-tight">
        <span className="block text-[11px] uppercase tracking-wide text-white/80">
          Disponível no
        </span>
        <span className="block text-lg font-semibold">Google Play</span>
      </span>
    </a>
  );
}
