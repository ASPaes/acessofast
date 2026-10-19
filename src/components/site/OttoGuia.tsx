import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Otto, type OttoEstado } from "@/components/otto/otto";
import {
  buscarPlanos,
  destacarPlano,
  PLANOS_COM_TESTE,
  PLANOS_QUERY_KEY,
  recomendarPlano,
} from "@/lib/planos";
import { cn } from "@/lib/utils";

// O Otto como guia do site. Assim que o site abre ele entra no canto, dá bom dia
// (ou boa tarde, ou boa noite) e pergunta como pode ajudar. As respostas são
// botões, não chat livre: cada uma leva a pessoa para a parte certa do site e o
// Otto comenta o caminho, mudando de cara conforme a conversa.
//
// Ele participa da visita:
// - segue o mouse com o olhar e fica feliz em cima dos botões de contratar
//   (os que têm data-otto-feliz);
// - comenta cada seção da home quando a pessoa chega nela, uma vez por sessão;
// - ajuda a escolher o plano com duas perguntas e destaca o cartão na grade.
//
// Fica montado no layout raiz, então acompanha a pessoa de uma página para a
// outra sem perder a conversa. Abre sozinho só na primeira vez da sessão;
// fechado, fica no canto e reabre com um clique.

type Escolha =
  | "o-que-e"
  | "recursos"
  | "precos"
  | "plano"
  | "baixar"
  | "historia"
  | "especialista"
  | "cliente"
  | "menu";

const ROTULO: Record<Escolha, string> = {
  "o-que-e": "O que é o AcessoFast?",
  recursos: "Ver os recursos",
  precos: "Quanto custa?",
  plano: "Me ajuda a escolher o plano",
  baixar: "Baixar o AcessoFast",
  historia: "Como surgiu o AcessoFast?",
  especialista: "Falar com um especialista",
  cliente: "Já sou cliente",
  menu: "Outra coisa",
};

/** Botão de resposta: uma escolha do menu ou a resposta de uma pergunta do plano. */
type Opcao =
  | { tipo: "escolha"; escolha: Escolha }
  | { tipo: "usuarios" | "simultaneos"; valor: number; rotulo: string };

const op = (...escolhas: Escolha[]): Opcao[] =>
  escolhas.map((escolha) => ({ tipo: "escolha", escolha }));

const rotuloDe = (o: Opcao) => (o.tipo === "escolha" ? ROTULO[o.escolha] : o.rotulo);

const MENU = op("o-que-e", "precos", "plano", "baixar", "especialista", "cliente");

const USUARIOS: Opcao[] = [
  { tipo: "usuarios", valor: 1, rotulo: "Só eu" },
  { tipo: "usuarios", valor: 5, rotulo: "Até 5" },
  { tipo: "usuarios", valor: 10, rotulo: "Até 10" },
  { tipo: "usuarios", valor: 20, rotulo: "Até 20" },
  { tipo: "usuarios", valor: 21, rotulo: "Mais de 20" },
];

const SIMULTANEOS: Opcao[] = [
  { tipo: "simultaneos", valor: 1, rotulo: "1 por vez" },
  { tipo: "simultaneos", valor: 3, rotulo: "Até 3" },
  { tipo: "simultaneos", valor: 5, rotulo: "Até 5" },
  { tipo: "simultaneos", valor: 10, rotulo: "Até 10" },
  { tipo: "simultaneos", valor: 11, rotulo: "Mais de 10" },
];

const APRESENTACAO = "Eu sou o Otto, do AcessoFast. Como posso te ajudar?";

/** Saudação pelo relógio de quem visita. De madrugada ele estava dormindo. */
function saudacaoDaHora(): { fala: string; acordando: boolean } {
  const hora = new Date().getHours();
  if (hora < 5)
    return {
      fala: `Opa, acordei! Até essa hora no suporte? Te entendo. ${APRESENTACAO}`,
      acordando: true,
    };
  const oi = hora < 12 ? "Bom dia!" : hora < 18 ? "Boa tarde!" : "Boa noite!";
  return { fala: `${oi} ${APRESENTACAO}`, acordando: false };
}

type Fala = { otto: OttoEstado; fala: string; opcoes?: Opcao[] };

