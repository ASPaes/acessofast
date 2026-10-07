import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  Apple,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clipboard,
  Clock,
  Copy,
  Download,
  Ellipsis,
  Eye,
  File,
  Folder,
  FolderOpen,
  Home,
  Keyboard,
  Maximize,
  MessageSquare,
  Monitor,
  MousePointer2,
  Network,
  Plus,
  Power,
  Settings,
  Shield,
  Smartphone,
  Star,
  Tag,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/acessofast-logo-real.png.asset.json";
import {
  DEVICES,
  FILES_LOCAL,
  FILES_REMOTE,
  MY_ID,
  RECEIVED,
  TECH,
  fmtId,
  idGroups,
  type Device,
  type FileRow,
  type Os,
} from "./data";

/* Réplica do app instalado (AcessoFast para Windows). Não conecta em nada:
   são as telas principais desenhadas em HTML, trocando sozinhas até o
   visitante clicar. */

type ScreenId = "home" | "session" | "files" | "request";

const SCREENS: Array<{ id: ScreenId; label: string; caption: string }> = [
  {
    id: "home",
    label: "Início",
    caption: "Seu ID, a senha e todos os computadores da empresa num lugar só.",
  },
  {
    id: "session",
    label: "Acesso remoto",
    caption: "A tela do cliente se ajusta à janela, com tudo o que o técnico precisa na barra.",
  },
  {
    id: "files",
    label: "Arquivos",
    caption: "Envie e traga arquivos entre os dois computadores, com fila de transferência.",
  },
  {
    id: "request",
    label: "Pedido de acesso",
    caption: "Do lado do cliente: ele vê quem quer entrar e escolhe o que liberar.",
  },
];

const ORDER = SCREENS.map((s) => s.id);
const AUTOPLAY_MS = 6500;
const STAGE_W = 1180;

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const SESSION_DEVICE = DEVICES[0];
const FILES_DEVICE = DEVICES[3];

