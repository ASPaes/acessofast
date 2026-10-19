// Protótipo do AcessoFast Mobile. HTML/CSS/JS puro, sem dependências: bun serve.ts -> http://localhost:5181
// Tudo aqui é de mentira (dados de exemplo). A referência visual é a do desktop (prototipo/).

const MARCADORES = [
  { id: "caixa", nome: "Caixa", cor: "#31c48d" },
  { id: "fin", nome: "Financeiro", cor: "#f5b942" },
  { id: "srv", nome: "Servidor", cor: "#f05252" },
  { id: "rec", nome: "Recepção", cor: "#22d3ee" },
  { id: "mensal", nome: "Contrato mensal", cor: "#a78bfa" },
];

const COMPUTADORES = [
  { id: "418 220 913", nome: "CAIXA-01", cliente: "Padaria Pão Quente", os: "win", on: true, mk: ["caixa", "mensal"], rec: true },
  { id: "418 220 977", nome: "CAIXA-02", cliente: "Padaria Pão Quente", os: "win", on: false, visto: "ontem, 22:14", mk: ["caixa", "mensal"] },
  { id: "731 004 552", nome: "ESCRITORIO", cliente: "Padaria Pão Quente", os: "win", on: true, mk: ["fin", "mensal"], fav: true },
  { id: "905 118 340", nome: "SERVIDOR", cliente: "Clínica Vida", os: "win", on: true, mk: ["srv"], fav: true, rec: true },
  { id: "905 118 602", nome: "RECEPCAO-1", cliente: "Clínica Vida", os: "win", on: true, mk: ["rec"], rec: true },
  { id: "905 119 014", nome: "RECEPCAO-2", cliente: "Clínica Vida", os: "win", on: false, visto: "há 3 dias", mk: ["rec"] },
  { id: "662 410 087", nome: "MacBook da Dra. Ana", cliente: "Clínica Vida", os: "apple", on: true, mk: [] },
  { id: "287 993 120", nome: "FINANCEIRO", cliente: "Escritório Moura", os: "win", on: true, mk: ["fin"], rec: true },
  { id: "287 993 455", nome: "NOTE-JULIANA", cliente: "Escritório Moura", os: "win", on: false, visto: "hoje, 08:02", mk: [] },
];

// CNPJ/CPF do cliente, só dígitos (clients.document), como o desktop lê de v_dispositivo_status.
const DOCUMENTOS = { "Padaria Pão Quente": "12345678000190", "Clínica Vida": "45987321000155", "Escritório Moura": "32165498700" };
COMPUTADORES.push({ id: "514 778 206", nome: "NOTE-TESTE", cliente: "", os: "win", on: false, visto: "há 12 dias", mk: [] });

/** CNPJ (14 dígitos) ou CPF (11) com a pontuação de sempre; igual ao formatarDocumento do desktop. */
function formatarDocumento(doc) {
  const d = (doc || "").replace(/\D/g, "");
  if (d.length === 14) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  if (d.length === 11) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  return doc || "";
}

const MEU_ID = "125 901 167";
// Versão do app (data + commit), a mesma que o agente reporta ao painel. "beta" só no Beta.
const VERSAO = "2026.10.06-e19c2a7";
const ACESSOS = [
  { quem: "Carlos Silva", id: "987 654 321", quando: "hoje, 14:20", dur: "12 min" },
  { quem: "ID 512 377 204", quando: "ontem, 09:41", dur: "4 min" },
  { quem: "Carlos Silva", id: "987 654 321", quando: "27/09, 16:05", dur: "31 min" },
];

const CENARIOS = {
  novo: { nome: "Primeira abertura", desc: "Assistente de permissões", conta: null, perms: false, tab: "celular", ob: 0 },
  cliente: { nome: "Cliente final", desc: "Sem conta: só é acessado", conta: null, perms: true, tab: "celular" },
  plano: { nome: "Técnico com plano", desc: "Acessa sem gastar nada", conta: { modo: "plano", creditos: 0 }, perms: true, tab: "acessar" },
  creditos: { nome: "Técnico com créditos", desc: "Plano gratuito, 12 créditos", conta: { modo: "free", creditos: 12 }, perms: true, tab: "acessar" },
  sem: { nome: "Gratuito sem créditos", desc: "Acesso pelo celular bloqueado", conta: { modo: "free", creditos: 0 }, perms: true, tab: "acessar" },
};

const S = {
  tema: "sistema",
  cen: "cliente",
  tab: "celular",
  ob: null,
  perms: { notif: true, tela: true, controle: true, bateria: false },
  servico: true,
  pwShow: false,
  pw: "k7Rm2q",
  conta: null,
  busca: "",
  filtro: new Set(),
  lista: "empresa",
  ov: null, // folha ou diálogo aberto
  recebida: null, // alguém acessando este celular
  remota: null, // este celular acessando um computador
  land: false,
  cenAberto: false,
  toast: null,
  favs: new Set(COMPUTADORES.filter((c) => c.fav).map((c) => c.id)),
  iniciar: true,
  telaLigada: true,
  dicaGestos: true,
  arquivos: true,
  som: false,
  get perms_controle() { return this.perms.controle; },
  arq: null, // tela de arquivos aberta: { pc, lado, cam: { pc: [], cel: [] }, sel: Set, avulso }
  fila: [],
  msgs: {
    cliente: [{ t: "Oi! Já estou vendo a sua tela. Vou abrir o app do banco, tudo bem?" }, { t: "Pode sim", eu: true }],
    tecnico: [{ t: "Bom dia, o sistema travou na hora de emitir a nota" }, { t: "Bom dia! Já estou conectado, vou olhar agora", eu: true }],
  },
};

