import { Activity, MonitorSmartphone, Radio, Users } from "lucide-react";
import { COUNTS, RECENT_DEVICES } from "./data";
import { Panel, PanelTitle, PageTitle, Td, Th, Tr } from "./ui";

/* Esta é a visão do cliente (admin do tenant), não a de super admin: sem
   monitoramento do relay, sem status da plataforma e sem coluna de empresa. */
const KPIS = [
  {
    label: "USUÁRIOS ATIVOS",
    value: COUNTS.users,
    hint: "Contas habilitadas no seu tenant",
    icon: Users,
    tone: "text-[var(--af-blue-text)] bg-[var(--af-blue)]/12 border-[var(--af-blue)]/25",
  },
  {
    label: "DISPOSITIVOS",
    value: COUNTS.devices,
    hint: "Endpoints no address book",
    icon: MonitorSmartphone,
    tone: "text-[var(--af-green)] bg-[var(--af-green)]/12 border-[var(--af-green)]/25",
  },
  {
    label: "SESSÕES ATIVAS",
    value: COUNTS.activeSessions,
    hint: "Conexões em andamento agora",
    icon: Radio,
    tone: "text-[var(--af-amber)] bg-[var(--af-amber)]/12 border-[var(--af-amber)]/25",
  },
  {
    label: "SESSÕES 24H",
    value: COUNTS.sessions24h,
    hint: "Total nas últimas 24 horas",
    icon: Activity,
    tone: "text-[#a78bfa] bg-[#a78bfa]/12 border-[#a78bfa]/25",
  },
];

export function OverviewScreen() {
  return (
    <div className="space-y-4">
      <PageTitle
        title="Dashboard"
        subtitle={`${COUNTS.devices} dispositivos · ${COUNTS.activeSessions} sessões ativas`}
      />

      <div className="grid grid-cols-4 gap-3">
        {KPIS.map((kpi) => (
          <Panel
            key={kpi.label}
            className="bg-gradient-to-br from-white/[0.045] to-transparent px-4 py-3.5"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-[var(--af-text-muted)]">
                {kpi.label}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg border ${kpi.tone}`}
              >
                <kpi.icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              </span>
            </div>
            <div className="mt-2 text-[30px] leading-none font-semibold text-[var(--af-text)]">
              {kpi.value}
            </div>
            <p className="mt-2 text-[11px] text-[var(--af-text-faint)]">{kpi.hint}</p>
          </Panel>
        ))}
      </div>

      <Panel className="p-4">
        <PanelTitle
          title="Dispositivos recentes"
          subtitle="Últimos endpoints cadastrados na sua empresa"
          right={
            <span className="text-[12px] font-medium text-[var(--af-blue-text)]">Ver todos</span>
          }
        />
        <table className="mt-3 w-full border-collapse table-fixed">
          <thead>
            <tr>
              <Th className="w-[220px]">Nome</Th>
              <Th className="w-[280px]">SO</Th>
              <Th>Grupo</Th>
              <Th className="w-[110px]">Status</Th>
              <Th className="w-[130px]">Últ. online</Th>
            </tr>
          </thead>
          <tbody>
            {RECENT_DEVICES.map((d) => (
              <Tr key={d.deviceId}>
                <Td className="truncate font-semibold text-[var(--af-text)]">{d.name}</Td>
                <Td className="truncate text-[var(--af-text-muted)]">{d.os}</Td>
                <Td>
                  {d.group ? (
                    <span className="inline-flex max-w-full truncate rounded-md border border-[var(--af-border)] bg-white/[0.04] px-2 py-[3px] text-[11.5px] text-[var(--af-text)]">
                      {d.group}
                    </span>
                  ) : (
                    <span className="text-[var(--af-text-faint)]">—</span>
                  )}
                </Td>
                <Td>
                  <span
                    className={
                      d.enabled
                        ? "inline-flex rounded-md border border-[var(--af-green)]/30 bg-[var(--af-green)]/10 px-2 py-[3px] text-[11px] font-medium text-[var(--af-green)]"
                        : "inline-flex rounded-md border border-[var(--af-border)] bg-white/[0.04] px-2 py-[3px] text-[11px] font-medium text-[var(--af-text-muted)]"
                    }
                  >
                    {d.enabled ? "Ativo" : "Inativo"}
                  </span>
                </Td>
                <Td className="font-mono text-[11.5px] text-[var(--af-text-muted)]">
                  {d.lastOnline}
                </Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