export function DesktopDemo() {
  const [screen, setScreen] = useState<ScreenId>("home");
  const [autoplay, setAutoplay] = useState(true);
  const fitRef = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.93);

  useIsomorphicLayoutEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const apply = (width: number) => {
      if (width > 0) setK(Math.min(1, width / STAGE_W));
    };
    apply(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(() => apply(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setScreen((current) => ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [autoplay]);

  function go(next: ScreenId) {
    setAutoplay(false);
    setScreen(next);
  }

  const current = SCREENS.find((s) => s.id === screen)!;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Telas do app">
        {SCREENS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === screen}
            onClick={() => go(s.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              s.id === screen
                ? "border-primary/60 bg-primary/15 text-text"
                : "border-border bg-surface text-text-muted hover:bg-surface-2 hover:text-text",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-4 min-h-[1.5rem] text-center text-[15px] text-text-muted">
        {current.caption}
      </p>

      <div ref={fitRef} className="afd mt-8">
        <div className="afd-viewport">
          <div className="afd-stage" style={{ transform: `scale(${k})` }}>
            <div className="afd-win">
              <TitleBar screen={screen} onGo={go} />
              <div className="afd-body">
                <div key={screen} className="animate-in fade-in-0 duration-300 h-full">
                  {screen === "home" || screen === "request" ? <HomeScreen /> : null}
                  {screen === "session" ? <SessionScreen /> : null}
                  {screen === "files" ? <FilesScreen /> : null}
                </div>
                {screen === "request" ? <RequestWindow /> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Peças ---------------- */

function Logo({ size = 20 }: { size?: number }) {
  return (
    <img
      src={logo.url}
      alt=""
      className="afd-logo"
      style={{ width: size, height: size, borderRadius: size / 4 }}
    />
  );
}

function OsIcon({ os, size = 18 }: { os: Os; size?: number }) {
  const Icon = os === "apple" ? Apple : os === "android" ? Smartphone : Monitor;
  return <Icon style={{ width: size, height: size }} strokeWidth={1.8} />;
}

function Toggle({ on }: { on: boolean }) {
  return <span className={cn("afd-tg", on && "on")} aria-hidden />;
}

/* ---------------- Barra de título com abas ---------------- */

function TitleBar({ screen, onGo }: { screen: ScreenId; onGo: (s: ScreenId) => void }) {
  const tabs: Array<{ id: ScreenId; label: ReactNode; icon: ReactNode }> = [
    { id: "home", label: "Início", icon: <Logo size={16} /> },
    {
      id: "session",
      label: SESSION_DEVICE.name,
      icon: <OsIcon os={SESSION_DEVICE.os} size={15} />,
    },
    {
      id: "files",
      label: `Arquivos · ${FILES_DEVICE.name}`,
      icon: <Folder style={{ width: 15, height: 15 }} strokeWidth={1.8} />,
    },
  ];
  const active = screen === "request" ? "home" : screen;

  return (
    <div className="afd-titlebar">
      <div className="afd-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            tabIndex={-1}
            onClick={() => onGo(t.id)}
            className={cn("afd-wtab", t.id === active && "on")}
          >
            {t.icon}
            <span className="n">{t.label}</span>
            {t.id !== "home" ? <X className="x" strokeWidth={1.8} /> : null}
          </button>
        ))}
        <span className="afd-wtab plus">
          <Plus style={{ width: 15, height: 15 }} strokeWidth={1.8} />
        </span>
      </div>
      <div className="afd-wctl">
        <i>—</i>
        <i>▢</i>
        <i>✕</i>
      </div>
    </div>
  );
}

/* ---------------- Início ---------------- */

function HomeScreen() {
  const nav = [
    { icon: Home, label: "Início", on: true },
    { icon: Clock, label: "Recentes", count: 12 },
    { icon: Star, label: "Favoritos", count: 3 },
    { icon: Network, label: "Na mesma rede", count: 3 },
    { icon: FolderOpen, label: "Transferências" },
  ];

  return (
    <div className="afd-home">
      <aside className="afd-side">
        <div className="afd-brand">
          <Logo size={30} />
          AcessoFast
        </div>
        {nav.map((n) => (
          <div key={n.label} className={cn("afd-nav", n.on && "on")}>
            <n.icon strokeWidth={1.8} />
            {n.label}
            {n.count != null ? <span className="count">{n.count}</span> : null}
          </div>
        ))}
        <div className="flex-1" />
        <div className="afd-nav">
          <Settings strokeWidth={1.8} />
          Configurações
        </div>
        <div className="afd-foot">
          <span>AcessoFast</span>
          <span>Versão 2.0</span>
        </div>
      </aside>

      <main className="afd-main">
        <div className="afd-arr">
          <div className="afd-colL">
            <section className="afd-card">
              <div className="afd-kv">
                <h4>
                  <Monitor strokeWidth={1.8} />
                  Este computador
                </h4>
                <span className="afd-pill ok">
                  <span className="dot" />
                  Pronto para receber acesso
                </span>
              </div>
              <div>
                <div className="afd-lbl">Seu ID</div>
                <div className="afd-kv">
                  <span className="afd-idbig">
                    {idGroups(MY_ID).map((g, i) => (
                      <span key={i} className="grp">
                        {g}
                      </span>
                    ))}
                  </span>
                  <span className="afd-ibtn">
                    <Copy strokeWidth={1.8} />
                  </span>
                </div>
              </div>
              <div className="afd-divider" />
              <div>
                <div className="afd-lbl">Senha</div>
                <div className="afd-kv">
                  <span className="afd-pw">••••••••••</span>
                  <span className="flex gap-2">
                    <span className="afd-ibtn">
                      <Eye strokeWidth={1.8} />
                    </span>
                    <span className="afd-ibtn">
                      <Copy strokeWidth={1.8} />
                    </span>
                  </span>
                </div>
              </div>
              <div className="afd-hint">
                <Shield strokeWidth={1.8} />A senha é definida pelo painel da sua empresa.
              </div>
            </section>

            <section className="afd-card">
              <h4>
                <ArrowRight strokeWidth={1.8} />
                Acessar outro computador
              </h4>
              <div className="afd-field">
                <span className="ph">Digite o ID</span>
              </div>
              <div className="flex gap-2">
                <span className="afd-btn p" style={{ flex: 1 }}>
                  <Monitor strokeWidth={1.8} />
                  Conectar
                </span>
                <span className="afd-btn">
                  <Folder strokeWidth={1.8} />
                  Arquivos
                </span>
                <span className="afd-btn g">
                  <Ellipsis strokeWidth={1.8} />
                </span>
              </div>
            </section>

            <section className="afd-card">
              <h4>
                <Shield strokeWidth={1.8} />
                Quem acessou este computador
              </h4>
              <div className="flex flex-col gap-2.5">
                {RECEIVED.map((r, i) => (
                  <div key={i} className="afd-ac">
                    <span className="afd-avatar">{r.ini}</span>
                    <div className="min-w-0">
                      <b>{r.name}</b>
                      <span>
                        {r.when} · {r.dur}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="afd-colR">
            <div className="afd-sechead">
              <h3>Seus computadores</h3>
              <div className="flex gap-2">
                <div className="afd-seg">
                  <span className="on">Recentes</span>
                  <span>Favoritos</span>
                  <span>Na mesma rede</span>
                </div>
                <span className="afd-btn sm g">
                  <Tag strokeWidth={1.8} />
                  Marcadores
                </span>
              </div>
            </div>
            <div className="afd-grid">
              {DEVICES.map((d) => (
                <DeviceCard key={d.id} d={d} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DeviceCard({ d }: { d: Device }) {
  return (
    <div className="afd-dev">
      <div className="top">
        <span className="afd-os">
          <OsIcon os={d.os} />
        </span>
        <div className="min-w-0">
          <div className="nm">{d.name}</div>
          <div className="id">{fmtId(d.id)}</div>
        </div>
        <span className={cn("star", d.fav && "on")}>
          <Star strokeWidth={1.8} />
        </span>
      </div>
      {d.markers?.length ? (
        <div className="afd-mks">
          {d.markers.slice(0, 2).map((m) => (
            <span key={m.label} className="afd-mk" data-c={m.color}>
              <i />
              {m.label}
            </span>
          ))}
          {d.markers.length > 2 ? <span className="afd-mk">+{d.markers.length - 2}</span> : null}
        </div>
      ) : null}
      <div className="meta">
        <span className={cn("st", d.online ? "on" : "off")}>
          <span className="dot" />
          {d.online ? "Online" : "Offline"}
        </span>
        <span>{d.when}</span>
      </div>
    </div>
  );
}

/* ---------------- Acesso remoto ---------------- */

function SessionScreen() {
  const d = SESSION_DEVICE;
  return (
    <div className="afd-remote">
      <div className="afd-rstage">
        <div className="afd-rmon">
          <div className="afd-rapp">
            <div className="rt">Sistema da Clínica · Agenda do dia</div>
            <div className="rl">
              <div className="lines">
                {[60, 75, 50, 68, 45].map((w, i) => (
                  <i key={i} style={{ width: `${w}%`, background: "#cfd7e3" }} />
                ))}
              </div>
              <div className="agenda">
                {[
                  ["08:00", "Maria Oliveira", "Retorno"],
                  ["08:30", "José Santos", "Consulta"],
                  ["09:00", "Ana Paula Lima", "Exame"],
                  ["09:30", "Pedro Henrique", "Consulta"],
                  ["10:00", "Luciana Costa", "Retorno"],
                  ["10:30", "Roberto Alves", "Consulta"],
                ].map(([h, n, t]) => (
                  <div key={h} className="row">
                    <b>{h}</b>
                    <span>{n}</span>
                    <em>{t}</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="afd-rtask">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="afd-rcursor">
            <MousePointer2 fill="#fff" stroke="#000" strokeWidth={1.2} />
          </div>
        </div>
      </div>

      <div className="afd-tb">
        <div className="peer">
          <Logo size={20} />
          <div>
            <b>{d.name}</b> <span>{fmtId(d.id)}</span>
          </div>
        </div>
        <span className="sep" />
        <div className="grp">
          <span className="b on">
            <Monitor strokeWidth={1.8} />1
          </span>
          <span className="b">2</span>
        </div>
        <span className="sep" />
        <div className="grp">
          <span className="b">
            <Power strokeWidth={1.8} />
            Ações
            <ChevronDown className="s" strokeWidth={1.8} />
          </span>
          <span className="b">
            <Monitor strokeWidth={1.8} />
            Exibição
            <ChevronDown className="s" strokeWidth={1.8} />
          </span>
          <span className="b">
            <Keyboard strokeWidth={1.8} />
          </span>
          <span className="b">
            <Folder strokeWidth={1.8} />
          </span>
          <span className="b">
            <Volume2 strokeWidth={1.8} />
          </span>
          <span className="b on">
            <MessageSquare strokeWidth={1.8} />
          </span>
          <span className="b">
            <CircleDot strokeWidth={1.8} />
          </span>
          <span className="b">
            <Camera strokeWidth={1.8} />
          </span>
          <span className="b">
            <Maximize strokeWidth={1.8} />
          </span>
          <span className="b">
            <ChevronUp className="s" strokeWidth={1.8} />
          </span>
        </div>
        <span className="sep" />
        <span className="b end">Encerrar</span>
      </div>

      <div className="afd-chat">
        <div className="ch">
          <span>Conversa com {d.name}</span>
          <X style={{ width: 15, height: 15 }} strokeWidth={1.8} />
        </div>
        <div className="msgs">
          <div className="msg">
            Bom dia! A agenda não está abrindo os horários da tarde.<small>09:12</small>
          </div>
          <div className="msg eu">
            Bom dia! Já estou acessando, um minuto que eu vejo aqui.<small>09:14</small>
          </div>
          <div className="msg">
            Obrigada 🙏<small>09:14</small>
          </div>
        </div>
        <div className="in">Escreva uma mensagem</div>
      </div>

      <div className="afd-quality">
        <span>
          Conexão <b>boa</b>
        </span>
        <span>32 ms</span>
        <span>30 fps</span>
        <span>Direta</span>
      </div>
    </div>
  );
}

/* ---------------- Arquivos ---------------- */

function FilesScreen() {
  const d = FILES_DEVICE;
  return (
    <div className="afd-ftwrap">
      <div className="afd-ft">
        <FilePane
          title={
            <>
              <Monitor strokeWidth={1.8} />
              Este computador
            </>
          }
          path="C:\Users\Tecnico\Downloads"
          rows={FILES_LOCAL}
        />
        <div className="afd-mid">
          <span className="afd-ibtn p">
            <ArrowRight strokeWidth={1.8} />
          </span>
          <span className="afd-ibtn">
            <ArrowLeft strokeWidth={1.8} />
          </span>
        </div>
        <FilePane
          title={
            <>
              <OsIcon os={d.os} size={15} />
              {d.name}
            </>
          }
          path="C:\Sistema\Instaladores"
          rows={FILES_REMOTE}
        />
      </div>
      <div className="afd-queue">
        <div className="afd-kv">
          <span className="afd-lbl">Fila de transferência</span>
          <span className="afd-hint">
            Arraste arquivos de um lado para o outro ou use as setas do meio.
          </span>
        </div>
        <div className="afd-qi">
          <span className="nm">
            <Upload strokeWidth={1.8} />
            atualizacao-sistema-v8.exe
          </span>
          <div className="bar">
            <i style={{ width: "64%" }} />
          </div>
          <span className="pc">64%</span>
        </div>
        <div className="afd-qi done">
          <span className="nm">
            <Download strokeWidth={1.8} />
            log-erros.txt
          </span>
          <div className="bar">
            <i style={{ width: "100%" }} />
          </div>
          <span className="pc">Pronto</span>
        </div>
      </div>
    </div>
  );
}

function FilePane({ title, path, rows }: { title: ReactNode; path: string; rows: FileRow[] }) {
  return (
    <div className="afd-pane">
      <div className="ph">
        <b>{title}</b>
        <span className="dd">
          Disco C:
          <ChevronDown strokeWidth={1.8} />
        </span>
      </div>
      <div className="crumb">
        <span className="afd-ibtn sm">
          <ArrowUp strokeWidth={1.8} />
        </span>
        <span>{path}</span>
      </div>
      <div className="fl">
        {rows.map((f) => (
          <div key={f.name} className={cn("fr", f.selected && "sel")}>
            {f.dir ? (
              <Folder className="fic f" strokeWidth={1.8} />
            ) : (
              <File className="fic" strokeWidth={1.8} />
            )}
            <span className="truncate">{f.name}</span>
            <span className="sz">{f.size ?? "—"}</span>
            <span className="dt">{f.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Pedido de acesso (lado do cliente) ---------------- */

function RequestWindow() {
  const perms = [
    { icon: MousePointer2, label: "Mouse e teclado", on: true },
    { icon: Clipboard, label: "Copiar e colar", on: true },
    { icon: Folder, label: "Arquivos", on: true },
    { icon: Volume2, label: "Som", on: false },
  ];
  return (
    <>
      <div className="afd-overlay animate-in fade-in-0 duration-300" />
      <div className="afd-cmwin animate-in fade-in-0 zoom-in-95 duration-300" role="presentation">
        <div className="tbar">
          <span className="t">
            <Logo size={18} />
            Pedido de acesso
          </span>
        </div>
        <div className="cm">
          <div className="who">
            <span className="afd-avatar lg">{TECH.initials}</span>
            <div>
              <div className="n">{TECH.name}</div>
              <div className="s">ID {fmtId(TECH.id)}</div>
            </div>
          </div>
          <p className="ask">
            <b>{TECH.name}</b> quer controlar este computador.
          </p>
          <div className="perms">
            {perms.map((p) => (
              <div key={p.label} className="perm">
                <span>
                  <p.icon strokeWidth={1.8} />
                  {p.label}
                </span>
                <Toggle on={p.on} />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="afd-btn d" style={{ flex: 1 }}>
              <X strokeWidth={1.8} />
              Recusar
            </span>
            <span className="afd-btn p" style={{ flex: 1.4 }}>
              <Check strokeWidth={1.8} />
              Permitir acesso
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
