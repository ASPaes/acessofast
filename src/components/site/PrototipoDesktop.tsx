import { useEffect, useRef, useState } from "react";

// O protótipo clicável do app do computador, inteiro, no lugar da réplica de
// telas que existia aqui: conectar, sessão, arquivos, abas, menus, marcadores,
// configurações e a barra "Simulador" (pedido de acesso, mensagem do técnico,
// tema). Mora em public/prototipo-desktop, cópia de
// acessofast-desktop/prototipo (157351d, o protótipo aprovado) com duas
// mudanças: noindex no index.html e, no app.js, a janela nunca maximiza (o
// botão fica só no desenho, sem data-a; o duplo clique na barra de abas e a
// sessão aberta não maximizam mais), porque dentro da página ela não tem
// para onde crescer e maximizada só corta os cartões. Mudou o protótipo, copie
// de novo e refaça as duas.
//
// Ele é desenhado para uma tela de 1280x800 e entra reduzido para a largura da
// seção, sem mudar nada nele: clique e rolagem funcionam como lá.

const LARGURA = 1280;
const ALTURA = 800;
/** Largura útil da seção no computador (max-w-6xl menos o respiro), para o primeiro desenho. */
const LARGURA_INICIAL = 1104;

export function PrototipoDesktop() {
  const caixa = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(LARGURA_INICIAL / LARGURA);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const medir = () => setEscala(el.clientWidth / LARGURA);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <>
      <div
        ref={caixa}
        className="relative w-full overflow-hidden rounded-card border border-border bg-[#060d18] shadow-soft"
        style={{ height: ALTURA * escala }}
      >
        <iframe
          src="/prototipo-desktop/index.html"
          title="Protótipo do app AcessoFast para computador"
          loading="lazy"
          className="absolute top-0 left-0 origin-top-left border-0"
          style={{ width: LARGURA, height: ALTURA, transform: `scale(${escala})` }}
        />
      </div>
      <p className="mt-3 text-center text-sm text-text-muted sm:hidden">
        No celular a janela fica pequena: abra no computador para mexer à vontade.
      </p>
    </>
  );
}
