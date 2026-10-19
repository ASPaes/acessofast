import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Otto, type OttoEstado } from "@/components/otto/otto";
import { cn } from "@/lib/utils";

// O Otto como guia do site. Assim que a home abre ele entra no canto, acena e
// pergunta como pode ajudar. As respostas são botões, não chat livre: cada uma
// leva a pessoa para a parte certa do site (recursos, preço, download, contato
// ou o painel) e o Otto comenta o caminho, mudando de cara conforme a conversa.
//
// Ele abre sozinho só na primeira vez da sessão. Fechado, fica pequeno no canto
// e reabre a conversa com um clique.

type Escolha = "o-que-e" | "recursos" | "precos" | "baixar" | "especialista" | "cliente" | "menu";

const ROTULO: Record<Escolha, string> = {
  "o-que-e": "O que é o AcessoFast?",
  recursos: "Ver os recursos",
  precos: "Quanto custa?",
  baixar: "Baixar o AcessoFast",
  especialista: "Falar com um especialista",
  cliente: "Já sou cliente",
  menu: "Outra coisa",
};

const MENU: Escolha[] = ["o-que-e", "precos", "baixar", "especialista", "cliente"];

const SAUDACAO = "Oi! Eu sou o Otto, do AcessoFast. Como posso te ajudar?";

type Resposta = {
  otto: OttoEstado;
  fala: string;
  opcoes?: Escolha[];
  /** Para onde o Otto leva depois de falar: uma seção da home ou uma rota. */
  destino?: { secao: string } | { rota: "/download" };
  link?: { href: string; rotulo: string };
};

const RESPOSTA: Record<Escolha, Resposta> = {
  "o-que-e": {
    otto: "atendendo",
    fala: "É acesso remoto para quem dá suporte de TI: você entra no computador do cliente e resolve na hora, sem sair do lugar. E sem surpresa no custo.",
    opcoes: ["recursos", "precos", "menu"],
  },
  recursos: {
    otto: "concluido",
    fala: "Te levo lá! Os recursos estão aqui embaixo.",
    destino: { secao: "recursos" },
  },
  precos: {
    otto: "concluido",
    fala: "Dá para começar de graça, e os planos de equipe têm 7 dias grátis para testar. Olha os preços aqui embaixo!",
    destino: { secao: "preco" },
  },
  baixar: {
    otto: "conectando",
    fala: "É pra já! Vou abrir a página de download.",
    destino: { rota: "/download" },
  },
  especialista: {
    otto: "concluido",
    fala: "Bora! Deixa seus dados no formulário e o time responde em até 1 dia útil.",
    destino: { secao: "contato" },
  },
  cliente: {
    otto: "ola",
    fala: "Que bom te ver de novo! O painel fica em app.acessofast.com.br.",
    link: { href: "https://app.acessofast.com.br", rotulo: "Entrar no painel" },
    opcoes: ["menu"],
  },
  menu: {
    otto: "ola",
    fala: "Claro! Como posso te ajudar?",
    opcoes: MENU,
  },
};

const CHAVE = "af-otto-guia";
const ESPERA_ENTRADA = 900;
const ESPERA_DIGITANDO = 750;
const ESPERA_DESTINO = 1100;

type Mensagem = { id: number; de: "otto" | "voce"; texto: string };

function jaViuNestaSessao() {
  try {
    return sessionStorage.getItem(CHAVE) === "visto";
  } catch {
    return false;
  }
}

function marcarVisto() {
  try {
    sessionStorage.setItem(CHAVE, "visto");
  } catch {
    // sem armazenamento: ele só volta a abrir sozinho no próximo carregamento
  }
}