type Resposta = Fala & {
  /** Para onde o Otto leva depois de falar: uma seção da home ou uma página. */
  destino?: { secao: string } | { rota: "/download" | "/como-surgiu" };
  /** O que ele diz ao chegar na página de destino. */
  chegada?: Fala;
  /** O que ele diz se a pessoa já está na página de destino: não há para onde levar. */
  aqui?: Fala;
  link?: { href: string; rotulo: string };
};

const COMO_INSTALAR =
  "Clique em “Baixar para Windows”, abra o instalador e passe para o seu técnico o ID e a senha que aparecem na tela.";

const RESPOSTA: Record<Escolha, Resposta> = {
  "o-que-e": {
    otto: "atendendo",
    fala: "É acesso remoto para quem dá suporte de TI: você entra no computador do cliente e resolve na hora, sem sair do lugar. E sem surpresa no custo.",
    opcoes: op("recursos", "precos", "historia", "menu"),
  },
  recursos: {
    otto: "concluido",
    fala: "Te levo lá! Os recursos estão aqui.",
    destino: { secao: "recursos" },
    opcoes: op("precos", "especialista", "menu"),
  },
  precos: {
    otto: "concluido",
    fala: "Dá para começar de graça, e os planos de equipe têm 7 dias grátis para testar. Olha os preços aqui!",
    destino: { secao: "preco" },
    opcoes: op("plano", "especialista", "menu"),
  },
  plano: {
    otto: "aguardando",
    fala: "Bora! Primeiro: quantas pessoas da equipe vão usar o AcessoFast?",
    opcoes: USUARIOS,
  },
  baixar: {
    otto: "conectando",
    fala: "É pra já! Vou abrir a página de download.",
    destino: { rota: "/download" },
    chegada: { otto: "concluido", fala: `Chegamos! ${COMO_INSTALAR}`, opcoes: op("menu") },
    aqui: {
      otto: "concluido",
      fala: `Você já está no lugar certo! ${COMO_INSTALAR}`,
      opcoes: op("menu"),
    },
  },
  historia: {
    otto: "ola",
    fala: "Ele foi criado por uma equipe de suporte técnico, a partir das limitações das ferramentas que ela usava no dia a dia. Te mostro a história!",
    destino: { rota: "/como-surgiu" },
    chegada: {
      otto: "concluido",
      fala: "Essa é a nossa história, contada por quem construiu. Quer ver os planos ou falar com o time?",
      opcoes: op("precos", "especialista", "menu"),
    },
    aqui: {
      otto: "concluido",
      fala: "Você já está nela! É só ir descendo a página.",
      opcoes: op("precos", "especialista", "menu"),
    },
  },
  especialista: {
    otto: "concluido",
    fala: "Bora! Deixa seus dados no formulário e o time responde em até 1 dia útil.",
    destino: { secao: "contato" },
    opcoes: op("precos", "menu"),
  },
  cliente: {
    otto: "ola",
    fala: "Que bom te ver de novo! O painel fica em app.acessofast.com.br.",
    link: { href: "https://app.acessofast.com.br", rotulo: "Entrar no painel" },
    opcoes: op("menu"),
  },
  menu: {
    otto: "ola",
    fala: "Claro! Como posso te ajudar?",
    opcoes: MENU,
  },
};

/**
 * O que ele comenta quando a pessoa chega em cada seção da home (pelo id da
 * seção). O contato fica de fora: lá o Otto do formulário já conversa.
 */
const COMENTARIOS: Record<string, Fala> = {
  recursos: {
    otto: "atendendo",
    fala: "Meu recurso preferido está aqui: acesso não assistido, sem ninguém do outro lado precisar aceitar.",
    opcoes: op("precos", "menu"),
  },
  app: {
    otto: "ola",
    fala: "Esse é o app no computador. Clica nas abas pra explorar!",
    opcoes: op("baixar", "menu"),
  },
  diferenciais: {
    otto: "concluido",
    fala: "Preço fechado, sem excedente e sem surpresa na renovação. Foi pra isso que o AcessoFast nasceu.",
    opcoes: op("historia", "precos"),
  },
  "como-funciona": {
    otto: "concluido",
    fala: "Instalou, cadastrou, conectou. Simples assim!",
    opcoes: op("baixar", "precos"),
  },
  otto: {
    otto: "ola",
    fala: "Ei, esse aí sou eu! Prazer.",
    opcoes: op("menu"),
  },
  preco: {
    otto: "aguardando",
    fala: "Quer ajuda pra escolher? Te faço duas perguntas e indico o plano.",
    opcoes: op("plano", "especialista"),
  },
  faq: {
    otto: "aguardando",
    fala: "Se a sua dúvida não estiver aqui, te coloco em contato com o time.",
    opcoes: op("especialista", "menu"),
  },
};