// ---------- utilidades ----------
const $ = (s, el = document) => el.querySelector(s);
const ic = (id, cls = "") => `<svg class="i ${cls}"><use href="#${id}"/></svg>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const grupos = (id) => id.split(" ").map((g) => `<span class="g">${g}</span>`).join("");
const iniciais = (n) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
const mk = (id) => MARCADORES.find((m) => m.id === id);
const podeAcessar = () => S.conta && (S.conta.modo === "plano" || S.conta.creditos > 0);
const faltam = () => ["tela", "controle"].filter((k) => !S.perms[k]).length;
let toastT;
function toast(msg) {
  S.toast = msg;
  render();
  clearTimeout(toastT);
  toastT = setTimeout(() => { S.toast = null; render(); }, 2200);
}
function mmss(t0) {
  const s = Math.floor((Date.now() - t0) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function aplicarCenario(k) {
  const c = CENARIOS[k];
  S.cen = k;
  S.conta = c.conta ? { nome: "Carlos Silva", email: "carlos@suporteexemplo.com.br", empresa: "Suporte Exemplo", admin: true, ...c.conta } : null;
  S.perms = c.perms ? { notif: true, tela: true, controle: true, bateria: false } : { notif: false, tela: false, controle: false, bateria: false };
  S.servico = c.perms;
  S.tab = c.tab;
  S.ob = c.ob ?? null;
  S.ov = null;
  S.recebida = null;
  S.arq = null;
  S.fila = [];
  S.remota = null;
  S.land = false;
  S.busca = "";
  S.filtro.clear();
  S.cenAberto = false;
  render();
}

function aplicarTema() {
  const escuro = S.tema === "escuro" || (S.tema === "sistema" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.tema = escuro ? "escuro" : "claro";
}
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { aplicarTema(); });

// ---------- telas ----------
function statusBar() {
  return `<div class="sbar"><span>14:32</span><i class="cam"></i><span class="ic">
    ${S.recebida ? '<i class="rec" title="Tela sendo compartilhada"></i>' : ""}
    ${ic("lan", "s")}${ic("battery", "s")}</span></div>`;
}

function navBar() {
  const b = (t, icone, nome, badge = false) =>
    `<button data-a="tab" data-v="${t}" class="${S.tab === t ? "on" : ""}"><span class="pill-ic">${ic(icone)}${badge ? '<i class="badge"></i>' : ""}</span>${nome}</button>`;
  return `<nav class="nav">
    ${b("acessar", "monitor", "Acessar")}
    ${b("celular", "phone", "Este celular", !!S.recebida || faltam() > 0)}
    ${b("config", "gear", "Ajustes")}
  </nav>`;
}

function faixaRecebida() {
  if (!S.recebida) return "";
  return `<div class="liveband">
    <span class="pill live pulse" style="padding:6px"><i class="dot"></i></span>
    <div class="t"><b>${esc(S.recebida.quem)} está acessando</b><span class="muted">Este celular · <span data-timer>${mmss(S.recebida.t0)}</span></span></div>
    <button class="ibtn" data-a="chat" aria-label="Conversa">${ic("chat")}</button>
    <button class="btn sm danger" data-a="encerrar-recebida">Encerrar</button>
  </div>`;
}

// ---- Este celular ----
function telaCelular() {
  const f = faltam();
  const st = S.recebida
    ? `<span class="pill live pulse"><i class="dot"></i>Sendo acessado</span>`
    : !S.servico
      ? `<span class="pill off"><i class="dot"></i>Desligado</span>`
      : f
        ? `<span class="pill warn"><i class="dot"></i>Falta permissão</span>`
        : `<span class="pill ok"><i class="dot"></i>Pronto para receber acesso</span>`;
  const perm = (k, icone, titulo, okTxt, faltaTxt, opcional = false) => {
    const ok = S.perms[k];
    return `<div class="li">
      <span class="ico ${ok ? "ok" : opcional ? "" : "warn"}">${ic(ok ? "check" : icone)}</span>
      <span class="t"><b>${titulo}</b><span>${ok ? okTxt : faltaTxt}</span></span>
      ${ok ? "" : `<button class="btn sm ${opcional ? "" : "primary"}" data-a="perm" data-v="${k}">Ativar</button>`}
    </div>`;
  };
  return `<div class="scroll">
    <div class="top"><h1>Este celular</h1>${S.conta ? `<span class="avatar" data-a="tab" data-v="config">${iniciais(S.conta.nome)}</span>` : ""}</div>

    <div class="card hero">
      <div class="kv"><span class="lbl">Receber acesso</span><button class="switch ${S.servico ? "on" : ""}" data-a="servico" aria-label="Receber acesso"></button></div>
      <div>${st}</div>
      <div>
        <div class="lbl" style="margin-bottom:6px">ID deste celular</div>
        <div class="kv"><span class="idbig">${grupos(MEU_ID)}</span>
          <span class="btnrow"><button class="ibtn" data-a="copiar" data-v="ID">${ic("copy")}</button></span></div>
      </div>
      <div style="border-top:1px solid var(--line);padding-top:12px;display:flex;gap:10px;align-items:flex-start">
        <span style="color:var(--ok)">${ic("shield")}</span>
        <div><b>Senha automática pelo painel</b>
          <div class="small muted" style="margin-top:2px">Os técnicos da sua empresa entram sem pedir senha. Qualquer outra pessoa só entra se você aprovar na hora.</div></div>
      </div>
    </div>

    ${f && S.servico ? `<div class="card" style="border-color:color-mix(in srgb,var(--warn) 40%,transparent)">
      <div class="kv"><b>${f === 1 ? "Falta liberar 1 permissão" : `Faltam ${f} permissões`}</b>${ic("info")}</div>
      <div class="small muted">Sem isso o técnico não consegue ${!S.perms.tela ? "ver a sua tela" : "tocar na tela por você"}.</div>
      <button class="btn primary" data-a="resolver">Resolver agora</button></div>` : ""}

    <div class="sec"><span class="lbl">Permissões</span></div>
    <div class="list">
      ${perm("tela", "monitor", "Compartilhar a tela", "O técnico pode ver a sua tela", "Sem isso o técnico não vê nada")}
      ${perm("controle", "hand", "Controle pelo técnico", "Ativo em Acessibilidade", "O técnico só consegue olhar")}
      <div class="li"><span class="ico ${S.arquivos ? "ok" : ""}">${ic("folder")}</span><span class="t"><b>Transferir arquivos</b><span>${S.arquivos ? "O técnico pode enviar e receber arquivos" : "Desligado"}</span></span><button class="switch ${S.arquivos ? "on" : ""}" data-a="toggle" data-v="arquivos"></button></div>
      <div class="li"><span class="ico ${S.som ? "ok" : ""}">${ic("sound")}</span><span class="t"><b>Som do celular</b><span>${S.som ? "O técnico ouve o som do celular" : "Desligado"}</span></span><button class="switch ${S.som ? "on" : ""}" data-a="toggle" data-v="som"></button></div>
    </div>

    <div class="card" style="flex-direction:row;gap:12px;align-items:flex-start">
      <span style="color:var(--warn)">${ic("battery")}</span>
      <div class="small muted">Dica: em Configurações › Bateria, deixe o AcessoFast como "Sem restrições". Alguns celulares fecham o app sozinhos e o acesso cai.</div>
    </div>

    <div class="sec"><span class="lbl">Quem acessou este celular</span><span class="small muted">neste aparelho</span></div>
    <div class="list">
      ${ACESSOS.map((a) => `<div class="li"><span class="ico">${ic("user")}</span>
        <span class="t"><b>${esc(a.quem)}</b>${a.id ? `<span class="mono">ID ${a.id}</span>` : ""}</span>
        <span class="small muted" style="text-align:right">${a.quando}<br>${a.dur}</span></div>`).join("")}
    </div>
  </div>`;
}

// ---- Acessar ----
function telaAcessar() {
  const topo = `<div class="top"><div style="flex:1"><h1>Acessar</h1>${S.conta ? `<div class="sub">${esc(S.conta.empresa)}</div>` : ""}</div>
    ${S.conta ? `<span class="avatar" data-a="tab" data-v="config">${iniciais(S.conta.nome)}</span>` : ""}</div>`;

  if (!S.conta) {
    return `<div class="scroll">${topo}
      <div class="card hero" style="align-items:center;text-align:center;padding:28px 20px;gap:14px">
        <div class="ob" style="padding:0;background:none;flex:none"><div class="art" style="margin:0">${ic("monitor")}</div></div>
        <h2 style="margin:0;font-size:20px;font-weight:800">Acesse os computadores da sua empresa</h2>
        <div class="small muted">Entre com a mesma conta do painel. Os computadores, os clientes e os marcadores aparecem aqui do jeito que estão lá.</div>
        <button class="btn primary" style="width:100%" data-a="login">Entrar com a conta do painel</button>
      </div>
      <div class="card" style="flex-direction:row;gap:12px;align-items:flex-start">
        ${ic("info")}<div class="small muted">O acesso pelo celular é para contas com <b style="color:var(--text)">plano</b> ou com <b style="color:var(--text)">créditos</b>.
        Se você só quer receber suporte, não precisa entrar: use a aba <b style="color:var(--text)">Este celular</b>.</div>
      </div>
    </div>`;
  }

  if (!podeAcessar()) {
    return `<div class="scroll">${topo}
      <div class="card hero" style="align-items:center;text-align:center;padding:28px 20px;gap:14px">
        <div class="ob" style="padding:0;background:none;flex:none"><div class="art" style="margin:0;color:var(--warn);border-color:color-mix(in srgb,var(--warn) 35%,transparent);background:color-mix(in srgb,var(--warn) 10%,transparent)">${ic("lock")}</div></div>
        <h2 style="margin:0;font-size:20px;font-weight:800">O acesso pelo celular é para contas com plano ou créditos</h2>
        <div class="small muted">A ${esc(S.conta.empresa)} está no plano gratuito e sem créditos. No computador, os acessos grátis do dia continuam valendo normalmente.</div>
      </div>
      <div class="card" style="gap:10px">
        <b>Como liberar</b>
        <div class="small muted">${S.conta.admin
          ? "Contrate um plano ou compre créditos no painel, em <b style=\"color:var(--text)\">Financeiro</b>. Assim que o pagamento cair, o acesso libera aqui sozinho."
          : "Peça ao administrador da sua empresa para contratar um plano ou comprar créditos no painel."}</div>
        <button class="btn" data-a="atualizar">${ic("refresh", "s")}Já liberei, verificar de novo</button>
      </div>
      <div class="sec"><span class="lbl">Seus computadores</span><span class="small muted">${COMPUTADORES.length}</span></div>
      <div class="list" style="opacity:.5;pointer-events:none">${COMPUTADORES.slice(0, 3).map(linhaPc).join("")}</div>
    </div>`;
  }

  const q = S.busca.trim().toLowerCase();
  const soDigitos = q.replace(/\D/g, "");
  let lista = COMPUTADORES.filter((c) =>
    (S.lista !== "favoritos" || S.favs.has(c.id)) &&
    (S.lista !== "recentes" || c.rec) &&
    (!S.filtro.size || c.mk.some((m) => S.filtro.has(m))) &&
    (!q || c.nome.toLowerCase().includes(q) || c.cliente.toLowerCase().includes(q) || (soDigitos && c.id.replace(/\s/g, "").includes(soDigitos)) ||
      (soDigitos.length >= 3 && (DOCUMENTOS[c.cliente] || "").includes(soDigitos))),
  );
  const porCliente = {};
  lista.forEach((c) => (porCliente[c.cliente] ??= []).push(c));
  // "Sem cliente vinculado" por último, como um grupo à parte.
  if (porCliente[""]) { const sem = porCliente[""]; delete porCliente[""]; porCliente[""] = sem; }
  const idDigitado = soDigitos.length === 9 && !COMPUTADORES.some((c) => c.id.replace(/\s/g, "") === soDigitos);

  const saldo = S.conta.modo === "plano"
    ? `<span class="pill ok"><i class="dot"></i>Plano ativo · acessos sem custo</span>`
    : `<div class="card" style="flex-direction:row;align-items:center;gap:12px;padding:12px 14px">
        <span class="li" style="padding:0;width:auto"><span class="ico" style="color:var(--warn)">${ic("coin")}</span></span>
        <div style="flex:1"><b>${S.conta.creditos} ${S.conta.creditos === 1 ? "crédito" : "créditos"}</b><div class="small muted">Cada acesso pelo celular usa 1, sem limite de tempo</div></div>
      </div>`;

  return `<div class="scroll">${topo}
    ${saldo}
    <label class="search">${ic("search")}<input id="busca" placeholder="Buscar por nome, ID, cliente ou CNPJ" value="${esc(S.busca)}" inputmode="search" autocomplete="off">
      ${S.busca ? `<button data-a="limpar">${ic("x", "s")}</button>` : ""}</label>
    <div class="chips">
      ${MARCADORES.map((m) => `<button class="chip ${S.filtro.has(m.id) ? "on" : ""}" data-a="filtro" data-v="${m.id}"><i style="background:${m.cor}"></i>${m.nome}</button>`).join("")}
    </div>
    <div class="seg">
      ${[["empresa", "Todos"], ["recentes", "Recentes"], ["favoritos", "Favoritos"]].map(([k, n]) => `<button class="${S.lista === k ? "on" : ""}" data-a="lista" data-v="${k}">${n}</button>`).join("")}
    </div>
    ${idDigitado ? `<div class="list"><button class="li" data-a="conectar-id" data-v="${soDigitos}">
        <span class="ico" style="color:var(--accent-text)">${ic("arrow")}</span>
        <span class="t"><b>Conectar ao ID ${soDigitos.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}</b><span>Computador fora da lista da empresa</span></span>${ic("chevr", "s chev")}</button></div>` : ""}
    ${Object.keys(porCliente).length ? Object.entries(porCliente).map(([cli, cs]) => `
      <div class="cli">
        <span class="cli-ic">${ic("building", "s")}</span>
        <span class="t"><b class="${cli ? "" : "sem"}">${cli ? esc(cli) : "Sem cliente vinculado"}</b>${DOCUMENTOS[cli] ? `<span class="mono">${formatarDocumento(DOCUMENTOS[cli])}</span>` : ""}</span>
        <span class="small muted">${cs.filter((c) => c.on).length} de ${cs.length} ligados</span>
      </div>
      <div class="list">${cs.map(linhaPc).join("")}</div>`).join("")
      : idDigitado ? "" : `<div class="card" style="align-items:center;text-align:center"><b>Nada encontrado</b><div class="small muted">${S.lista === "favoritos" ? "Marque a estrela de um computador para ele aparecer aqui." : "Tente outro nome, ID ou marcador."}</div></div>`}
  </div>`;
}

function linhaPc(c) {
  return `<button class="li" data-a="pc" data-v="${c.id}">
    <span class="ico">${ic(c.os)}<i class="st ${c.on ? "on" : ""}"></i></span>
    <span class="t"><b>${esc(c.nome)}</b><span><span class="mono">${c.id}</span>${c.on ? "" : ` · desligado ${c.visto}`}</span></span>
    <span class="mk">${c.mk.map((m) => `<i style="background:${mk(m).cor}"></i>`).join("")}</span>
    ${S.favs.has(c.id) ? `<span style="color:var(--warn)">${ic("star", "s")}</span>` : ""}
  </button>`;
}

// ---- Ajustes ----
function telaConfig() {
  const sw = (k, titulo, sub) => `<div class="li"><span class="t"><b>${titulo}</b><span>${sub}</span></span><button class="switch ${S[k] ? "on" : ""}" data-a="toggle" data-v="${k}"></button></div>`;
  const conta = S.conta
    ? `<div class="list">
        <div class="li"><span class="avatar">${iniciais(S.conta.nome)}</span><span class="t"><b>${esc(S.conta.nome)}</b><span>${esc(S.conta.email)}</span></span></div>
        <div class="li"><span class="ico">${ic("building")}</span><span class="t"><b>${esc(S.conta.empresa)}</b><span>${S.conta.modo === "plano" ? "Plano ativo" : `Plano gratuito · ${S.conta.creditos} créditos`}</span></span></div>
        <button class="li" data-a="sair" style="color:var(--danger-text)"><span class="ico" style="color:var(--danger-text)">${ic("logout")}</span><span class="t"><b>Sair da conta</b><span>Este celular continua podendo ser acessado</span></span></button>
      </div>`
    : `<div class="list"><button class="li" data-a="login"><span class="ico">${ic("user")}</span><span class="t"><b>Entrar com a conta do painel</b><span>Para acessar os computadores da sua empresa</span></span>${ic("chevr", "s chev")}</button></div>`;
  return `<div class="scroll">
    <div class="top"><h1>Ajustes</h1></div>
    <div class="sec"><span class="lbl">Conta</span></div>${conta}
    <div class="sec"><span class="lbl">Aparência</span></div>
    <div class="seg">${[["sistema", "Igual ao celular"], ["claro", "Claro"], ["escuro", "Escuro"]].map(([k, n]) => `<button class="${S.tema === k ? "on" : ""}" data-a="tema" data-v="${k}">${n}</button>`).join("")}</div>
    <div class="sec"><span class="lbl">Este celular</span></div>
    <div class="list">
      ${sw("iniciar", "Iniciar junto com o celular", "Fica pronto depois de reiniciar")}
      ${sw("telaLigada", "Manter a tela ligada no acesso", "A tela não apaga enquanto o técnico trabalha")}
      <button class="li" data-a="refazer"><span class="t"><b>Revisar permissões</b><span>Abre de novo o passo a passo</span></span>${ic("chevr", "s chev")}</button>
      <button class="li" data-a="toast" data-v="Abre a tela completa de configurações"><span class="t"><b>Configurações avançadas</b><span>Todas as opções, na tela completa</span></span>${ic("chevr", "s chev")}</button>
    </div>
    <div class="sec"><span class="lbl">Sobre</span></div>
    <div class="list">
      <div class="li"><span class="logo"></span><span class="t"><b>AcessoFast</b><span class="mono">versão ${VERSAO}</span></span></div>
      <button class="li" data-a="link"><span class="t"><b>Política de privacidade</b></span>${ic("ext", "s chev")}</button>
      <button class="li" data-a="link"><span class="t"><b>Excluir meus dados</b></span>${ic("ext", "s chev")}</button>
      <button class="li" data-a="link"><span class="t"><b>Falar com o suporte</b><span>suporte@acessofast.com.br</span></span>${ic("ext", "s chev")}</button>
    </div>
  </div>`;
}

// ---- Assistente de primeira abertura ----
const PASSOS = [
  null,
  { k: "notif", icone: "bell", titulo: "Avisar quando alguém conectar", texto: "Enquanto um técnico estiver conectado, aparece um aviso fixo no topo do celular. Assim você sempre sabe que tem alguém ali." },
  { k: "tela", icone: "monitor", titulo: "Deixar o técnico ver a tela", texto: 'O Android vai pedir uma confirmação. Toque em "Iniciar agora". Isso só é usado quando você está sendo atendido.' },
  { k: "controle", icone: "hand", titulo: "Deixar o técnico tocar na tela", texto: "Sem isto o técnico só consegue olhar. Com isto ele toca, desliza e digita por você, sem precisar te pedir passo a passo." },
];

function telaAssistente() {
  const n = S.ob;
  if (n === 0) {
    return `<div class="ob">
      <div class="grow"></div>
      <span class="logo lg" style="align-self:center"></span>
      <h1 style="text-align:center">Bem-vindo ao AcessoFast</h1>
      <p style="text-align:center">Receba suporte no seu celular. Se você é técnico, acesse daqui os computadores da sua empresa.</p>
      <div class="card why" style="margin-top:6px">
        <div>${ic("check", "s")}Só os técnicos da sua empresa, ou quem você aprovar na hora, conseguem conectar.</div>
        <div>${ic("check", "s")}Você vê o tempo todo quando alguém está conectado.</div>
        <div>${ic("check", "s")}Você encerra o acesso quando quiser, com um toque.</div>
      </div>
      <div class="grow"></div>
      <button class="btn primary" style="flex:none" data-a="ob-next">Começar</button>
    </div>`;
  }
  if (n === 4) {
    const ok = !faltam();
    return `<div class="ob">
      <div class="prog"><i class="on"></i><i class="on"></i><i class="on"></i></div>
      <div class="art" style="${ok ? "color:var(--ok)" : ""}">${ic(ok ? "check" : "info")}</div>
      <h1 style="text-align:center">${ok ? "Tudo pronto" : "Quase pronto"}</h1>
      <p style="text-align:center">${ok ? "Quando precisar de suporte, passe este ID ao técnico." : "Dá para receber acesso, mas falta liberar uma permissão. Você resolve depois na aba Este celular."}</p>
      <div class="card" style="align-items:center;gap:6px"><span class="lbl">ID deste celular</span><span class="idbig">${grupos(MEU_ID)}</span></div>
      <div class="card" style="flex-direction:row;gap:12px;align-items:flex-start">
        <span style="color:var(--warn)">${ic("battery")}</span>
        <div class="small"><b>Dica:</b> <span class="muted">em Configurações › Bateria, deixe o AcessoFast como "Sem restrições". Alguns celulares fecham o app sozinhos e o acesso cai.</span></div>
      </div>
      <div class="grow"></div>
      <button class="btn primary" style="flex:none" data-a="ob-fim">Ir para o app</button>
    </div>`;
  }
  const p = PASSOS[n];
  return `<div class="ob">
    <div class="prog">${[1, 2, 3].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>
    <div class="small muted" style="font-weight:700">Passo ${n} de 3</div>
    <div class="art">${ic(p.icone)}</div>
    <h1>${p.titulo}</h1>
    <p>${p.texto}</p>
    <div class="grow"></div>
    <button class="btn primary" style="flex:none" data-a="perm" data-v="${p.k}">${S.perms[p.k] ? "Continuar" : "Permitir"}</button>
    <button class="btn ghost" style="flex:none" data-a="ob-pular">Agora não</button>
  </div>`;
}

// ---- Sessão remota: o celular acessando um computador ----
function telaRemota() {
  const r = S.remota;
  const c = r.pc;
  return `<div class="remote">
    <div class="rhead">
      <button data-a="sair-remota" style="color:#d6deeb">${ic("arrowl")}</button>
      <b>${esc(c.nome)} <span class="q">· ${c.id}</span></b>
      <span class="q">${r.credito ? "1 crédito · " : ""}<span data-timer>${mmss(r.t0)}</span></span>
      <button data-a="girar" style="color:#d6deeb" aria-label="Girar">${ic("rotate")}</button>
    </div>
    <div class="rview">
      <div class="pc"><div class="w"><i style="top:18%;width:40%"></i><i style="top:30%;width:70%"></i><i style="top:38%;width:62%"></i><i style="top:46%;width:66%"></i></div>
        <div class="tb"><i></i><i></i><i></i><i></i><i></i></div>
        ${r.modo === "ponteiro" ? `<svg class="cur"><use href="#pointer"/></svg>` : ""}</div>
      ${S.dicaGestos ? `<div class="hint"><div style="display:flex;flex-direction:column;gap:14px;align-items:center">
          <b style="font-size:16px">Como controlar o computador</b>
          <div class="box">
            <div>${ic("hand")}<b>Toque</b>Clique onde tocar</div>
            <div>${ic("hand")}<b>Toque e segure</b>Botão direito</div>
            <div>${ic("rows")}<b>Dois dedos</b>Rolar a página</div>
            <div>${ic("full")}<b>Pinça</b>Aproximar a tela</div>
            <div class="full">${ic("pointer")}<b>Modo ponteiro</b>Prefere uma setinha, como num notebook? Toque em "Toque" na barra de baixo para trocar.</div>
          </div>
          <button class="btn primary" style="width:200px;flex:none" data-a="dica-ok">Entendi</button></div></div>` : ""}
      <div class="rbar">
        <button class="${r.kbd ? "on" : ""}" data-a="r-kbd">${ic("kbd")}Teclado</button>
        <button data-a="r-modo">${ic(r.modo === "toque" ? "hand" : "pointer")}${r.modo === "toque" ? "Toque" : "Ponteiro"}</button>
        <button data-a="r-mon">${ic("monitor")}Tela ${r.mon}/2</button>
        <button data-a="r-mais">${ic("more")}Mais</button>
        <button class="end" data-a="sair-remota">${ic("power")}Sair</button>
      </div>
      ${r.kbd ? `<div class="kbd">
        <div class="fx">${["Ctrl", "Alt", "Win", "Shift", "Esc", "Tab", "Del", "F5", "←", "↑", "↓", "→"].map((k) => `<button>${k}</button>`).join("")}<button data-a="r-kbd">Fechar</button></div>
        ${["qwertyuiop", "asdfghjkl", "zxcvbnm"].map((l) => `<div class="row">${[...l].map((k) => `<i>${k}</i>`).join("")}</div>`).join("")}
      </div>` : ""}
    </div>
  </div>`;
}

// ---- Arquivos: o celular do técnico trocando arquivos com um computador ----
// Pasta = objeto; arquivo = [tamanho, data].
const DISCOS = {
  pc: { "Área de Trabalho": { "Relatório de vendas setembro.xlsx": ["84 KB", "30/09"], "NFe pendentes.pdf": ["1,2 MB", "29/09"], "atalho sistema.lnk": ["2 KB", "12/08"] },
    "Documentos": { "Contratos": { "Contrato fornecedor.pdf": ["640 KB", "14/09"] }, "Backup": { "backup_2026-09-30.zip": ["212 MB", "30/09"] }, "orcamento.docx": ["38 KB", "22/09"] },
    "Downloads": { "instalador-impressora.exe": ["18 MB", "28/09"], "boleto.pdf": ["90 KB", "01/10"] } },
  cel: { "Download": { "foto-erro.jpg": ["2,4 MB", "hoje"], "certificado.pfx": ["6 KB", "ontem"] }, "DCIM": { "Camera": { "IMG_2031.jpg": ["3,1 MB", "hoje"], "IMG_2030.jpg": ["2,9 MB", "hoje"] } },
    "Documents": { "checklist-visita.pdf": ["210 KB", "27/09"] } },
};
const RAIZ = { pc: "Este computador", cel: "Este celular" };

function pasta(lado) {
  let p = DISCOS[lado];
  for (const n of S.arq.cam[lado]) p = p[n];
  return p;
}

function telaArquivos() {
  const a = S.arq;
  const lado = a.lado;
  const itens = Object.entries(pasta(lado)).sort(([, x], [, y]) => Array.isArray(x) - Array.isArray(y));
  const cam = [RAIZ[lado], ...a.cam[lado]];
  const sel = a.sel.size;
  const pendentes = S.fila.filter((f) => f.p < 100).length;
  return `<div class="files">
    <div class="fhead">
      <button class="ibtn" data-a="arq-fechar" aria-label="Fechar">${ic("arrowl")}</button>
      <div style="flex:1;min-width:0"><b>Arquivos</b><div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.pc.nome)} · <span class="mono">${a.pc.id}</span></div></div>
      <button class="ibtn" data-a="fila" aria-label="Transferências" style="position:relative">${ic("swap")}${pendentes ? `<i class="cnt">${pendentes}</i>` : ""}</button>
    </div>
    <div style="padding:0 18px 10px" class="fsticky">
      <div class="seg">
        <button class="${lado === "pc" ? "on" : ""}" data-a="arq-lado" data-v="pc">${ic("monitor", "s")} Computador</button>
        <button class="${lado === "cel" ? "on" : ""}" data-a="arq-lado" data-v="cel">${ic("phone", "s")} Este celular</button>
      </div>
      <div class="crumbs">${cam.map((n, i) => `${i ? ic("chevr", "s") : ""}<button data-a="arq-ir" data-v="${i}" class="${i === cam.length - 1 ? "on" : ""}">${esc(n)}</button>`).join("")}</div>
    </div>
    <div class="scroll" style="padding-top:0">
      <div class="list">
        ${a.cam[lado].length ? `<button class="li" data-a="arq-ir" data-v="${cam.length - 2}"><span class="ico">${ic("up")}</span><span class="t"><b>Voltar</b><span>${esc(cam[cam.length - 2])}</span></span></button>` : ""}
        ${itens.map(([n, v]) => {
          const dir = !Array.isArray(v);
          const on = a.sel.has(n);
          return `<button class="li ${on ? "sel" : ""}" data-a="${dir ? "arq-abrir" : "arq-sel"}" data-v="${esc(n)}">
            <span class="ico" style="${dir ? "color:var(--accent-text)" : ""}">${ic(dir ? "folder" : "file")}</span>
            <span class="t"><b>${esc(n)}</b><span>${dir ? `${Object.keys(v).length} ${Object.keys(v).length === 1 ? "item" : "itens"}` : `${v[0]} · ${v[1]}`}</span></span>
            ${dir ? ic("chevr", "s chev") : `<i class="ck ${on ? "on" : ""}">${on ? ic("check", "s") : ""}</i>`}
          </button>`;
        }).join("") || `<div class="li"><span class="t"><span>Pasta vazia</span></span></div>`}
      </div>
      <div class="small muted" style="text-align:center">Toque nos arquivos para escolher. ${lado === "pc" ? "O que você baixar vai para a pasta Download do celular." : "O que você enviar vai para a pasta aberta no computador."}</div>
    </div>
    ${sel ? `<div class="fbar">
      <div style="flex:1"><b>${sel} ${sel === 1 ? "arquivo" : "arquivos"}</b><div class="small muted">${lado === "pc" ? "para este celular" : `para ${esc([RAIZ.pc, ...a.cam.pc].slice(-1)[0])}`}</div></div>
      <button class="btn sm" data-a="arq-limpar">Cancelar</button>
      <button class="btn sm primary" data-a="arq-enviar">${ic(lado === "pc" ? "download" : "upload", "s")}${lado === "pc" ? "Baixar" : "Enviar"}</button>
    </div>` : ""}
  </div>`;
}

// ---- Folhas e diálogos ----
function overlay() {
  const o = S.ov;
  if (!o) return "";
  if (o.t === "pc") {
    const c = COMPUTADORES.find((x) => x.id === o.id);
    const credito = S.conta.modo !== "plano";
    return `<div class="ov" data-a="fechar"><div class="sheet" data-stop>
      <i class="grab"></i>
      <div class="kv" style="align-items:flex-start">
        <div class="li" style="padding:0">
          <span class="ico">${ic(c.os)}<i class="st ${c.on ? "on" : ""}"></i></span>
          <span class="t"><b style="font-size:17px">${esc(c.nome)}</b><span class="mono">${c.id}</span></span>
        </div>
        <button class="ibtn" data-a="fav" data-v="${c.id}" style="${S.favs.has(c.id) ? "color:var(--warn)" : ""}">${ic("star")}</button>
      </div>
      <div class="cli card" style="padding:10px 12px;margin:0">
        <span class="cli-ic">${ic("building", "s")}</span>
        <span class="t"><b class="${c.cliente ? "" : "sem"}">${c.cliente ? esc(c.cliente) : "Sem cliente vinculado"}</b>${DOCUMENTOS[c.cliente] ? `<span class="mono">${formatarDocumento(DOCUMENTOS[c.cliente])}</span>` : ""}</span>
      </div>
      <div class="card" style="padding:12px 14px;gap:8px">
        <div class="kv"><span class="small muted">Situação</span>${c.on ? `<span class="pill ok"><i class="dot"></i>Ligado</span>` : `<span class="pill off"><i class="dot"></i>Desligado ${c.visto}</span>`}</div>
        <div class="kv" style="align-items:flex-start"><span class="small muted">Marcadores</span>
          <span style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">${c.mk.map((m) => `<span class="chip" style="height:26px"><i style="background:${mk(m).cor}"></i>${mk(m).nome}</span>`).join("") || '<span class="small muted">nenhum</span>'}</span></div>
      </div>
      ${credito ? `<div class="small muted" style="display:flex;gap:8px;align-items:center">${ic("coin", "s")}Este acesso usa 1 crédito. Você tem ${S.conta.creditos}.</div>` : ""}
      <button class="btn primary" style="flex:none" data-a="conectar" data-v="${c.id}" ${c.on ? "" : "disabled"}>${ic("arrow")}${c.on ? `Conectar${credito ? " · 1 crédito" : ""}` : "Computador desligado"}</button>
      <button class="btn" style="flex:none" data-a="arquivos" data-v="${c.id}" ${c.on ? "" : "disabled"}>${ic("folder")}Só arquivos${credito ? " · 1 crédito" : ""}</button>
    </div></div>`;
  }
  if (o.t === "login") {
    return `<div class="ov" data-a="fechar"><div class="sheet" data-stop>
      <i class="grab"></i>
      <h2>Entrar com a conta do painel</h2>
      <div class="small muted">O mesmo e-mail e senha que você usa no painel do AcessoFast.</div>
      <label class="search">${ic("user")}<input placeholder="E-mail" value="carlos@suporteexemplo.com.br"></label>
      <label class="search">${ic("lock")}<input type="password" placeholder="Senha" value="segredo123"></label>
      <button class="btn primary" style="flex:none" data-a="entrar">Entrar</button>
      <button class="btn ghost" style="flex:none" data-a="toast" data-v="Abre a recuperação de senha do painel">Esqueci a senha</button>
    </div></div>`;
  }
  if (o.t === "conectando") {
    return `<div class="ov center"><div class="dlg" style="align-items:center;text-align:center">
      <span class="pill live pulse"><i class="dot"></i>Conectando</span>
      <h2>${esc(o.nome)}</h2><div class="small muted">Buscando o computador pela internet…</div>
      <button class="btn" style="width:100%;flex:none" data-a="fechar">Cancelar</button></div></div>`;
  }
  if (o.t === "mais") {
    const it = (icone, nome, v) => `<button class="li" data-a="toast" data-v="${v}"><span class="ico">${ic(icone)}</span><span class="t"><b>${nome}</b></span></button>`;
    return `<div class="ov" data-a="fechar" style="z-index:50"><div class="sheet" data-stop>
      <i class="grab"></i><h2>Mais opções</h2>
      <div class="list">
        ${it("kbd", "Ctrl + Alt + Del", "Enviado Ctrl+Alt+Del")}
        ${it("lock", "Bloquear o computador", "Computador bloqueado")}
        ${it("refresh", "Reiniciar o computador", "Pede confirmação antes")}
        <button class="li" data-a="arquivos" data-v="${S.remota.pc.id}"><span class="ico">${ic("folder")}</span><span class="t"><b>Arquivos</b><span>Sem gastar outro crédito</span></span></button>
        <button class="li" data-a="chat"><span class="ico">${ic("chat")}</span><span class="t"><b>Conversa</b><span>Fala com quem está no computador</span></span></button>
        ${it("soundoff", "Desligar o som do computador", "Som do remoto desligado")}
        ${it("sliders", "Qualidade da imagem", "Automática / Melhor imagem / Mais rápida")}
      </div>
    </div></div>`;
  }
  if (o.t === "consent") {
    return `<div class="ov center"><div class="dlg">
      <h2>Permitir o controle pelo técnico?</h2>
      <div class="small" style="color:var(--text-2)">O AcessoFast usa o serviço de Acessibilidade do Android para que o técnico que está te atendendo possa tocar, deslizar e digitar na tela do seu celular por você.</div>
      <b class="small">Como esse acesso é usado:</b>
      <ul class="small" style="color:var(--text-2)">
        <li>Só age durante um atendimento, quando um técnico autorizado está conectado com a senha deste aparelho.</li>
        <li>Serve apenas para executar na tela os toques e o texto que o técnico enviar. O AcessoFast não usa esse acesso para coletar, guardar ou enviar dados seus.</li>
        <li>Você pode desligar quando quiser, em Configurações › Acessibilidade › AcessoFast Input.</li>
      </ul>
      <div class="small muted">Ao tocar em "Concordo", abriremos as configurações de Acessibilidade para você ativar "AcessoFast Input".</div>
      <div class="btnrow"><button class="btn" data-a="fechar">Agora não</button><button class="btn primary" data-a="consent-ok">Concordo</button></div>
      <div class="small muted" style="text-align:center;font-size:11px">Texto já aprovado pela Play — mudou só o visual.</div>
    </div></div>`;
  }
  if (o.t === "sys") {
    const d = {
      notif: ["Permitir que o AcessoFast envie notificações?", "", "Não permitir", "Permitir"],
      tela: ["Iniciar gravação ou transmissão com o AcessoFast?", "O AcessoFast terá acesso a todas as informações visíveis na tela ou reproduzidas no dispositivo durante a gravação ou transmissão.", "Cancelar", "Iniciar agora"],
      controle: ["AcessoFast Input", "Usar AcessoFast Input", "Voltar", "Ativar"],
      bateria: ["Permitir que o app sempre seja executado em segundo plano?", "Permitir que o AcessoFast seja sempre executado em segundo plano pode reduzir a duração da bateria.", "Negar", "Permitir"],
    }[o.k];
    return `<div class="ov center"><div style="width:100%"><div class="sys-tag">Tela do Android, não é nossa</div><div class="sys">
      <h3>${d[0]}</h3>${d[1] ? `<p>${d[1]}</p>` : ""}
      <div class="acts"><button data-a="fechar">${d[2]}</button><button data-a="sys-ok" data-v="${o.k}">${d[3]}</button></div>
    </div></div></div>`;
  }
  if (o.t === "pedido") {
    const sw = (k, n) => `<div style="display:flex;gap:10px;align-items:center;padding:4px 0;color:${S[k] ? "var(--text)" : "var(--muted)"}"><span style="color:${S[k] ? "var(--ok)" : "var(--muted)"}">${ic(S[k] ? "check" : "x", "s")}</span>${n}</div>`;
    return `<div class="ov center"><div class="dlg" style="gap:14px">
      <div style="display:flex;gap:12px;align-items:center"><span class="avatar" style="width:48px;height:48px;font-size:16px">CS</span>
        <div><span class="lbl">Pedido de acesso</span><h2 style="margin-top:2px">Carlos Silva</h2><div class="small muted mono">ID 987 654 321</div></div></div>
      <div class="small" style="color:var(--text-2)">Quer acessar este celular. Só permita se você estiver esperando esse atendimento.</div>
      <div class="card" style="padding:10px 14px;gap:2px">${sw("perms_controle", "Tocar na tela")}${sw("arquivos", "Enviar e receber arquivos")}${sw("som", "Ouvir o som do celular")}</div>
      <div class="small muted">Dá para mudar isso em Este celular › Permissões.</div>
      <div class="btnrow"><button class="btn danger" data-a="recusar">Recusar</button><button class="btn primary" data-a="permitir">Permitir</button></div>
    </div></div>`;
  }
  if (o.t === "chat") {
    // Mesma conversa dos dois lados: o cliente fala com o técnico, o técnico fala com quem está no computador.
    const tec = !!S.remota;
    const msgs = S.msgs[tec ? "tecnico" : "cliente"];
    return `<div class="ov" data-a="fechar" style="z-index:50"><div class="sheet" data-stop style="min-height:62%">
      <i class="grab"></i>
      <div><h2>Conversa</h2><div class="small muted">${tec ? `Com quem está no ${esc(S.remota.pc.nome)}. Aparece numa janelinha na tela do computador.` : `Com ${esc(S.recebida?.quem ?? "o técnico")}, que está acessando este celular.`}</div></div>
      <div id="msgs" style="flex:1;display:flex;flex-direction:column;gap:8px;overflow-y:auto;min-height:160px">
        ${msgs.map((m) => m.eu
          ? `<div class="card" style="padding:10px 12px;align-self:flex-end;max-width:80%;background:var(--primary);color:#fff;border:0;border-radius:16px 16px 4px 16px">${esc(m.t)}</div>`
          : `<div class="card" style="padding:10px 12px;align-self:flex-start;max-width:80%;border-radius:16px 16px 16px 4px">${esc(m.t)}</div>`).join("")}
      </div>
      <form class="search" data-form="msg"><input id="msg" placeholder="Escreva uma mensagem" autocomplete="off"><button type="submit" style="color:var(--accent-text)">${ic("send")}</button></form>
    </div></div>`;
  }
  if (o.t === "atualizado") {
    const itens = o.primeira
      ? ["Visual novo, com tema claro e escuro.", "Os computadores da empresa aparecem em Acessar: entre com a conta do painel.",
         "Cliente, CNPJ e marcadores em cada computador, com busca por nome, ID, cliente ou CNPJ.", "Arquivos e conversa direto do celular."]
      : ["Computadores da empresa: o cliente e o CNPJ/CPF aparecem em destaque.", "A busca também encontra pelo CNPJ ou CPF do cliente."];
    return `<div class="ov center"><div class="dlg">
      <h2>${o.primeira ? "Bem-vindo ao novo AcessoFast" : "O AcessoFast foi atualizado"}</h2>
      <div class="small" style="color:var(--text-2)">${o.primeira ? "O AcessoFast deste celular ganhou um visual novo. O ID continua o mesmo." : `Versão ${VERSAO}. O que mudou:`}</div>
      <div style="display:flex;flex-direction:column;gap:8px">${itens.map((i) => `<div style="display:flex;gap:9px;font-size:13px;color:var(--text-2);line-height:1.4"><span style="color:var(--ok)">${ic("check", "s")}</span>${i}</div>`).join("")}</div>
      ${o.primeira ? `<div class="small muted mono" style="font-size:11px">versão ${VERSAO}</div>` : ""}
      <button class="btn primary" data-a="fechar">Entendi</button>
    </div></div>`;
  }
  if (o.t === "fila") {
    return `<div class="ov" data-a="fechar" style="z-index:50"><div class="sheet" data-stop>
      <i class="grab"></i><h2>Transferências</h2>
      <div class="list">${S.fila.map((f) => `<div class="li"><span class="ico ${f.p >= 100 ? "ok" : ""}">${ic(f.p >= 100 ? "check" : f.dir === "baixar" ? "download" : "upload")}</span>
        <span class="t"><b>${esc(f.nome)}</b><span>${f.p >= 100 ? (f.dir === "baixar" ? "Salvo em Download" : `Enviado para ${esc(f.destino)}`) : `${f.p}% · ${f.tam}`}</span>
        ${f.p < 100 ? `<i class="bar"><i style="width:${f.p}%"></i></i>` : ""}</span></div>`).join("") || `<div class="li"><span class="t"><span>Nada na fila.</span></span></div>`}</div>
      ${S.fila.some((f) => f.p >= 100) ? `<button class="btn" data-a="fila-limpar">Limpar concluídas</button>` : ""}
    </div></div>`;
  }
  return "";
}

// ---------- montagem ----------
function telaApp() {
  if (S.ob !== null) return statusBar() + `<div class="screen">${telaAssistente()}${overlay()}</div><div class="gbar"><i></i></div>`;
  const corpo = S.tab === "acessar" ? telaAcessar() : S.tab === "celular" ? telaCelular() : telaConfig();
  return statusBar() + `<div class="screen">
      ${corpo}
      ${S.remota ? telaRemota() : ""}
      ${S.arq ? telaArquivos() : ""}
      ${overlay()}
      ${S.toast ? `<div class="toast">${esc(S.toast)}</div>` : ""}
    </div>
    ${S.remota || S.arq ? "" : faixaRecebida() + navBar()}
    <div class="gbar"><i></i></div>`;
}

function painelCenarios() {
  return `<aside class="cenarios ${S.cenAberto ? "aberto" : ""}">
    <h3><span class="logo"></span>Protótipo do app no celular</h3>
    <p>Rodada 1. Tudo é de exemplo. Escolha uma situação para ver como o app fica para cada pessoa.</p>
    <span class="lbl">Quem está usando</span>
    ${Object.entries(CENARIOS).map(([k, c]) => `<button class="cen ${S.cen === k ? "on" : ""}" data-a="cen" data-v="${k}">${c.nome}<small>${c.desc}</small></button>`).join("")}
    <span class="lbl">Simular</span>
    <button class="cen" data-a="sim-pedido">Técnico pedindo acesso<small>Chega no celular do cliente</small></button>
    <button class="cen" data-a="sim-recebida">Atendimento em andamento<small>Faixa fixa e aviso do Android</small></button>
    <button class="cen" data-a="sim-atualizado" data-v="1">Primeira vez no app novo<small>Depois da atualização pela loja</small></button>
    <button class="cen" data-a="sim-atualizado">App atualizado<small>Uma vez por versão</small></button>
    <span class="lbl">Tema</span>
    <div class="seg">${[["sistema", "Auto"], ["claro", "Claro"], ["escuro", "Escuro"]].map(([k, n]) => `<button class="${S.tema === k ? "on" : ""}" data-a="tema" data-v="${k}">${n}</button>`).join("")}</div>
  </aside><button class="fab-cen" data-a="cen-abrir">${ic("sliders", "s")}</button>`;
}

function render() {
  const foco = document.activeElement?.id;
  const pos = foco ? document.activeElement.selectionStart : null;
  aplicarTema();
  $("#app").innerHTML = `<div class="stage"><div class="phone ${S.land ? "land" : ""}">${telaApp()}</div>${painelCenarios()}</div>`;
  if (foco) {
    const el = document.getElementById(foco);
    if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch {} }
  }
}

// ---------- ações ----------
function conectar(pc) {
  S.ov = { t: "conectando", nome: pc.nome };
  render();
  setTimeout(() => {
    if (S.ov?.t !== "conectando") return;
    const credito = S.conta.modo !== "plano";
    if (credito) S.conta.creditos--;
    S.ov = null;
    S.remota = { pc, t0: Date.now(), modo: "toque", mon: 1, kbd: false, credito };
    render();
  }, 1100);
}

const ACOES = {
  cen: (v) => aplicarCenario(v),
  "cen-abrir": () => { S.cenAberto = !S.cenAberto; render(); },
  tab: (v) => { S.tab = v; render(); },
  tema: (v) => { S.tema = v; render(); },
  servico: () => {
    if (!S.servico && !S.perms.tela) { S.ov = { t: "sys", k: "tela" }; render(); return; }
    S.servico = !S.servico;
    if (!S.servico) S.recebida = null;
    render();
  },
  pwshow: () => { S.pwShow = !S.pwShow; render(); },
  pwnova: () => { S.pw = Math.random().toString(36).slice(2, 8); S.pwShow = true; toast("Senha nova gerada"); },
  copiar: (v) => toast(`${v} copiado`),
  compartilhar: () => toast("Abre o compartilhar do Android (WhatsApp, e-mail…)"),
  perm: (k) => {
    if (S.perms[k] && S.ob !== null) { S.ob++; render(); return; }
    S.ov = k === "controle" ? { t: "consent" } : { t: "sys", k };
    render();
  },
  "consent-ok": () => { S.ov = { t: "sys", k: "controle" }; render(); },
  "sys-ok": (k) => {
    S.perms[k] = true;
    if (k === "tela") S.servico = true;
    S.ov = null;
    if (S.ob !== null) S.ob++;
    render();
  },
  resolver: () => { S.ob = !S.perms.notif ? 1 : !S.perms.tela ? 2 : 3; render(); },
  refazer: () => { S.ob = 1; render(); },
  "ob-next": () => { S.ob++; render(); },
  "ob-pular": () => { S.ob++; render(); },
  "ob-fim": () => { S.ob = null; S.tab = "celular"; render(); },
  login: () => { S.ov = { t: "login" }; render(); },
  entrar: () => {
    S.conta = { nome: "Carlos Silva", email: "carlos@suporteexemplo.com.br", empresa: "Suporte Exemplo", admin: true, modo: "plano", creditos: 0 };
    S.ov = null; S.tab = "acessar"; S.cen = "plano";
    toast("Bem-vindo, Carlos");
  },
  sair: () => { S.conta = null; S.cen = "cliente"; toast("Você saiu da conta"); },
  atualizar: () => toast("Ainda sem plano nem créditos"),
  limpar: () => { S.busca = ""; render(); },
  filtro: (v) => { S.filtro.has(v) ? S.filtro.delete(v) : S.filtro.add(v); render(); },
  lista: (v) => { S.lista = v; render(); },
  pc: (v) => { S.ov = { t: "pc", id: v }; render(); },
  fav: (v) => { S.favs.has(v) ? S.favs.delete(v) : S.favs.add(v); render(); },
  conectar: (v) => conectar(COMPUTADORES.find((c) => c.id === v)),
  "conectar-id": (v) => conectar({ id: v.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3"), nome: "Computador avulso", os: "win" }),
  "sair-remota": () => { S.remota = null; S.land = false; render(); },
  girar: () => { S.land = !S.land; render(); },
  "dica-ok": () => { S.dicaGestos = false; render(); },
  "r-kbd": () => { S.remota.kbd = !S.remota.kbd; render(); },
  "r-modo": () => { S.remota.modo = S.remota.modo === "toque" ? "ponteiro" : "toque"; render(); },
  "r-mon": () => { S.remota.mon = S.remota.mon === 1 ? 2 : 1; render(); },
  "r-mais": () => { S.ov = { t: "mais" }; render(); },
  toggle: (k) => { S[k] = !S[k]; render(); },
  link: () => toast("Abre no navegador"),
  toast: (v) => toast(v),
  fechar: () => { S.ov = null; render(); },
  "sim-pedido": () => {
    if (S.remota) { S.remota = null; S.land = false; }
    S.arq = null;
    S.ob = null; S.tab = "celular"; S.cenAberto = false;
    S.ov = { t: "pedido", controle: true, arquivos: true, audio: false };
    render();
  },
  "pedido-sw": (k) => { S.ov[k] = !S.ov[k]; render(); },
  recusar: () => { S.ov = null; toast("Acesso recusado"); },
  permitir: () => { S.ov = null; S.recebida = { quem: "Carlos Silva", t0: Date.now() }; render(); },
  "sim-recebida": () => { S.ob = null; S.remota = null; S.arq = null; S.land = false; S.cenAberto = false; S.recebida = { quem: "Carlos Silva", t0: Date.now() }; render(); },
  "encerrar-recebida": () => { S.recebida = null; toast("Acesso encerrado"); },
  chat: () => { S.ov = { t: "chat" }; render(); },
  "sim-atualizado": (v) => { S.ob = null; S.remota = null; S.arq = null; S.cenAberto = false; S.ov = { t: "atualizado", primeira: !!v }; render(); },
  arquivos: (id) => {
    const pc = S.remota?.pc ?? COMPUTADORES.find((c) => c.id === id);
    // Abrir só os arquivos é uma conexão nova: gasta crédito igual ao acesso. Dentro de um acesso, não.
    const avulso = !S.remota;
    if (avulso && S.conta.modo !== "plano") S.conta.creditos--;
    S.arq = { pc, lado: "pc", cam: { pc: [], cel: [] }, sel: new Set(), avulso };
    S.ov = null;
    render();
  },
  "arq-fechar": () => { S.arq = null; render(); },
  "arq-lado": (v) => { S.arq.lado = v; S.arq.sel.clear(); render(); },
  "arq-ir": (i) => { const a = S.arq; a.cam[a.lado] = a.cam[a.lado].slice(0, Number(i)); a.sel.clear(); render(); },
  "arq-abrir": (n) => { const a = S.arq; a.cam[a.lado].push(n); a.sel.clear(); render(); },
  "arq-sel": (n) => { const s = S.arq.sel; s.has(n) ? s.delete(n) : s.add(n); render(); },
  "arq-limpar": () => { S.arq.sel.clear(); render(); },
  "arq-enviar": () => {
    const a = S.arq;
    const p = pasta(a.lado);
    const destino = [RAIZ.pc, ...a.cam.pc].slice(-1)[0];
    for (const n of a.sel) S.fila.push({ nome: n, tam: p[n][0], dir: a.lado === "pc" ? "baixar" : "enviar", destino, p: 0 });
    const qtd = a.sel.size;
    a.sel.clear();
    toast(`${qtd} ${qtd === 1 ? "arquivo" : "arquivos"} na fila`);
  },
  fila: () => { S.ov = { t: "fila" }; render(); },
  "fila-limpar": () => { S.fila = S.fila.filter((f) => f.p < 100); render(); },
};

// Fila de transferência andando sozinha (de mentira).
setInterval(() => {
  const ativa = S.fila.find((f) => f.p < 100);
  if (!ativa) return;
  ativa.p = Math.min(100, ativa.p + 9 + Math.floor(Math.random() * 12));
  if (ativa.p >= 100 && !S.fila.some((f) => f.p < 100)) toast("Transferência concluída");
  else if (S.arq || S.ov?.t === "fila") render();
}, 450);

document.addEventListener("submit", (e) => {
  if (e.target.dataset.form !== "msg") return;
  e.preventDefault();
  const t = $("#msg").value.trim();
  if (!t) return;
  S.msgs[S.remota ? "tecnico" : "cliente"].push({ t, eu: true });
  $("#msg").value = "";
  render();
  const m = $("#msgs");
  if (m) m.scrollTop = m.scrollHeight;
});

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-a]");
  if (!el) return;
  // Toque dentro da folha não fecha a folha: só o fundo escuro fecha.
  if (el.dataset.a === "fechar" && el.classList.contains("ov") && e.target.closest("[data-stop]")) return;
  ACOES[el.dataset.a]?.(el.dataset.v);
});
document.addEventListener("input", (e) => {
  if (e.target.id === "busca") { S.busca = e.target.value; render(); }
});
setInterval(() => {
  document.querySelectorAll("[data-timer]").forEach((el) => {
    const t0 = el.closest(".remote") ? S.remota?.t0 : S.recebida?.t0;
    if (t0) el.textContent = mmss(t0);
  });
}, 1000);

// Atalhos pela URL, para abrir direto numa situação: ?cen=plano&tab=acessar&ob=2&abrir=pedido|recebida|pc|remota&tema=claro
const U = new URLSearchParams(location.search);
if (U.get("embed")) document.documentElement.classList.add("embed");
aplicarCenario(CENARIOS[U.get("cen")] ? U.get("cen") : "novo");
if (U.get("tema")) S.tema = U.get("tema");
if (U.get("tab")) S.tab = U.get("tab");
if (U.get("ob")) S.ob = Number(U.get("ob"));
const abrir = U.get("abrir");
if (abrir === "pedido") ACOES["sim-pedido"]();
if (abrir === "recebida") ACOES["sim-recebida"]();
if (abrir === "pc") S.ov = { t: "pc", id: COMPUTADORES[0].id };
if (abrir === "remota") { S.remota = { pc: COMPUTADORES[0], t0: Date.now(), modo: "toque", mon: 1, kbd: false, credito: false }; S.dicaGestos = U.get("dica") !== "0"; }
if (abrir === "consent") S.ov = { t: "consent" };
if (abrir === "atualizado") S.ov = { t: "atualizado", primeira: U.get("primeira") === "1" };
if (abrir === "arquivos") { ACOES.arquivos(COMPUTADORES[0].id); if (U.get("lado")) S.arq.lado = U.get("lado"); if (U.get("cam")) S.arq.cam[S.arq.lado] = U.get("cam").split("/"); if (U.get("fila")) { S.fila = [{ nome: "backup_2026-09-30.zip", tam: "212 MB", dir: "baixar", p: 37 }, { nome: "NFe pendentes.pdf", tam: "1,2 MB", dir: "baixar", p: 100 }]; S.ov = { t: "fila" }; } if (U.get("sel")) U.get("sel").split(",").forEach((n) => S.arq.sel.add(n)); }
if (abrir === "chat") { S.remota = { pc: COMPUTADORES[0], t0: Date.now(), modo: "toque", mon: 1, kbd: false }; S.dicaGestos = false; S.ov = { t: "chat" }; }
render();
