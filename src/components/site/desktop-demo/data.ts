/* Dados ilustrativos da réplica do app instalado. Os mesmos nomes do protótipo
   de design, pra quem já viu o app reconhecer as telas. */

export type Os = "win" | "apple" | "android";

export type Marker = { label: string; color: MarkerColor };
export type MarkerColor = "blue" | "green" | "red" | "amber" | "violet" | "pink";

export type Device = {
  id: string;
  name: string;
  os: Os;
  online: boolean;
  when: string;
  fav?: boolean;
  markers?: Marker[];
};

export const MY_ID = "847392115";

export const TECH = { name: "Carlos · Suporte técnico", id: "604219377", initials: "CS" };

const M = {
  clinica: { label: "Clínica", color: "blue" },
  contrato: { label: "Contrato mensal", color: "green" },
  urgente: { label: "Urgente", color: "red" },
  aguardando: { label: "Aguardando cliente", color: "amber" },
  servidor: { label: "Servidor", color: "violet" },
  varejo: { label: "Varejo", color: "pink" },
} satisfies Record<string, Marker>;

export const DEVICES: Device[] = [
  {
    id: "51200651",
    name: "Recepção · Clínica Vida",
    os: "win",
    online: true,
    when: "há 12 min",
    fav: true,
    markers: [M.clinica, M.contrato],
  },
  {
    id: "733184902",
    name: "Caixa 02 · Mercado Bom Preço",
    os: "win",
    online: true,
    when: "ontem, 17:40",
    markers: [M.varejo, M.contrato],
  },
  {
    id: "298551407",
    name: "MacBook da Diretoria",
    os: "apple",
    online: false,
    when: "26/09",
    markers: [M.aguardando],
  },
  {
    id: "415770238",
    name: "Financeiro · Contábil Souza",
    os: "win",
    online: true,
    when: "25/09",
    fav: true,
    markers: [M.contrato],
  },
  {
    id: "902114563",
    name: "Tablet do Estoque",
    os: "android",
    online: true,
    when: "24/09",
    markers: [M.varejo],
  },
  {
    id: "660392781",
    name: "Servidor · Clínica Vida",
    os: "win",
    online: false,
    when: "20/09",
    fav: true,
    markers: [M.clinica, M.servidor, M.urgente],
  },
];

export const RECEIVED = [
  { ini: "CS", name: "Carlos · Suporte técnico", when: "hoje, 09:14", dur: "18 min" },
  { ini: "CS", name: "Carlos · Suporte técnico", when: "26/09, 16:40", dur: "42 min" },
  { ini: "JT", name: "João · TI da Clínica", when: "22/09, 11:05", dur: "7 min" },
];

export type FileRow = {
  name: string;
  size?: string;
  date: string;
  dir?: boolean;
  selected?: boolean;
};

export const FILES_LOCAL: FileRow[] = [
  { name: "Drivers impressora", date: "22/09 14:10", dir: true },
  { name: "atualizacao-sistema-v8.exe", size: "48,2 MB", date: "29/09 09:02", selected: true },
  { name: "backup-config.zip", size: "3,1 MB", date: "28/09 18:45" },
  { name: "manual-usuario.pdf", size: "812 KB", date: "15/09 11:20" },
  { name: "certificado-a1.pfx", size: "6 KB", date: "02/09 16:33" },
];

export const FILES_REMOTE: FileRow[] = [
  { name: "Antigos", date: "02/08 08:30", dir: true },
  { name: "atualizacao-sistema-v7.exe", size: "46,9 MB", date: "02/08 08:31" },
  { name: "licenca.key", size: "2 KB", date: "10/01 16:05" },
  { name: "log-erros.txt", size: "118 KB", date: "29/09 08:57" },
];

export const fmtId = (s: string) => s.replace(/\D/g, "").replace(/(\d{3})(?=\d)/g, "$1 ");
export const idGroups = (s: string) => s.replace(/\D/g, "").match(/\d{1,3}/g) ?? [];
