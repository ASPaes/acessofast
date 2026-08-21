import { useEffect, useRef } from "react";

/* Fundo de constelação: pontos brancos à deriva ligados por linhas quando estão
   perto. O canvas é transparente — o preto vem do fundo do body, então a página
   continua preta e só as partículas são desenhadas.

   Cobre só o bloco em que é montado (hoje o hero). A máscara dissolve o desenho
   no rodapé desse bloco, pra ele não terminar num corte reto contra o preto. */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /* Deslocamento atual causado pelo cursor, e a posição já deslocada usada
     no desenho. Manter os dois separados deixa a deriva intacta: o empurrão
     é um desvio temporário por cima dela, não uma mudança de rota. */
  ox: number;
  oy: number;
  dx: number;
  dy: number;
};

/* Uma partícula a cada ~16k px²: densidade parecida em qualquer tela, com teto
   pra não estourar CPU em monitor grande (a ligação entre pontos é O(n²)). */
const AREA_PER_PARTICLE = 16000;
const MAX_PARTICLES = 140;
const LINK_DISTANCE = 150;
const LINK_ALPHA = 0.16;
/* Faixas de opacidade das ligações: quantas mais, mais suave o degradê e mais
   traços por quadro. 12 mantém o degradê imperceptível e o desenho em lote. */
const LINK_BUCKETS = 12;
const DOT_ALPHA = 0.72;
const SPEED = 11; // px por segundo

