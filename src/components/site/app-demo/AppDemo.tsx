import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  MonitorSmartphone,
  PanelLeft,
  ScrollText,
  Store,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TENANT } from "./data";
import { ClientsScreen } from "./ClientsScreen";
import { DevicesScreen } from "./DevicesScreen";
import { OverviewScreen } from "./OverviewScreen";
import logo from "@/assets/acessofast-logo-real.png.asset.json";

type ScreenId = "overview" | "devices" | "clients";

const SCREENS: Record<ScreenId, { crumb: string; render: () => ReactNode }> = {
  overview: { crumb: "Visão geral", render: () => <OverviewScreen /> },
  devices: { crumb: "Dispositivos", render: () => <DevicesScreen /> },
  clients: { crumb: "Clientes", render: () => <ClientsScreen /> },
};

const ORDER: ScreenId[] = ["overview", "devices", "clients"];

/* Itens sem `screen` existem no painel real mas não fazem parte da demo. */
const NAV: Array<{
  section: string;
  items: Array<{ label: string; icon: typeof Users; screen?: ScreenId }>;
}> = [
  {
    section: "OPERAÇÃO",
    items: [
      { label: "Visão geral", icon: LayoutDashboard, screen: "overview" },
      { label: "Dispositivos", icon: MonitorSmartphone, screen: "devices" },
      { label: "Clientes", icon: Store, screen: "clients" },
      { label: "Auditoria", icon: ScrollText },
    ],
  },
  {
    section: "GESTÃO",
    items: [
      { label: "Usuários", icon: Users },
      { label: "Financeiro", icon: CreditCard },
    ],
  },
];

const AUTOPLAY_MS = 7000;

const STAGE_W = 1320;

/* Precisa medir antes do paint pra não piscar na escala errada, mas
   useLayoutEffect não existe no servidor. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function AppDemo() {
  const [screen, setScreen] = useState<ScreenId>("overview");
  const [autoplay, setAutoplay] = useState(true);
  const fitRef = useRef<HTMLDivElement>(null);
  // 0.93 é a escala no container cheio do hero: acerta o primeiro paint no
  // desktop antes da hidratação, e o observer corrige em qualquer outra largura.
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

  // Sem interação o painel se apresenta sozinho; no primeiro clique ele para e
  // o controle passa pro usuário. Quem pediu menos movimento não vê rodízio.
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

  return (
    <div ref={fitRef} className="af-app">
      <div className="af-viewport rounded-card border border-border shadow-lift">
        <div
          className="af-stage af-stars flex bg-[var(--af-bg)] text-[var(--af-text)] antialiased"
          style={{ transform: `scale(${k})` }}
        >
          {/* Sidebar */}
          <aside className="flex w-[196px] shrink-0 flex-col border-r border-[var(--af-border-soft)] bg-[var(--af-chrome)]">
            <div className="flex h-[52px] items-center gap-2 px-4">
              <img src={logo.url} alt="" className="h-[22px] w-[22px] rounded-md" />
              <div className="leading-tight">
                <div className="text-[13px] font-semibold text-[var(--af-text)]">AcessoFast</div>
                <div className="text-[10px] text-[var(--af-text-faint)]">acesso remoto</div>
              </div>
            </div>

            <nav className="mt-1 flex-1 px-2 pb-3">
              {NAV.map((group) => (
                <div key={group.section} className="mt-3 first:mt-0">
                  <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.12em] text-[var(--af-text-faint)]">
                    {group.section}
                  </div>
                  <ul className="space-y-[2px]">
                    {group.items.map((item) => {
                      const active = item.screen === screen;
                      const target = item.screen;
                      // Item sem tela vira <div>: nada de botão focável que não faz nada.
                      const Tag = target ? "button" : "div";
                      return (
                        <li key={item.label}>
                          <Tag
                            {...(target
                              ? { type: "button" as const, onClick: () => go(target) }
                              : { "aria-hidden": true })}
                            aria-current={active ? "page" : undefined}
                            title={target ? undefined : "Disponível no painel completo"}
                            className={cn(
                              "relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] transition-colors",
                              active
                                ? "bg-[var(--af-blue-soft)] font-semibold text-[var(--af-blue-text)]"
                                : "text-[var(--af-text-muted)]",
                              target
                                ? "cursor-pointer hover:bg-white/[0.045] hover:text-[var(--af-text)]"
                                : "cursor-default",
                            )}
                          >
                            {active ? (
                              <span className="absolute top-[7px] bottom-[7px] -left-[2px] w-[2px] rounded-full bg-[var(--af-blue)]" />
                            ) : null}
                            <item.icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.7} />
                            {item.label}
                          </Tag>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Coluna principal */}
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-[var(--af-border-soft)] bg-[var(--af-chrome)] px-4">
              <PanelLeft className="h-4 w-4 text-[var(--af-text-faint)]" strokeWidth={1.7} />
              <span className="h-4 w-px bg-[var(--af-border)]" />
              <div className="flex items-center gap-1.5 text-[12.5px]">
                <span className="text-[var(--af-text-muted)]">{TENANT}</span>
                <span className="text-[var(--af-text-faint)]">/</span>
                <span className="font-semibold text-[var(--af-text)]">{SCREENS[screen].crumb}</span>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-[var(--af-blue)] text-white">
                    <User className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[12px] font-semibold text-[var(--af-text)]">
                      Usuário
                    </span>
                    <span className="block text-[10.5px] text-[var(--af-text-faint)]">
                      Administrador
                    </span>
                  </span>
                  <ChevronDown
                    className="h-3.5 w-3.5 text-[var(--af-text-faint)]"
                    strokeWidth={1.8}
                  />
                </span>
              </div>
            </header>

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div
                key={screen}
                className="animate-in fade-in-0 slide-in-from-bottom-2 px-6 py-5 duration-300"
              >
                {SCREENS[screen].render()}
              </div>
              {/* Some no rodapé como um viewport de verdade, sem corte seco. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[var(--af-bg)] to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
