import { Pencil, Plus, Search, Store, Upload } from "lucide-react";
import { CLIENTS, COUNTS } from "./data";
import { Panel, PanelTitle, PageTitle, Td, Th, Tr } from "./ui";

export function ClientsScreen() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <PageTitle
          title="Clientes"
          subtitle="Clientes cadastrados na empresa e vínculo com dispositivos."
        />
        {/* Sem seletor de empresa: isso é controle de super admin, o admin do
            tenant só enxerga os clientes da própria empresa. */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[var(--af-border)] bg-[var(--af-card-2)] px-3 text-[12.5px] font-medium text-[var(--af-text)]"
          >
            <Upload className="h-3.5 w-3.5" strokeWidth={1.8} />
            Importar planilha
          </button>
          <button
            type="button"
            className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-[var(--af-blue)] px-3 text-[12.5px] font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
            Novo cliente
          </button>
        </div>
      </div>

      <Panel className="p-4">
        <PanelTitle
          icon={<Store className="h-4 w-4 text-[var(--af-blue-text)]" strokeWidth={1.8} />}
          title="Clientes cadastrados"
          subtitle={`${COUNTS.clients} cliente(s)`}
          right={
            <div className="flex h-[34px] w-[290px] items-center gap-2 rounded-lg border border-[var(--af-border)] bg-white/[0.03] px-3">
              <Search
                className="h-3.5 w-3.5 shrink-0 text-[var(--af-text-faint)]"
                strokeWidth={1.8}
              />
              <span className="truncate text-[12.5px] text-[var(--af-text-faint)]">
                Buscar por nome, CNPJ/CPF ou telefone
              </span>
            </div>
          }
        />
        <table className="mt-3 w-full border-collapse table-fixed">
          <thead>
            <tr>
              <Th>Cliente</Th>
              <Th className="w-[200px]">CNPJ / CPF</Th>
              <Th className="w-[170px]">Telefone</Th>
              <Th className="w-[120px]">Dispositivos</Th>
              <Th className="w-[110px]">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {CLIENTS.map((c) => (
              <Tr key={c.doc}>
                <Td className="truncate font-semibold text-[var(--af-text)]">{c.name}</Td>
                <Td className="font-mono text-[11.5px] text-[var(--af-text-muted)]">{c.doc}</Td>
                <Td className="font-mono text-[11.5px] text-[var(--af-text-muted)]">{c.phone}</Td>
                <Td className="text-[var(--af-text)]">{c.devices}</Td>
                <Td>
                  <button
                    type="button"
                    className="inline-flex h-[28px] items-center gap-1.5 rounded-md border border-[var(--af-border)] bg-[var(--af-card-2)] px-2.5 text-[11.5px] font-medium text-[var(--af-text)]"
                  >
                    <Pencil className="h-3 w-3" strokeWidth={1.9} />
                    Editar
                  </button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
