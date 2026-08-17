import {
  GitBranch,
  LayoutGrid,
  List,
  Monitor,
  MonitorSmartphone,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Tag as TagIcon,
} from "lucide-react";
import { COUNTS, DEVICES } from "./data";
import { Panel, PanelTitle, PageTitle, StatusPill, Tag, Td, Th, Toggle, Tr } from "./ui";

export function DevicesScreen() {
  return (
    <div className="space-y-4">
      <PageTitle
        title="Dispositivos"
        subtitle="Endpoints AcessoFast cadastrados no address book do seu tenant."
      />

      {/* Duas linhas: a barra completa do painel não cabe em uma só nesta
          largura, e é assim que o app se comporta em viewport estreito. */}
      <Panel className="space-y-2.5 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[12px] whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--af-green)]" />
              <b className="font-semibold text-[var(--af-text)]">{COUNTS.online}</b>
              <span className="text-[var(--af-text-muted)]">online</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--af-amber)]" />
              <b className="font-semibold text-[var(--af-text)]">{COUNTS.inService}</b>
              <span className="text-[var(--af-text-muted)]">em atendimento</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--af-text-faint)]" />
              <b className="font-semibold text-[var(--af-text)]">{COUNTS.offline}</b>
              <span className="text-[var(--af-text-muted)]">offline</span>
            </span>
          </div>

          <div className="flex h-[34px] min-w-0 flex-1 items-center gap-2 rounded-lg border border-[var(--af-border)] bg-white/[0.03] px-3">
            <Search
              className="h-3.5 w-3.5 shrink-0 text-[var(--af-text-faint)]"
              strokeWidth={1.8}
            />
            <span className="truncate text-[12.5px] text-[var(--af-text-faint)]">
              Buscar por ID, alias, grupo ou CNPJ...
            </span>
          </div>

          <button
            type="button"
            className="inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-lg bg-[var(--af-blue)] px-3 text-[12.5px] font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
            Adicionar dispositivo
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Toggle label="☆ Só favoritos" />
          <Toggle label="Mostrar inativos" />

          <button
            type="button"
            className="inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-lg border border-[var(--af-border)] bg-[var(--af-card-2)] px-3 text-[12.5px] font-medium text-[var(--af-text)]"
          >
            <TagIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
            Marcadores
          </button>

          <div className="flex shrink-0 items-center gap-1">
            {[List, LayoutGrid, GitBranch].map((Icon, i) => (
              <span
                key={i}
                className={`flex h-[30px] w-[30px] items-center justify-center rounded-md border ${
                  i === 0
                    ? "border-[var(--af-border)] bg-white/[0.06] text-[var(--af-text)]"
                    : "border-transparent text-[var(--af-text-faint)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              </span>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="p-4">
        <PanelTitle
          icon={
            <MonitorSmartphone className="h-4 w-4 text-[var(--af-blue-text)]" strokeWidth={1.8} />
          }
          title="Address book"
          subtitle={`${COUNTS.devices} dispositivo(s)`}
        />
        <table className="mt-3 w-full border-collapse table-fixed">
          <thead>
            <tr>
              <Th className="w-[280px]">Computador</Th>
              <Th className="w-[260px]">Cliente</Th>
              <Th className="w-[200px]">SO</Th>
              <Th className="w-[140px]">Status</Th>
              <Th className="w-[130px] text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {DEVICES.map((d) => (
              <Tr key={d.deviceId}>
                <Td>
                  <div className="flex items-start gap-2">
                    <Star
                      className="mt-[3px] h-3.5 w-3.5 shrink-0 text-[var(--af-text-faint)]"
                      strokeWidth={1.6}
                    />
                    <Monitor
                      className="mt-[3px] h-3.5 w-3.5 shrink-0 text-[var(--af-blue-text)]"
                      strokeWidth={1.6}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-[var(--af-text)]">{d.name}</div>
                      <div className="font-mono text-[11px] text-[var(--af-text-faint)]">
                        {d.deviceId}
                      </div>
                      {d.tags?.length ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {d.tags.map((t) => (
                            <Tag key={t}>{t}</Tag>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Td>
                <Td>
                  {d.client ? (
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[var(--af-text)]">{d.client}</div>
                      <div className="font-mono text-[11px] text-[var(--af-text-faint)]">
                        {d.clientDoc}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[var(--af-text-faint)]">—</span>
                  )}
                </Td>
                <Td className="truncate text-[var(--af-text-muted)]">{d.os}</Td>
                <Td>
                  <StatusPill status={d.status} suffix={d.offlineFor} />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      className="inline-flex h-[28px] items-center gap-1.5 rounded-md bg-[var(--af-blue)] px-2.5 text-[11.5px] font-semibold text-white"
                    >
                      <Monitor className="h-3.5 w-3.5" strokeWidth={1.9} />
                      Conectar
                    </button>
                    <span className="flex h-[28px] w-[24px] items-center justify-center text-[var(--af-text-faint)]">
                      <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </span>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