/* Interação com o cursor. */
const CURSOR_LINK_DISTANCE = 190; // alcance das linhas que saem do ponteiro
const CURSOR_LINK_ALPHA = 0.4;
const CURSOR_DOT_ALPHA = 1;
const REPEL_DISTANCE = 130; // raio em que as partículas se afastam
const REPEL_MAX = 26; // deslocamento máximo, no centro do raio
const REPEL_EASING = 6; // quanto maior, mais rápido vai e volta

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = 0;

    /* Reaproveitados quadro a quadro (só zeramos o comprimento) para não gerar
       lixo novo 60 vezes por segundo. */
    const linkBuckets: number[][] = Array.from({ length: LINK_BUCKETS }, () => []);
    const realcados: Particle[] = [];

    const pointer = { x: 0, y: 0, active: false };

    function seed() {
      const count = Math.min(MAX_PARTICLES, Math.round((width * height) / AREA_PER_PARTICLE));
      particles = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const x = Math.random() * width;
        const y = Math.random() * height;
        return {
          x,
          y,
          vx: Math.cos(angle) * SPEED,
          vy: Math.sin(angle) * SPEED,
          r: 0.9 + Math.random() * 1.3,
          ox: 0,
          oy: 0,
          dx: x,
          dy: y,
        };
      });
    }

    function render(dt: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Easing exponencial: mesma sensação em 60 ou 144 Hz.
      const ease = 1 - Math.exp(-dt * REPEL_EASING);

      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Reentra pelo lado oposto, com folga pra não "nascer" na borda visível.
        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;

        // Alvo do deslocamento: afastar do cursor, com força maior quanto mais perto.
        let targetX = 0;
        let targetY = 0;
        if (pointer.active) {
          const toX = p.x - pointer.x;
          const toY = p.y - pointer.y;
          const dist = Math.hypot(toX, toY);
          if (dist < REPEL_DISTANCE && dist > 0.001) {
            const push = (1 - dist / REPEL_DISTANCE) * REPEL_MAX;
            targetX = (toX / dist) * push;
            targetY = (toY / dist) * push;
          }
        }
        p.ox += (targetX - p.ox) * ease;
        p.oy += (targetY - p.oy) * ease;

        p.dx = p.x + p.ox;
        p.dy = p.y + p.oy;
      }

      /* As ligações são agrupadas por faixa de opacidade e desenhadas em um
         traço por faixa. Antes era um beginPath/stroke por PAR — em tela cheia
         dá centenas de chamadas por quadro, e trocar strokeStyle no meio quebra
         qualquer lote. Com 12 faixas o degradê continua contínuo a olho nu:
         o passo é 0,16/12 ≈ 0,013 de alfa numa linha de 1px. */
      const maxDistSq = LINK_DISTANCE * LINK_DISTANCE;
      ctx.lineWidth = 1;
      for (const faixa of linkBuckets) faixa.length = 0;

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.dx - b.dx;
          const dy = a.dy - b.dy;
          const distSq = dx * dx + dy * dy;
          if (distSq > maxDistSq) continue;

          const proximidade = 1 - Math.sqrt(distSq) / LINK_DISTANCE;
          const faixa = Math.min(LINK_BUCKETS - 1, (proximidade * LINK_BUCKETS) | 0);
          linkBuckets[faixa].push(a.dx, a.dy, b.dx, b.dy);
        }
      }

      for (let f = 0; f < LINK_BUCKETS; f++) {
        const pontos = linkBuckets[f];
        if (pontos.length === 0) continue;
        ctx.strokeStyle = `rgba(255, 255, 255, ${((f + 0.5) / LINK_BUCKETS) * LINK_ALPHA})`;
        ctx.beginPath();
        for (let k = 0; k < pontos.length; k += 4) {
          ctx.moveTo(pontos[k], pontos[k + 1]);
          ctx.lineTo(pontos[k + 2], pontos[k + 3]);
        }
        ctx.stroke();
      }

      // Teia que sai do ponteiro, mais forte que as ligações normais.
      if (pointer.active) {
        const cursorDistSq = CURSOR_LINK_DISTANCE * CURSOR_LINK_DISTANCE;
        for (const p of particles) {
          const dx = p.dx - pointer.x;
          const dy = p.dy - pointer.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > cursorDistSq) continue;

          const alpha = (1 - Math.sqrt(distSq) / CURSOR_LINK_DISTANCE) * CURSOR_LINK_ALPHA;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(p.dx, p.dy);
          ctx.stroke();
        }
      }

      /* Mesma ideia nos pontos: um único path para todos os que estão no brilho
         padrão (com o cursor parado, isso é o desenho inteiro em um fill só) e
         fill individual apenas nos realçados pelo ponteiro. */
      realcados.length = 0;
      ctx.fillStyle = `rgba(255, 255, 255, ${DOT_ALPHA})`;
      ctx.beginPath();
      for (const p of particles) {
        if (pointer.active) {
          const dx = p.dx - pointer.x;
          const dy = p.dy - pointer.y;
          if (dx * dx + dy * dy < CURSOR_LINK_DISTANCE * CURSOR_LINK_DISTANCE) {
            realcados.push(p);
            continue;
          }
        }
        // moveTo antes de cada arco: sem isso o path liga um ponto ao outro.
        ctx.moveTo(p.dx + p.r, p.dy);
        ctx.arc(p.dx, p.dy, p.r, 0, Math.PI * 2);
      }
      ctx.fill();

      for (const p of realcados) {
        const dist = Math.sqrt((p.dx - pointer.x) ** 2 + (p.dy - pointer.y) ** 2);
        const boost = 1 - dist / CURSOR_LINK_DISTANCE;
        ctx.fillStyle = `rgba(255, 255, 255, ${DOT_ALPHA + (CURSOR_DOT_ALPHA - DOT_ALPHA) * boost})`;
        ctx.beginPath();
        ctx.arc(p.dx, p.dy, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function tick(time: number) {
      // Clampa o delta pra não teleportar as partículas depois de uma aba parada.
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      render(dt);
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }

    function start() {
      if (frame || reducedMotion.matches || document.hidden) return;
      frame = requestAnimationFrame(tick);
    }

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      render(0);
    }

    /* O canvas é pointer-events-none, então o ponteiro é acompanhado na janela e
       convertido para coordenadas locais — o que também resolve a rolagem, já
       que o retângulo do canvas se move junto com a página. */
    function handlePointerMove(event: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const margin = CURSOR_LINK_DISTANCE;
      pointer.active = x >= -margin && x <= width + margin && y >= -margin && y <= height + margin;
      pointer.x = x;
      pointer.y = y;
    }

    function releasePointer() {
      pointer.active = false;
    }

    function handleVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function handleMotionPreference() {
      stop();
      render(0);
      start();
    }

    resize();
    start();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointercancel", releasePointer);
    window.addEventListener("blur", releasePointer);
    document.addEventListener("pointerleave", releasePointer);
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointercancel", releasePointer);
      window.removeEventListener("blur", releasePointer);
      document.removeEventListener("pointerleave", releasePointer);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,#000_65%,transparent_100%)]"
    />
  );
}
