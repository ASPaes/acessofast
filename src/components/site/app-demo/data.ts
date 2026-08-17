/* Dados da réplica do painel — todos fictícios.
   Nada aqui pode sair dos prints de origem: CNPJ, telefone, razão social, ID de
   dispositivo e hostname são inventados em formato de placeholder óbvio, porque
   isso vai pra uma página pública. "Últ. online" é relativo pra nunca envelhecer. */

export type DeviceStatus = "online" | "atendimento" | "offline";

export type Device = {
  name: string;
  deviceId: string;
  tags?: string[];
  client: string | null;
  clientDoc?: string;
  os: string;
  status: DeviceStatus;
  offlineFor?: string;
  lastOnline: string;
  group: string | null;
  /* "Ativo"/"Inativo" no dashboard é o cadastro, não a conexão. */
  enabled: boolean;
};

const ANDROID_OS = "Android BP2A.250605.031.A3";

export const DEVICES: Device[] = [
  {
    name: "DESKTOP-8KQ2M4R",
    deviceId: "100200301",
    tags: ["matriz"],
    client: "Auto Peças Trevo",
    clientDoc: "12.345.678/0001-00",
    os: "Windows 10.0.26100",
    status: "atendimento",
    lastOnline: "agora",
    group: "Auto Peças Trevo",
    enabled: true,
  },
  {
    name: "DESKTOP-V7X1N3T",
    deviceId: "100200302",
    client: null,
    os: "Windows 10.0.19045",
    status: "online",
    lastOnline: "agora",
    group: null,
    enabled: true,
  },
  {
    name: "DESKTOP-R4B9L6C",
    deviceId: "100200303",
    client: "Climatiza Refrigeração",
    clientDoc: "44.555.666/0001-12",
    os: "Windows 10.0.26200",
    status: "online",
    lastOnline: "há 1 min",
    group: "Climatiza Refrigeração",
    enabled: true,
  },
  {
    name: "ATENDIMENTO-02",
    deviceId: "100200304",
    client: null,
    os: "Windows 10.0.22631",
    status: "online",
    lastOnline: "há 3 min",
    group: null,
    enabled: true,
  },
  {
    name: "PDV-BALCAO",
    deviceId: "100200305",
    tags: ["Caixa único com servidor"],
    client: "Mercado Bom Preço",
    clientDoc: "56.789.012/0001-04",
    os: "Windows 10.0.26200",
    status: "online",
    lastOnline: "há 4 min",
    group: "Mercado Bom Preço",
    enabled: true,
  },
  {
    name: "DESKTOP-P2W8H5J",
    deviceId: "100200306",
    tags: ["adicional", "caixa 1"],
    client: "Farmácia Vida Nova",
    clientDoc: "78.901.234/0001-06",
    os: "Windows 10.0.19045",
    status: "online",
    lastOnline: "há 8 min",
    group: "Farmácia Vida Nova",
    enabled: true,
  },
  {
    name: "RECEPCAO-01",
    deviceId: "100200307",
    client: "Clínica Sorriso Odontologia",
    clientDoc: "34.567.890/0001-02",
    os: "Windows 10.0.26200",
    status: "online",
    lastOnline: "há 12 min",
    group: "Clínica Sorriso Odontologia",
    enabled: true,
  },
  {
    name: "Android",
    deviceId: "100200308",
    client: null,
    os: ANDROID_OS,
    status: "offline",
    offlineFor: "há 4 d",
    lastOnline: "há 4 d",
    group: null,
    enabled: true,
  },
  {
    name: "Android",
    deviceId: "100200309",
    client: null,
    os: ANDROID_OS,
    status: "offline",
    offlineFor: "há 5 d",
    lastOnline: "há 5 d",
    group: null,
    enabled: true,
  },
  {
    name: "Android",
    deviceId: "100200310",
    client: null,
    os: ANDROID_OS,
    status: "offline",
    offlineFor: "há 6 d",
    lastOnline: "há 6 d",
    group: null,
    enabled: false,
  },
  {
    name: "Android",
    deviceId: "100200311",
    client: null,
    os: ANDROID_OS,
    status: "offline",
    lastOnline: "nunca",
    group: null,
    enabled: false,
  },
];

/* O dashboard lista os últimos cadastrados, não os mais conectados — daí a
   ordem própria, com Windows recentes no topo e os Androids parados embaixo. */
export const RECENT_DEVICES: Device[] = [
  DEVICES[0],
  DEVICES[2],
  DEVICES[7],
  DEVICES[8],
  DEVICES[9],
  DEVICES[10],
];

export type Client = {
  name: string;
  doc: string;
  phone: string;
  devices: number;
};

export const CLIENTS: Client[] = [
  { name: "Adega do Vale", doc: "12.345.678/0001-00", phone: "(11) 91234-5678", devices: 1 },
  { name: "Auto Peças Trevo", doc: "23.456.789/0001-01", phone: "(21) 92345-6789", devices: 4 },
  { name: "Bazar Estrela do Sul", doc: "34.567.890/0001-02", phone: "(31) 93456-7890", devices: 2 },
  {
    name: "Casa das Ferramentas Duarte",
    doc: "45.678.901/0001-03",
    phone: "(41) 94567-8901",
    devices: 3,
  },
  {
    name: "Clínica Sorriso Odontologia",
    doc: "56.789.012/0001-04",
    phone: "(47) 95678-9012",
    devices: 5,
  },
  { name: "Distribuidora Aurora", doc: "67.890.123/0001-05", phone: "(48) 96789-0123", devices: 0 },
  { name: "Farmácia Vida Nova", doc: "78.901.234/0001-06", phone: "(49) 97890-1234", devices: 6 },
  {
    name: "Lanchonete Ponto Certo",
    doc: "89.012.345/0001-07",
    phone: "(51) 98901-2345",
    devices: 1,
  },
  { name: "Mercado Bom Preço", doc: "90.123.456/0001-08", phone: "(61) 99012-3456", devices: 8 },
  { name: "Ótica Visão Clara", doc: "11.222.333/0001-09", phone: "(62) 91111-2222", devices: 2 },
  { name: "Padaria Grão Fino", doc: "22.333.444/0001-10", phone: "(71) 92222-3333", devices: 3 },
  {
    name: "Pizzaria Forno de Pedra",
    doc: "33.444.555/0001-11",
    phone: "(81) 93333-4444",
    devices: 1,
  },
  {
    name: "Climatiza Refrigeração",
    doc: "44.555.666/0001-12",
    phone: "(85) 94444-5555",
    devices: 2,
  },
];

/* Nome do tenant no breadcrumb: a marca do produto, nunca a empresa real. */
export const TENANT = "AcessoFast";

/* Números do tenant, não da plataforma: online + atendimento + offline = 63. */
export const COUNTS = {
  users: 6,
  devices: 63,
  activeSessions: 1,
  sessions24h: 10,
  clients: 756,
  online: 39,
  inService: 1,
  offline: 23,
};