const CHAVE = "af-otto-guia";
const CHAVE_COMENTARIOS = "af-otto-comentou";
const ESPERA_ENTRADA = 900;
const ESPERA_ACORDAR = 1400;
const ESPERA_DIGITANDO = 750;
const ESPERA_DESTINO = 1100;
/** Depois de qualquer fala, quanto tempo ele espera antes de comentar uma seção. */
const SILENCIO_DEPOIS_DE_FALAR = 6000;
const DURACAO_RECADO = 7000;
/** Quanto tempo a seção precisa ficar no meio da tela para ele comentar. */
const PERMANENCIA_NA_SECAO = 1200;

type Mensagem = { id: number; de: "otto" | "voce"; texto: string };

function lerSessao(chave: string) {
  try {
    return sessionStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravarSessao(chave: string, valor: string) {
  try {
    sessionStorage.setItem(chave, valor);
  } catch {
    // sem armazenamento: ele só esquece o que já fez no próximo carregamento
  }
}

const pessoas = (n: number) =>
  n === 1 ? "1 pessoa" : n > 20 ? "mais de 20 pessoas" : `até ${n} pessoas`;
const atendimentos = (n: number) =>
  n === 1
    ? "1 atendimento por vez"
    : n > 10
      ? "mais de 10 atendimentos ao mesmo tempo"
      : `até ${n} atendimentos ao mesmo tempo`;

export function OttoGuia() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pagina = useRouterState({ select: (s) => s.location.pathname });
  const [visivel, setVisivel] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [digitando, setDigitando] = useState(false);
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [link, setLink] = useState<Resposta["link"]>();
  const [estado, setEstado] = useState<OttoEstado>("ola");
  const [feliz, setFeliz] = useState(false);
  /** Comentário de seção feito com a conversa fechada: vira balãozinho ao lado dele. */
  const [recado, setRecado] = useState<Fala | null>(null);

  const lista = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const proximoId = useRef(0);
  const semMovimento = useRef(false);
  const silencioAte = useRef(0);
  const comentados = useRef(new Set<string>());
  const usuarios = useRef(1);

  const depois = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, semMovimento.current ? 0 : ms));
  }, []);

  const falar = useCallback(
    (f: Fala, aoTerminar?: () => void) => {
      setOpcoes([]);
      setDigitando(true);
      setEstado("conectando");
      silencioAte.current = Date.now() + SILENCIO_DEPOIS_DE_FALAR;
      depois(ESPERA_DIGITANDO, () => {
        setDigitando(false);
        setEstado(f.otto);
        setMensagens((m) => [...m, { id: proximoId.current++, de: "otto", texto: f.fala }]);
        if (f.opcoes) setOpcoes(f.opcoes);
        aoTerminar?.();
      });
    },
    [depois],
  );

  const minimizar = useCallback(() => {
    setAberto(false);
    gravarSessao(CHAVE, "visto");
  }, []);

  // Entrada: na primeira visita da sessão ele chega e já cumprimenta; depois
  // disso fica quieto no canto, esperando o clique.
  useEffect(() => {
    semMovimento.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      const salvos = JSON.parse(lerSessao(CHAVE_COMENTARIOS) ?? "[]") as string[];
      salvos.forEach((id) => comentados.current.add(id));
    } catch {
      // lista corrompida: começa do zero
    }
    const pendentes = timers.current;
    if (lerSessao(CHAVE) === "visto") {
      setEstado("parado");
      setVisivel(true);
    } else {
      depois(ESPERA_ENTRADA, () => {
        const { fala, acordando } = saudacaoDaHora();
        setVisivel(true);
        setAberto(true);
        gravarSessao(CHAVE, "visto");
        const cumprimentar = () => falar({ otto: "ola", fala, opcoes: MENU });
        if (acordando) {
          setEstado("offline");
          depois(ESPERA_ACORDAR, cumprimentar);
        } else {
          cumprimentar();
        }
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

  // Fica feliz enquanto o ponteiro está num botão de contratar.
  useEffect(() => {
    const aoPassar = (e: PointerEvent) => {
      const alvo = e.target instanceof Element ? e.target.closest("[data-otto-feliz]") : null;
      setFeliz(!!alvo);
    };
    document.addEventListener("pointerover", aoPassar);
    return () => document.removeEventListener("pointerover", aoPassar);
  }, []);

  // Comentário de seção. Vive num ref para o observador, criado uma vez por
  // página, sempre chamar a versão com o estado atual da conversa.
  const comentar = useRef<(secao: string) => void>(() => {});
  comentar.current = (secao) => {
    const c = COMENTARIOS[secao];
    if (!c || comentados.current.has(secao)) return;
    if (digitando || Date.now() < silencioAte.current) return;
    comentados.current.add(secao);
    gravarSessao(CHAVE_COMENTARIOS, JSON.stringify([...comentados.current]));
    if (aberto) {
      falar(c);
      return;
    }
    silencioAte.current = Date.now() + SILENCIO_DEPOIS_DE_FALAR;
    setEstado(c.otto);
    setRecado(c);
    depois(DURACAO_RECADO, () => setRecado((r) => (r === c ? null : r)));
  };

  // Observa as seções da página: a faixa do meio da tela é "onde a pessoa está".
  // Só comenta a seção onde ela PAROU: o site rola suave (scroll-behavior no
  // html), então um clique no menu atravessa várias seções no caminho, e cada
  // uma passaria pela faixa por uma fração de segundo.
  useEffect(() => {
    if (!visivel) return;
    const esperando = new Map<string, number>();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          const secao = e.target.id;
          if (e.isIntersecting) {
            if (esperando.has(secao)) continue;
            const t = window.setTimeout(() => {
              esperando.delete(secao);
              comentar.current(secao);
            }, PERMANENCIA_NA_SECAO);
            esperando.set(secao, t);
          } else {
            window.clearTimeout(esperando.get(secao));
            esperando.delete(secao);
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );
    const timer = window.setTimeout(() => {
      Object.keys(COMENTARIOS).forEach((id) => {
        const el = document.getElementById(id);
        if (el) observador.observe(el);
      });
    }, 300);
    return () => {
      window.clearTimeout(timer);
      esperando.forEach((t) => window.clearTimeout(t));
      observador.disconnect();
    };
  }, [pagina, visivel]);

  function levar(r: Resposta) {
    const destino = r.destino;
    if (!destino) return;
    // A rolagem passa por várias seções: nada de comentar no caminho.
    silencioAte.current = Date.now() + SILENCIO_DEPOIS_DE_FALAR;
    if ("rota" in destino) {
      void navigate({ to: destino.rota }).then(() => {
        if (r.chegada) falar(r.chegada);
      });
      return;
    }
    // A seção para onde ele mesmo levou não precisa de comentário.
    comentados.current.add(destino.secao);
    const secao = document.getElementById(destino.secao);
    if (secao) {
      secao.scrollIntoView({ behavior: semMovimento.current ? "auto" : "smooth" });
      return;
    }
    // Seção da home pedida de outra página: quem rola é o próprio roteador, pela
    // âncora. Rolar na mão depois do navigate não serve: a restauração de
    // rolagem da troca de página joga a home de volta para o topo.
    void navigate({
      to: "/",
      hash: destino.secao,
      hashScrollIntoView: { behavior: semMovimento.current ? "auto" : "smooth" },
    });
  }

  function dizerQueEscolheu(texto: string) {
    setLink(undefined);
    setMensagens((m) => [...m, { id: proximoId.current++, de: "voce", texto }]);
  }

  function escolher(escolha: Escolha) {
    const pedida = RESPOSTA[escolha];
    const jaEstaLa =
      pedida.aqui && pedida.destino && "rota" in pedida.destino && pedida.destino.rota === pagina;
    const r: Resposta = jaEstaLa && pedida.aqui ? pedida.aqui : pedida;
    dizerQueEscolheu(ROTULO[escolha]);
    falar(r, () => {
      if (r.link) setLink(r.link);
      if (r.destino) depois(ESPERA_DESTINO, () => levar(r));
    });
  }

  /** Fim do "me ajuda a escolher o plano": indica, destaca o cartão e leva até ele. */
  async function indicarPlano(simultaneos: number) {
    setOpcoes([]);
    setDigitando(true);
    setEstado("conectando");
    try {
      const planos = await queryClient.fetchQuery({
        queryKey: PLANOS_QUERY_KEY,
        queryFn: buscarPlanos,
        staleTime: 5 * 60 * 1000,
      });
      const plano = recomendarPlano(planos, usuarios.current, simultaneos);
      if (!plano) throw new Error("nenhum plano ativo");
      const equipe = `${pessoas(usuarios.current)} e ${atendimentos(simultaneos)}`;
      const fala = plano.is_custom
        ? `Pra ${equipe}, o ideal é o ${plano.name}, montado sob medida. Te coloco em contato com o time?`
        : plano.price_month_cents === 0
          ? `Pra ${equipe}, o ${plano.name} resolve. E é grátis!`
          : PLANOS_COM_TESTE.includes(plano.code)
            ? `Pra ${equipe}, o ideal é o ${plano.name}. Dá pra testar 7 dias grátis!`
            : `Pra ${equipe}, o ideal é o ${plano.name}.`;
      falar({ otto: "concluido", fala, opcoes: op("especialista", "menu") }, () => {
        depois(ESPERA_DESTINO, () => {
          silencioAte.current = Date.now() + SILENCIO_DEPOIS_DE_FALAR;
          comentados.current.add("preco");
          destacarPlano(plano.code);
          // A grade rola até o cartão sozinha; de outra página, primeiro volta para a home.
          if (!document.getElementById("preco")) {
            void navigate({ to: "/", hash: "preco" });
          }
        });
      });
    } catch {
      falar(
        {
          otto: "erro",
          fala: "Não consegui ver os planos agora. Dá uma olhada na tabela de preços!",
          opcoes: op("especialista", "menu"),
        },
        () => depois(ESPERA_DESTINO, () => levar(RESPOSTA.precos)),
      );
    }
  }

  function responder(o: Opcao) {
    if (o.tipo === "escolha") {
      escolher(o.escolha);
      return;
    }
    dizerQueEscolheu(o.rotulo);
    if (o.tipo === "usuarios") {
      usuarios.current = o.valor;
      falar({
        otto: "aguardando",
        fala: "E quantos atendimentos cada técnico costuma fazer ao mesmo tempo?",
        opcoes: SIMULTANEOS,
      });
      return;
    }
    void indicarPlano(o.valor);
  }

  function reabrir() {
    setAberto(true);
    // Recado pendente vira a próxima fala da conversa.
    if (recado) {
      setRecado(null);
      falar(recado);
      return;
    }
    // Sem conversa em andamento, ele puxa assunto em vez de abrir mudo.
    if (!digitando && opcoes.length === 0 && !link) {
      falar({
        otto: "ola",
        fala: mensagens.length ? "Posso ajudar em mais alguma coisa?" : saudacaoDaHora().fala,
        opcoes: MENU,
      });
    }
  }

  if (!visivel) return null;

  const cara: OttoEstado = feliz && !digitando ? "ola" : estado;

  return (
    <aside
      aria-label="Otto, assistente do AcessoFast"
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end sm:bottom-6 sm:right-6"
    >
      {aberto && (
        <div className="otto-guia-painel relative mb-1 origin-bottom-right">
          <div className="w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
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
              className="max-h-[min(20rem,40vh)] space-y-2 overflow-y-auto px-4 py-3"
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
                    key={rotuloDe(o)}
                    type="button"
                    onClick={() => responder(o)}
                    className="rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[13px] font-medium text-text transition-colors hover:border-primary hover:bg-primary/20"
                  >
                    {rotuloDe(o)}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Pontinha do balão, apontando para a cabeça do Otto logo abaixo. */}
          <span
            aria-hidden
            className="absolute -bottom-[7px] right-[41px] h-3.5 w-3.5 rotate-45 border-b border-r border-border bg-surface sm:right-[65px]"
          />
        </div>
      )}

      <div className="flex items-end gap-2">
        {!aberto && recado && (
          <button
            type="button"
            onClick={reabrir}
            className="otto-guia-painel mb-8 max-w-[15rem] rounded-2xl rounded-br-md border border-border bg-surface px-3.5 py-2.5 text-left text-[13px] leading-snug text-text shadow-lg transition-colors hover:border-primary/60 sm:mb-12"
          >
            {recado.fala}
          </button>
        )}
        <button
          type="button"
          onClick={aberto ? minimizar : reabrir}
          aria-expanded={aberto}
          aria-label={aberto ? "Fechar conversa com o Otto" : "Falar com o Otto"}
          className="otto-guia-entra -mt-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary sm:-mt-3"
        >
          <Otto estado={cara} seguirMouse className="w-24 sm:w-36" />
        </button>
      </div>
    </aside>
  );
}