export function OttoGuia() {
  const navigate = useNavigate();
  const [visivel, setVisivel] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [digitando, setDigitando] = useState(false);
  const [opcoes, setOpcoes] = useState<Escolha[]>([]);
  const [link, setLink] = useState<Resposta["link"]>();
  const [estado, setEstado] = useState<OttoEstado>("ola");
  const [recado, setRecado] = useState<string | null>(null);

  const lista = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const proximoId = useRef(0);
  const semMovimento = useRef(false);

  const depois = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, semMovimento.current ? 0 : ms));
  }, []);

  const falar = useCallback(
    (texto: string, cara: OttoEstado, aoTerminar?: () => void) => {
      setDigitando(true);
      setEstado("conectando");
      depois(ESPERA_DIGITANDO, () => {
        setDigitando(false);
        setEstado(cara);
        setMensagens((m) => [...m, { id: proximoId.current++, de: "otto", texto }]);
        aoTerminar?.();
      });
    },
    [depois],
  );

  const minimizar = useCallback(() => {
    setAberto(false);
    marcarVisto();
  }, []);

  // Entrada: na primeira visita da sessão ele chega e já pergunta; depois disso
  // fica quieto no canto, esperando o clique.
  useEffect(() => {
    semMovimento.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pendentes = timers.current;
    if (jaViuNestaSessao()) {
      setEstado("parado");
      setVisivel(true);
    } else {
      depois(ESPERA_ENTRADA, () => {
        setVisivel(true);
        setAberto(true);
        marcarVisto();
        falar(SAUDACAO, "ola", () => setOpcoes(MENU));
      });
    }
    return () => {
      pendentes.forEach((t) => window.clearTimeout(t));
    };
  }, [depois, falar]);

  // A conversa rola sozinha para a última fala.
  useEffect(() => {
    const el = lista.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [mensagens, digitando, opcoes]);

  // Esc fecha a conversa, como qualquer balão.
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") minimizar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto, minimizar]);

  function levar(destino: NonNullable<Resposta["destino"]>) {
    if ("rota" in destino) {
      void navigate({ to: destino.rota });
      return;
    }
    const secao = document.getElementById(destino.secao);
    if (secao) {
      secao.scrollIntoView({ behavior: semMovimento.current ? "auto" : "smooth" });
    }
    // Fecha para não cobrir a seção que ele acabou de mostrar, e avisa onde ficou.
    setAberto(false);
    setEstado("parado");
    setRecado("Tô aqui no canto se precisar!");
    depois(5000, () => setRecado(null));
  }

  function escolher(escolha: Escolha) {
    const r = RESPOSTA[escolha];
    setOpcoes([]);
    setLink(undefined);
    setMensagens((m) => [...m, { id: proximoId.current++, de: "voce", texto: ROTULO[escolha] }]);
    falar(r.fala, r.otto, () => {
      if (r.opcoes) setOpcoes(r.opcoes);
      if (r.link) setLink(r.link);
      const destino = r.destino;
      if (destino) depois(ESPERA_DESTINO, () => levar(destino));
    });
  }

  function reabrir() {
    setAberto(true);
    setRecado(null);
    // Conversa que tinha terminado (a pessoa já foi levada a algum lugar):
    // ele puxa assunto de novo em vez de abrir mudo.
    if (!digitando && opcoes.length === 0 && !link) {
      falar(mensagens.length ? "Posso ajudar em mais alguma coisa?" : SAUDACAO, "ola", () =>
        setOpcoes(MENU),
      );
    }
  }

  if (!visivel) return null;

  return (
    <aside
      aria-label="Otto, assistente do AcessoFast"
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-1 sm:bottom-6 sm:right-6"
    >
      {aberto && (
        <div className="otto-guia-painel relative origin-bottom-right">
          <div className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <p className="text-sm font-semibold text-text">
                Otto <span className="font-normal text-text-muted">· AcessoFast</span>
              </p>
              <button
                type="button"
                onClick={minimizar}
                aria-label="Fechar conversa"
                className="rounded-md p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={lista}
              aria-live="polite"
              className="max-h-[min(20rem,45vh)] space-y-2 overflow-y-auto px-4 py-3"
            >
              {mensagens.map((m) => (
                <p
                  key={m.id}
                  className={cn(
                    "w-fit max-w-[88%] rounded-2xl px-3.5 py-2 text-[14px] leading-snug",
                    m.de === "otto"
                      ? "rounded-bl-md bg-white/[0.07] text-text"
                      : "ml-auto rounded-br-md bg-primary text-primary-foreground",
                  )}
                >
                  {m.texto}
                </p>
              ))}
              {digitando && (
                <p
                  className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-white/[0.07] px-3.5 py-3 text-text-muted"
                  aria-label="Otto está digitando"
                >
                  <span className="otto-guia-ponto" />
                  <span className="otto-guia-ponto" />
                  <span className="otto-guia-ponto" />
                </p>
              )}
            </div>

            {(opcoes.length > 0 || link) && (
              <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
                {link && (
                  <a
                    href={link.href}
                    className="inline-flex items-center rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    {link.rotulo}
                  </a>
                )}
                {opcoes.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => escolher(o)}
                    className="rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[13px] font-medium text-text transition-colors hover:border-primary hover:bg-primary/20"
                  >
                    {ROTULO[o]}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Pontinha do balão, apontando para o Otto embaixo. */}
          <span
            aria-hidden
            className="absolute -bottom-[7px] right-[33px] h-3.5 w-3.5 rotate-45 border-b border-r border-border bg-surface sm:right-[41px]"
          />
        </div>
      )}

      <div className="flex items-end gap-2">
        {!aberto && recado && (
          <p className="otto-guia-painel mb-5 rounded-2xl rounded-br-md border border-border bg-surface px-3 py-2 text-[13px] text-text shadow-lg">
            {recado}
          </p>
        )}
        <button
          type="button"
          onClick={aberto ? minimizar : reabrir}
          aria-expanded={aberto}
          aria-label={aberto ? "Fechar conversa com o Otto" : "Falar com o Otto"}
          className="otto-guia-entra rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Otto estado={estado} className={aberto ? "w-20 sm:w-24" : "w-16 sm:w-20"} />
        </button>
      </div>
    </aside>
  );
}
