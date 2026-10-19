// Protótipo navegável do AcessoFast Desktop. Tudo aqui é simulado: nenhum acesso real acontece.
"use strict";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const ic = (n, cls = "") => `<svg class="i ${cls}"><use href="#${n}"/></svg>`;
const soDigitos = (s) => String(s).replace(/\D/g, "");
const fmtId = (s) => soDigitos(s).replace(/(\d{3})(?=\d)/g, "$1 ");
// ID em destaque: grupos de 3 com um respiro curto, em vez do espaço inteiro da fonte monoespaçada.
const idGrande = (s) => (soDigitos(s).match(/\d{1,3}/g) || []).map((g) => `<span class="grp">${g}</span>`).join("");
const ler = (k, d) => { try { return localStorage.getItem("afp." + k) ?? d; } catch { return d; } };
const gravar = (k, v) => { try { localStorage.setItem("afp." + k, v); } catch { /* sem armazenamento */ } };
const dur = (ms) => { const t = Math.floor(ms / 1000); const h = String(Math.floor(t / 3600)).padStart(2, "0"); const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0"); return `${h}:${m}:${String(t % 60).padStart(2, "0")}`; };
const agora = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

const MEU_ID = "847392115";
// Histórico de quem acessou este computador (na versão real vem do registro de sessões do painel).
const ACESSOS_RECEBIDOS = [
  { ini: "CS", nome: "Carlos · Suporte técnico", quando: "hoje, 09:14", dur: "18 min" },
  { ini: "CS", nome: "Carlos · Suporte técnico", quando: "26/09, 16:40", dur: "42 min" },
  { ini: "JT", nome: "João · TI da Clínica", quando: "22/09, 11:05", dur: "7 min" },
  { ini: "CS", nome: "Carlos · Suporte técnico", quando: "15/09, 08:52", dur: "1 h 03 min" },
];
const SENHA = "Kx7m-Qp42-Wz9t";
const TECNICO = { nome: "Carlos · Suporte técnico", id: "604219377", ini: "CS" };
let seq = 1;

const FS_LOCAL = {
  "C:\\Users\\Tecnico\\Downloads": [
    { n: "Drivers impressora", d: 1, dt: "22/09 14:10" },
    { n: "atualizacao-sistema-v8.exe", s: "48,2 MB", dt: "29/09 09:02" },
    { n: "backup-config.zip", s: "3,1 MB", dt: "28/09 18:45" },
    { n: "manual-usuario.pdf", s: "812 KB", dt: "15/09 11:20" },
    { n: "certificado-a1.pfx", s: "6 KB", dt: "02/09 16:33" },
  ],
  "C:\\Users\\Tecnico\\Downloads\\Drivers impressora": [
    { n: "hp-laserjet-m1132.exe", s: "92,4 MB", dt: "22/09 14:10" },
    { n: "epson-l3150.zip", s: "31,7 MB", dt: "22/09 14:12" },
  ],
};
const FS_REMOTO = {
  "C:\\Sistema\\Instaladores": [
    { n: "Antigos", d: 1, dt: "02/08 08:30" },
    { n: "atualizacao-sistema-v7.exe", s: "46,9 MB", dt: "02/08 08:31" },
    { n: "licenca.key", s: "2 KB", dt: "10/01 16:05" },
    { n: "log-erros.txt", s: "118 KB", dt: "29/09 08:57" },
  ],
  "C:\\Sistema\\Instaladores\\Antigos": [
    { n: "atualizacao-sistema-v6.exe", s: "45,1 MB", dt: "11/05 10:02" },
  ],
};

const S = {
  tema: ler("tema", "escuro"),
  // Janelas do app. A "main" sempre existe e tem a aba Início; as outras nascem quando uma aba é arrastada para fora.
  wins: [{ id: "main", abas: [], aba: "home", max: false }],
  foco: "main",
  tabCtx: null,
  filtroMarc: [],
  marcadores: [
    { id: "m1", label: "Clínica", color: "blue" },
    { id: "m2", label: "Contrato mensal", color: "green" },
    { id: "m3", label: "Urgente", color: "red" },
    { id: "m4", label: "Aguardando cliente", color: "amber" },
    { id: "m5", label: "Servidor", color: "violet" },
    { id: "m6", label: "Varejo", color: "pink" },
  ],
  view: "inicio",
  lista: "recentes",
  layout: ler("layout", "grade"),
  pwVis: false,
  destino: "",
  menu: null,
  ctx: null,
  cfg: "geral",
  modal: null,
  toast: null,
  recebido: null,
  cheia: false,
  prefs: { placa: true, impressora: true, gravarAuto: false, idioma: "Português (Brasil)", perms: { mouse: true, clip: true, arq: true, som: false } },
  transf: [
    { nome: "relatorio-agosto.pdf", pc: "Financeiro · Contábil Souza", dir: "Recebido", tam: "2,4 MB", quando: "25/09 10:14" },
    { nome: "atualizacao-sistema-v7.exe", pc: "Recepção · Clínica Vida", dir: "Enviado", tam: "46,9 MB", quando: "02/08 08:31" },
  ],
  devs: [
    { id: "51200651", marc: ["m1", "m2"], nome: "Recepção · Clínica Vida", os: "win", online: true, quando: "há 12 min", fav: true },
    { id: "733184902", marc: ["m6", "m2"], nome: "Caixa 02 · Mercado Bom Preço", os: "win", online: true, quando: "ontem, 17:40" },
    { id: "298551407", marc: ["m4"], nome: "MacBook da Diretoria", os: "apple", online: false, quando: "26/09" },
    { id: "415770238", marc: ["m2"], nome: "Financeiro · Contábil Souza", os: "win", online: true, quando: "25/09", fav: true },
    { id: "902114563", marc: ["m6"], nome: "Tablet do Estoque", os: "android", online: true, quando: "24/09" },
    { id: "660392781", marc: ["m1", "m5", "m3"], nome: "Servidor · Clínica Vida", os: "win", online: false, quando: "20/09", fav: true },
    { id: "318907264", marc: ["m1"], nome: "Recepção · Odonto Sorriso", os: "win", online: true, quando: "19/09" },
    { id: "547120983", marc: ["m6", "m4"], nome: "Balcão · Farmácia Central", os: "win", online: true, quando: "18/09" },
    { id: "806334172", nome: "Notebook do Dr. Paulo", os: "apple", online: false, quando: "17/09" },
    { id: "129485603", marc: ["m6"], nome: "Caixa 01 · Mercado Bom Preço", os: "win", online: true, quando: "16/09" },
    { id: "694201557", marc: ["m6", "m2"], nome: "Estoque · Auto Peças Silva", os: "win", online: true, quando: "12/09" },
    { id: "275830416", marc: ["m1"], nome: "Consultório 2 · Clínica Vida", os: "win", online: false, quando: "10/09" },
    { id: "377201945", nome: "PC-SALA-REUNIAO", os: "win", online: true, quando: "nunca acessado", rede: true },
    { id: "581440296", nome: "NOTE-TECNICO-02", os: "win", online: true, quando: "nunca acessado", rede: true },
    { id: "190873455", nome: "MAC-DESIGN", os: "apple", online: true, quando: "nunca acessado", rede: true },
  ],
};

/* ================= Tema ================= */
function aplicarTema() {
  const escuro = S.tema === "escuro" || (S.tema === "sistema" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.tema = escuro ? "escuro" : "claro";
}
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { aplicarTema(); });

/* ================= Peças ================= */
const tg = (on, a, v = "") => `<button class="tg ${on ? "on" : ""}" data-a="${a}" data-v="${v}" role="switch" aria-checked="${on}"></button>`;
const lock = (t = "Definido pelo painel") => `<span class="lock">${ic("lock", "s")}${t}</span>`;
const W = (id) => S.wins.find((w) => w.id === id);
const winFoco = () => W(S.foco) || W("main");
const todas = () => S.wins.flatMap((w) => w.abas);
const winDaAba = (k) => S.wins.find((w) => w.abas.some((a) => a.k === k));
const abaAtiva = (w) => w.abas.find((t) => t.k === w.aba);
const aba = () => abaAtiva(winFoco());
function focar(w, k) { S.foco = w.id; if (k) w.aba = k; }
const devPorId = (id) => S.devs.find((d) => d.id === id);

/* ================= Marcadores ================= */
// Mesmo modelo do painel (components/marcadores.tsx): vocabulário da empresa, 8 cores, vários por computador.
// No app de verdade a lista é a mesma do painel: marcar aqui aparece lá e vice-versa.
const CORES_MARC = ["slate", "red", "amber", "green", "blue", "violet", "pink", "gray"];
const NOMES_COR = { slate: "Ardósia", red: "Vermelho", amber: "Âmbar", green: "Verde", blue: "Azul", violet: "Violeta", pink: "Rosa", gray: "Cinza" };
function corPara(label) { let s = 0; for (let i = 0; i < label.length; i++) s += label.charCodeAt(i); return CORES_MARC[s % CORES_MARC.length]; }
const marcPorId = (id) => S.marcadores.find((m) => m.id === id);
const marcsDe = (d) => (d.marc || []).map(marcPorId).filter(Boolean);
const usoMarc = (id) => S.devs.filter((d) => (d.marc || []).includes(id)).length;
const chip = (m, x) => `<span class="mk" data-c="${m.color}"><i></i>${esc(m.label)}${x ? `<button class="mkx" data-a="filtroMarc" data-v="${m.id}" title="Tirar do filtro">${ic("x", "s")}</button>` : ""}</span>`;
function chipsDev(d, max = 3) {
  const ms = marcsDe(d);
  if (!ms.length) return "";
  const resto = ms.length - max;
  return `<div class="mks">${ms.slice(0, max).map((m) => chip(m)).join("")}${resto > 0 ? `<span class="mk mais" title="${esc(ms.slice(max).map((m) => m.label).join(", "))}">+${resto}</span>` : ""}</div>`;
}
function filtroMarcBtn() {
  const n = S.filtroMarc.length;
  const itens = S.marcadores.map((m) => `<button class="mi" data-a="filtroMarc" data-v="${m.id}"><span class="l"><span class="ck ${S.filtroMarc.includes(m.id) ? "on" : ""}">${ic("check", "s")}</span>${chip(m)}</span><em>${usoMarc(m.id)}</em></button>`).join("");
  return `<span class="rel"><button class="btn sm ${n ? "filtro-on" : "g"}" data-a="menu" data-v="marcFiltro" title="Filtrar por marcador">${ic("tag", "s")}Marcadores${n ? `<span class="badge">${n}</span>` : ""}</button>
    ${S.menu === "marcFiltro" ? `<div class="menu" style="right:0;top:40px;width:280px"><div class="mh">Mostrar computadores com</div>${itens}
      <div class="msep"></div>
      ${n ? `<button class="mi" data-a="limparFiltro"><span class="l">${ic("x", "s")}Limpar o filtro</span></button>` : ""}
      <button class="mi" data-a="criarMarcMenu"><span class="l">${ic("plus", "s")}Criar marcador</span></button>
      <button class="mi" data-a="gerenciarMarc"><span class="l">${ic("pencil", "s")}Gerenciar marcadores</span></button></div>` : ""}</span>`;
}
const filtroAtivo = () => (S.filtroMarc.length ? `<div class="mks filtro">${S.filtroMarc.map(marcPorId).filter(Boolean).map((m) => chip(m, true)).join("")}</div>` : "");

function listaDevs(qual) {
  let l = qual === "favoritos" ? S.devs.filter((d) => d.fav) : qual === "rede" ? S.devs.filter((d) => d.rede) : S.devs.filter((d) => !d.rede);
  if (S.filtroMarc.length) l = l.filter((d) => (d.marc || []).some((m) => S.filtroMarc.includes(m)));
  return l;
}

function cardDev(d) {
  return `<div class="dev" role="button" tabindex="0" data-a="conectar" data-v="${d.id}" data-dev="${d.id}" title="Clique para conectar. Botão direito para mais opções.">
    <div class="top"><span class="os">${ic(d.os)}</span><div style="min-width:0"><div class="nm">${esc(d.nome)}</div><div class="id">${fmtId(d.id)}</div></div>
    <span class="acts"><button class="tagb" data-a="marcDev" data-v="${d.id}" title="Marcadores">${ic("tag", "s")}</button>
    <button class="star ${d.fav ? "on" : ""}" data-a="fav" data-v="${d.id}" title="${d.fav ? "Tirar dos favoritos" : "Adicionar aos favoritos"}">${ic("star", "s")}</button></span></div>
    ${chipsDev(d)}
    <div class="meta"><span class="st ${d.online ? "on" : "off"}"><span class="dot"></span>${d.online ? "Online" : "Offline"}</span><span>${esc(d.quando)}</span></div>
  </div>`;
}
function linhaDev(d) {
  return `<div class="lrow" role="button" tabindex="0" data-a="conectar" data-v="${d.id}" data-dev="${d.id}">
    <span class="os">${ic(d.os)}</span><span class="nm">${esc(d.nome)}</span><span class="lmk">${chipsDev(d, 2)}</span><span class="id">${fmtId(d.id)}</span>
    <span class="st ${d.online ? "on" : "off"}"><span class="dot"></span>${d.online ? "Online" : "Offline"}</span><span class="q">${esc(d.quando)}</span>
    <span class="acts"><button class="tagb" data-a="marcDev" data-v="${d.id}" title="Marcadores">${ic("tag", "s")}</button><button class="star ${d.fav ? "on" : ""}" data-a="fav" data-v="${d.id}" title="Favorito">${ic("star", "s")}</button></span></div>`;
}
function blocoDevs(lista, limite) {
  const itens = limite ? lista.slice(0, limite) : lista;
  if (!itens.length) {
    const vazio = S.filtroMarc.length
      ? `Nenhum computador com esse marcador aqui. <button class="lnk" data-a="limparFiltro">Limpar o filtro</button>`
      : S.lista === "favoritos" || S.view === "favoritos"
        ? "Nenhum favorito ainda. Clique na estrela de um computador para ele aparecer aqui."
        : "Nenhum computador por aqui ainda.";
    return `<div class="empty">${vazio}</div>`;
  }
  return S.layout === "grade" ? `<div class="grid3">${itens.map(cardDev).join("")}</div>` : `<div class="list">${itens.map(linhaDev).join("")}</div>`;
}
const segLayout = () => `<div class="seg"><button class="${S.layout === "grade" ? "on" : ""}" data-a="layout" data-v="grade" title="Grade">${ic("grid", "s")}</button><button class="${S.layout === "lista" ? "on" : ""}" data-a="layout" data-v="lista" title="Lista">${ic("rows", "s")}</button></div>`;

/* ================= Início ================= */
function telaHome() {
  const nav = (v, icone, rot, n) => `<button class="nav ${S.view === v ? "on" : ""}" data-a="view" data-v="${v}">${ic(icone)}${rot}${n != null ? `<span class="count">${n}</span>` : ""}</button>`;
  return `<div class="home">
    <aside class="side">
      <div class="brandrow"><span class="logo md"></span>AcessoFast</div>
      ${nav("inicio", "home", "Início")}
      ${nav("recentes", "clock", "Recentes", listaDevs("recentes").length)}
      ${nav("favoritos", "star", "Favoritos", listaDevs("favoritos").length)}
      ${nav("rede", "lan", "Na mesma rede", listaDevs("rede").length)}
      ${nav("transferencias", "folder", "Transferências")}
      <div class="spacer"></div>
      ${nav("config", "gear", "Configurações")}
      <div class="foot"><span>AcessoFast</span><span>Versão 2.0.0 · protótipo</span></div>
    </aside>
    <main class="main"><div class="mainwrap">${conteudoHome()}</div></main>
  </div>`;
}

function conteudoHome() {
  if (S.view === "config") return telaConfig();
  if (S.view === "transferencias") return telaTransferencias();
  if (S.view !== "inicio") {
    const titulos = { recentes: "Acessados recentemente", favoritos: "Favoritos", rede: "Na mesma rede" };
    const nota = S.view === "rede"
      ? `<div class="note">${ic("info")}<span>Computadores com AcessoFast ligados na mesma rede que este (mesmo Wi-Fi ou cabo). Aparecem sozinhos, sem precisar digitar o ID. Útil quando o técnico está no próprio cliente.</span></div>`
      : "";
    return `<div class="sectionhead"><div class="tt"><h2>${titulos[S.view]}</h2>${filtroAtivo()}</div><div style="display:flex;gap:8px">${filtroMarcBtn()}${segLayout()}</div></div>${nota}${blocoDevs(listaDevs(S.view))}`;
  }
  const r = S.recebido;
  const sendoAcessado = r && r.fase === "ativo";
  const status = sendoAcessado
    ? `<span class="pill live pulse"><span class="dot"></span>Sendo acessado por ${esc(TECNICO.nome)}</span>`
    : `<span class="pill ok"><span class="dot"></span>Pronto para receber acesso</span>`;
  return `<div class="arranjo"><div class="row2 col-esq">
      <section class="card">
        <div class="kv"><h4>${ic("monitor", "s")}Este computador</h4>${status}</div>
        <div><div class="lbl">Seu ID</div>
          <div class="kv"><span class="idbig">${idGrande(MEU_ID)}</span><button class="ibtn" data-a="copiar" data-v="id" title="Copiar ID">${ic("copy")}</button></div></div>
        <div class="divider"></div>
        <div><div class="lbl">Senha</div>
          <div class="kv"><span class="pw">${S.pwVis ? SENHA : "••••••••••"}</span><span class="btnrow">
            <button class="ibtn" data-a="pwvis" title="${S.pwVis ? "Esconder senha" : "Mostrar senha"}">${ic(S.pwVis ? "eyeoff" : "eye")}</button>
            <button class="ibtn" data-a="copiar" data-v="senha" title="Copiar senha">${ic("copy")}</button></span></div></div>
        <div class="hint">${ic("shield", "s")}A senha é definida pelo painel da sua empresa.</div>
      </section>
      <section class="card">
        <h4>${ic("arrow", "s")}Acessar outro computador</h4>
        <form class="field" data-form="conectar"><input id="destino" placeholder="Digite o ID" inputmode="numeric" autocomplete="off" aria-label="ID do computador" value="${esc(fmtId(S.destino))}"></form>
        <div class="btnrow">
          <button class="btn p" style="flex:1" data-a="conectarCampo">${ic("monitor")}Conectar</button>
          <button class="btn" data-a="arquivosCampo">${ic("folder")}Arquivos</button>
          <span class="rel"><button class="btn g" data-a="menu" data-v="mais" title="Mais opções">${ic("more")}</button>
          ${S.menu === "mais" ? `<div class="menu" style="right:0;top:46px">
            <button class="mi" data-a="maisOpc" data-v="camera"><span class="l">${ic("video", "s")}Ver a câmera</span></button>
            <button class="mi" data-a="maisOpc" data-v="terminal"><span class="l">${ic("term", "s")}Abrir o terminal</span></button>
          </div>` : ""}</span>
        </div>
        <div class="hint">Dica: aperte Enter depois de digitar o ID.</div>
      </section>
      <section class="card acessos-card">
        <h4>${ic("shield", "s")}Quem acessou este computador</h4>
        <div class="acessos">${ACESSOS_RECEBIDOS.map((x) => `<div class="ac"><span class="avatar sm">${x.ini}</span><div style="min-width:0"><b>${esc(x.nome)}</b><span>${x.quando} · ${x.dur}</span></div></div>`).join("")}</div>
        <div class="hint">Todo acesso fica registrado no painel da sua empresa.</div>
      </section>
    </div>
    <div class="col-dir">
    <div class="sectionhead">
      <div class="tt"><h3>Seus computadores</h3>${filtroAtivo()}</div>
      <div style="display:flex;gap:8px">
        <div class="seg">${[["recentes", "Recentes"], ["favoritos", "Favoritos"], ["rede", "Na mesma rede"]].map(([k, t]) => `<button class="${S.lista === k ? "on" : ""}" data-a="lista" data-v="${k}">${t}</button>`).join("")}</div>
        ${filtroMarcBtn()}${segLayout()}
      </div>
    </div>
    ${blocoDevs(listaDevs(S.lista))}
    </div></div>`;
}

function telaTransferencias() {
  return `<div class="sectionhead"><h2>Transferências</h2></div>
    <div class="list">${S.transf.map((t) => `<div class="lrow" style="grid-template-columns:34px 1.6fr 1.2fr 90px 80px 90px">
      <span class="os">${ic(t.dir === "Enviado" ? "upload" : "download")}</span><span class="nm">${esc(t.nome)}</span><span class="q">${esc(t.pc)}</span>
      <span class="q">${t.dir}</span><span class="q">${t.tam}</span><span class="q">${t.quando}</span></div>`).join("")}</div>`;
}

/* ================= Configurações ================= */
function telaConfig() {
  const tabs = [["geral", "Geral"], ["seguranca", "Segurança"], ["gravacao", "Gravação"], ["sobre", "Sobre"]];
  let corpo = "";
  const p = S.prefs;
  if (S.cfg === "geral") {
    corpo = `<div class="sg">
      <div class="si"><div class="tx"><b>Tema</b><span>Aparência das telas do app</span></div>
        <div class="seg">${[["escuro", "Escuro"], ["claro", "Claro"], ["sistema", "Igual ao Windows"]].map(([k, t]) => `<button class="${S.tema === k ? "on" : ""}" data-a="tema" data-v="${k}">${t}</button>`).join("")}</div></div>
      <div class="si"><div class="tx"><b>Idioma</b><span>Idioma das telas do app</span></div><button class="dd" data-a="idioma">${esc(p.idioma)}${ic("chev", "s")}</button></div>
      <div class="si"><div class="tx"><b>Iniciar com o Windows</b><span>Este computador fica disponível para o suporte mesmo antes de alguém entrar</span></div>${lock()}</div>
      <div class="si"><div class="tx"><b>Usar a placa de vídeo</b><span>Deixa a imagem mais leve em computadores novos</span></div>${tg(p.placa, "pref", "placa")}</div>
      <div class="si"><div class="tx"><b>Impressora AcessoFast</b><span>Imprime aqui os arquivos do computador acessado</span></div>${tg(p.impressora, "pref", "impressora")}</div>
    </div>`;
  } else if (S.cfg === "seguranca") {
    const pm = p.perms;
    corpo = `<div class="sg">
      <div class="si"><div class="tx"><b>Senha deste computador</b><span>Mostrada na tela Início</span></div>${lock("Definida pelo painel")}</div>
      <div class="si"><div class="tx"><b>Como aceitar acessos</b><span>Com a senha, ou com um clique em Permitir</span></div>${lock()}</div>
      <div class="si"><div class="tx"><b>Acesso na tela de login do Windows</b><span>Permite entrar com a senha mesmo sem ninguém logado</span></div>${lock()}</div>
      <div class="si"><div class="tx"><b>Mudar configurações à distância</b><span>Quem acessa não consegue mexer nestas opções</span></div>${lock("Bloqueado pelo painel")}</div>
    </div>
    <div class="sgt">Permissões já marcadas ao aceitar um acesso</div>
    <div class="sg">
      <div class="si"><div class="tx"><b>Mouse e teclado</b></div>${tg(pm.mouse, "permPad", "mouse")}</div>
      <div class="si"><div class="tx"><b>Copiar e colar</b></div>${tg(pm.clip, "permPad", "clip")}</div>
      <div class="si"><div class="tx"><b>Arquivos</b></div>${tg(pm.arq, "permPad", "arq")}</div>
      <div class="si"><div class="tx"><b>Som do computador</b></div>${tg(pm.som, "permPad", "som")}</div>
    </div>`;
  } else if (S.cfg === "gravacao") {
    corpo = `<div class="sg">
      <div class="si"><div class="tx"><b>Gravar todo acesso que eu fizer</b><span>Começa a gravar sozinho ao conectar em outro computador</span></div>${tg(p.gravarAuto, "pref", "gravarAuto")}</div>
      <div class="si"><div class="tx"><b>Pasta das gravações</b><span>Onde os vídeos e capturas de tela ficam salvos</span></div><button class="dd" data-a="pasta">Vídeos\\AcessoFast${ic("chev", "s")}</button></div>
    </div>`;
  } else {
    corpo = `<div class="card"><div class="about"><span class="logo lg"></span><div><b>AcessoFast</b><div class="hint">Versão 2.0.0 · protótipo de design de 29/09/2026</div></div></div>
      <div class="divider"></div>
      <div class="btnrow"><button class="btn sm" data-a="aviso" data-v="Na versão real, abre a política de privacidade.">Política de privacidade</button><button class="btn sm" data-a="aviso" data-v="Na versão real, abre os termos de uso.">Termos de uso</button></div></div>`;
  }
  return `<div class="sectionhead"><h2>Configurações</h2></div>
    <div class="seg" style="align-self:flex-start">${tabs.map(([k, t]) => `<button class="${S.cfg === k ? "on" : ""}" data-a="cfg" data-v="${k}">${t}</button>`).join("")}</div>
    <div class="set">${corpo}</div>`;
}

/* ================= Sessão remota ================= */
function telaSessao(t) {
  const d = t.dev;
  if (t.conectando) {
    return `<div class="connecting"><div class="box"><div class="spin"></div><b>${esc(t.msgConexao || `Conectando a ${d.nome}`)}</b><span class="hint">${fmtId(d.id)}</span>
      <button class="btn sm" data-a="fecharAba" data-v="${t.k}">Cancelar</button></div></div>`;
  }
  const menu = (nome, html, lado = "left:0") => (S.menu === nome && t === aba() ?`<div class="menu" style="${lado};top:44px">${html}</div>` : "");
  const segM = (campo, ops) => `<div class="seg">${ops.map(([k, r]) => `<button class="${t[campo] === k ? "on" : ""}" data-a="sessSet" data-v="${campo}:${k}">${r}</button>`).join("")}</div>`;
  const tgl = (campo, rot) => `<div class="mi"><span>${rot}</span>${tg(t[campo], "sessTg", campo)}</div>`;
  const acoes = `
    <button class="mi" data-a="acao" data-v="cad"><span class="l">${ic("kbd", "s")}Ctrl + Alt + Del</span></button>
    <button class="mi" data-a="acao" data-v="bloquear"><span class="l">${ic("lock", "s")}Bloquear o computador</span></button>
    <button class="mi" data-a="acao" data-v="senhaWin"><span class="l">${ic("shield", "s")}Digitar a senha do Windows</span></button>
    <button class="mi" data-a="acao" data-v="colar"><span class="l">${ic("clip", "s")}Colar o que copiei aqui</span></button>
    <div class="msep"></div>
    <div class="mi"><span class="l">${ic("mouse", "s")}Bloquear mouse e teclado do cliente</span>${tg(t.bloqIn, "sessTg", "bloqIn")}</div>
    <button class="mi" data-a="acao" data-v="virtual"><span class="l">${ic("monitor", "s")}${t.virtual ? "Remover a tela virtual" : "Criar uma tela virtual"}</span></button>
    <button class="mi" data-a="acao" data-v="inverter"><span class="l">${ic("swap", "s")}Inverter os lados</span></button>
    <button class="mi" data-a="acao" data-v="recarregar"><span class="l">${ic("refresh", "s")}Recarregar a imagem</span></button>
    <div class="msep"></div>
    <button class="mi danger" data-a="acao" data-v="reiniciar"><span class="l">${ic("power", "s")}Reiniciar o computador</span></button>`;
  const exib = `
    <div class="mh">Tamanho da imagem</div>${segM("tam", [["original", "Original"], ["ajustar", "Ajustar à janela"], ["personalizado", "Escolher"]])}
    ${t.tam === "personalizado" ? `<div class="mi"><input type="range" id="escala-${t.k}" data-escala="${t.k}" min="30" max="150" step="5" value="${t.escala}" aria-label="Tamanho da imagem" style="flex:1"><em id="escala-v-${t.k}">${t.escala}%</em></div>` : ""}
    <div class="mh">Qualidade</div>${segM("qual", [["melhor", "Melhor"], ["equilibrada", "Equilibrada"], ["leve", "Leve"]])}
    ${tgl("cursor", "Mostrar o cursor remoto")}${tgl("priv", "Modo privacidade (tela do cliente fica preta)")}${tgl("bloqFim", "Bloquear o computador ao encerrar")}${tgl("clip", "Copiar e colar entre os dois")}${tgl("qind", "Mostrar qualidade da conexão")}
    <button class="mi" data-a="codec"><span>Codificação de vídeo</span><em>${t.codec}</em></button>`;
  const teclado = `<div class="mh">Modo do teclado</div>${[["mapa", "Mapeado", "recomendado"], ["traducao", "Tradução", ""], ["legado", "Legado", ""]].map(([k, r, n]) => `<button class="mi" data-a="sessSet" data-v="kbd:${k}"><span class="l">${t.kbd === k ? ic("check", "s") : `<span style="width:15px"></span>`}${r}</span><em>${n}</em></button>`).join("")}
    <div class="msep"></div><button class="mi" data-a="aviso" data-v="Tecla Windows enviada."><span>Enviar a tecla Windows</span></button><button class="mi" data-a="aviso" data-v="Alt+Tab enviado."><span>Enviar Alt + Tab</span></button>`;
  const monitores = t.virtual ? 3 : 2;
  const barra = t.tbOff
    ? `<button class="tbhandle" data-a="sessTg" data-v="tbOff" title="Mostrar a barra">${ic("chev", "s")}</button>`
    : `<div class="tb">
      <div class="peer"><span class="logo"></span><div><b>${esc(d.nome)}</b> <span>${fmtId(d.id)}</span></div></div>
      <span class="sep"></span>
      <div class="grp">${Array.from({ length: monitores }, (_, i) => `<button class="b ${t.mon === i + 1 ? "on" : ""}" data-a="sessSet" data-v="mon:${i + 1}" title="Monitor ${i + 1}">${i === 0 ? ic("monitor") : ""}${i + 1}</button>`).join("")}</div>
      <span class="sep"></span>
      <div class="grp">
        <span class="rel"><button class="b ${S.menu === "acoes" ? "on" : ""}" data-a="menu" data-v="acoes">${ic("power")}<span class="tl">Ações</span>${ic("chev", "s")}</button>${menu("acoes", acoes)}</span>
        <span class="rel"><button class="b ${S.menu === "exib" ? "on" : ""}" data-a="menu" data-v="exib">${ic("monitor")}<span class="tl">Exibição</span>${ic("chev", "s")}</button>${menu("exib", exib)}</span>
        <span class="rel"><button class="b ${S.menu === "kbd" ? "on" : ""}" data-a="menu" data-v="kbd" title="Teclado">${ic("kbd")}</button>${menu("kbd", teclado)}</span>
        <button class="b" data-a="abrirArquivos" data-v="${d.id}" title="Transferir arquivos">${ic("folder")}</button>
        <button class="b ${t.mudo ? "recon" : ""}" data-a="mudo" title="${t.mudo ? "Ligar o som do computador acessado" : "Desligar o som do computador acessado"}">${ic(t.mudo ? "soundoff" : "sound")}</button>
        <button class="b ${t.chat ? "on" : ""}" data-a="sessTg" data-v="chat" title="Conversar">${ic("chat")}</button>
        <button class="b ${t.rec ? "recon" : ""}" data-a="gravar" title="${t.rec ? "Parar gravação" : "Gravar"}">${ic("rec")}${t.rec ? `<span id="rec-${t.k}">${dur(Date.now() - t.recIni)}</span>` : ""}</button>
        <button class="b" data-a="capturar" title="Capturar a tela">${ic("cam")}</button>
        <button class="b ${S.cheia ? "on" : ""}" data-a="cheia" title="Tela cheia">${ic("full")}</button>
        <button class="b" data-a="sessTg" data-v="tbOff" title="Esconder a barra">${ic("chevup", "s")}</button>
      </div>
      <span class="sep"></span>
      <button class="b end" data-a="fecharAba" data-v="${t.k}">Encerrar</button>
    </div>`;
  const app = t.mon === 1
    ? `<div class="rapp"><div class="rt">Sistema da Clínica · Agenda do dia</div><div class="rl"><div></div><div class="lines"><i style="width:70%"></i><i style="width:90%"></i><i style="width:55%"></i><i style="width:82%"></i><i style="width:64%"></i><i style="width:88%"></i><i style="width:40%"></i></div></div></div>`
    : t.mon === 2
      ? `<div class="rapp" style="left:18%;top:12%;width:60%;height:62%;border-radius:0.4cqw"><div class="rt">Planilha · Fechamento de setembro</div><div class="cells">${"<i></i>".repeat(66)}</div></div>`
      : `<div class="rapp" style="left:30%;top:30%;width:40%;height:30%;border-radius:0.4cqw"><div class="rt">Tela virtual</div><div class="lines"><i style="width:50%"></i></div></div>`;
  const chat = t.chat ? `<div class="chat">
      <div class="ch"><span>Conversa com ${esc(d.nome)}</span><span class="btnrow"><button class="ibtn" style="width:30px;height:30px" data-a="aviso" data-v="Chamada de voz iniciada. Na versão real, o cliente precisa aceitar." title="Chamada de voz">${ic("phone", "s")}</button><button class="ibtn" style="width:30px;height:30px" data-a="sessTg" data-v="chat" title="Fechar">${ic("x", "s")}</button></span></div>
      <div class="msgs" id="msgs-${t.k}">${t.msgs.length ? t.msgs.map((m) => `<div class="msg ${m.eu ? "eu" : ""}">${esc(m.t)}<small>${m.h}</small></div>`).join("") : `<div class="hint" style="justify-content:center;padding:20px 0">As mensagens aparecem na tela do cliente.</div>`}</div>
      <form data-form="chatSessao"><input id="chat-${t.k}" placeholder="Escreva uma mensagem" autocomplete="off"><button class="ibtn" style="background:var(--primary);color:#fff;border-color:var(--primary)" title="Enviar">${ic("send", "s")}</button></form>
    </div>` : "";
  return `<div class="remote">
    <div class="rstage ${t.tam}"><div class="rmon m${Math.min(t.mon, 2)} ${t.qual === "leve" ? "leve" : ""}" id="rmon-${t.k}" style="${t.tam === "personalizado" ? `width:${Math.round(19.2 * t.escala)}px` : ""}">
      ${app}<div class="rtask"><i></i><i></i><i></i><i></i><i></i></div>${t.cursor ? `<div class="rcursor"></div>` : ""}
      ${t.priv ? `<div class="privacy"><span>Modo privacidade: a tela do cliente está preta</span></div>` : ""}
      ${t.flash ? `<div class="flash"></div>` : ""}
    </div></div>
    ${barra}${chat}
    ${t.qind ? `<div class="quality"><span>Conexão <b>${t.qual === "leve" ? "ótima" : "boa"}</b></span><span>32 ms</span><span>${t.qual === "melhor" ? "60" : "30"} fps</span><span>Direta</span></div>` : ""}
  </div>`;
}

/* ================= Arquivos ================= */
function telaArquivos(t) {
  if (t.conectando) {
    return `<div class="connecting"><div class="box"><div class="spin"></div><b>Abrindo os arquivos de ${esc(t.dev.nome)}</b><span class="hint">${fmtId(t.dev.id)}</span></div></div>`;
  }
  const lado = (L) => {
    const p = t[L];
    const itens = t.fs[L][p.path] || [];
    const raiz = !p.path.includes("\\", p.raiz.length);
    return `<div class="pane" data-pane="${L}">
      <div class="ph"><b>${L === "L" ? `${ic("monitor", "s")}Este computador` : `${ic(t.dev.os, "s")}${esc(t.dev.nome)}`}</b><span class="dd">Disco C:${ic("chev", "s")}</span></div>
      <div class="crumb"><button class="ibtn" data-a="fsUp" data-v="${L}" title="Voltar uma pasta" ${raiz ? "disabled style=\"opacity:.4\"" : ""}>${ic("up", "s")}</button><span>${esc(p.path)}</span></div>
      <div class="fl">${itens.length ? itens.map((f) => `<div class="fr ${p.sel.includes(f.n) ? "sel" : ""}" draggable="true" data-a="fsel" data-v="${L}" data-n="${esc(f.n)}" data-dir="${f.d ? 1 : 0}">
        ${ic(f.d ? "folder" : "file", `s fic ${f.d ? "f" : ""}`)}<span>${esc(f.n)}</span><span class="sz">${f.s || "—"}</span><span class="dt">${f.dt}</span></div>`).join("") : `<div class="hint" style="padding:20px;justify-content:center">Pasta vazia. Arraste arquivos para cá.</div>`}</div>
    </div>`;
  };
  return `<div class="ftwrap">
    <div class="ft">${lado("L")}
      <div class="mid"><button class="ibtn p" data-a="enviar" data-v="L" title="Enviar para ${esc(t.dev.nome)}">${ic("arrow")}</button><button class="ibtn" data-a="enviar" data-v="R" title="Trazer para este computador">${ic("arrowl")}</button></div>
      ${lado("R")}</div>
    <div class="queue">
      <div class="kv"><span class="lbl">Fila de transferência</span><span class="hint">Clique para selecionar, Ctrl+clique para vários, dois cliques abrem a pasta. Também dá para arrastar.</span></div>
      ${t.fila.length ? t.fila.map((q) => `<div class="qi ${q.pct >= 100 ? "done" : ""}"><span class="nm">${ic(q.de === "L" ? "upload" : "download", "s")}<span>${esc(q.n)}</span></span><div class="bar"><i id="qb-${q.id}" style="width:${q.pct}%"></i></div><span class="pc" id="qp-${q.id}">${q.pct >= 100 ? "Pronto" : Math.floor(q.pct) + "%"}</span></div>`).join("") : `<div class="hint">Nada na fila. Selecione arquivos e use as setas do meio.</div>`}
    </div>
  </div>`;
}

/* ================= Acesso recebido ================= */
function janelaRecebido() {
  const r = S.recebido;
  if (!r) return "";
  const who = `<div class="who"><span class="avatar">${TECNICO.ini}</span><div><div class="n">${esc(TECNICO.nome)}</div><div class="s">ID ${fmtId(TECNICO.id)}</div></div></div>`;
  const perm = (k, icone, rot) => `<div class="perm"><span>${ic(icone, "s")}${rot}</span>${tg(r.perms[k], "permRec", k)}</div>`;
  let titulo, corpo;
  if (r.fase === "pedido") {
    titulo = "Pedido de acesso";
    corpo = `${who}<p class="ask"><b>${esc(TECNICO.nome)}</b> quer controlar este computador.</p>
      <div class="perms">${perm("mouse", "mouse", "Mouse e teclado")}${perm("clip", "clip", "Copiar e colar")}${perm("arq", "folder", "Arquivos")}${perm("som", "sound", "Som")}</div>
      <div class="btnrow"><button class="btn d" style="flex:1" data-a="recusar">${ic("x")}Recusar</button><button class="btn p" style="flex:1.4" data-a="permitir">${ic("check")}Permitir acesso</button></div>`;
  } else if (r.fase === "ativo") {
    titulo = "Acesso em andamento";
    corpo = r.min
      ? `<div class="livebar"><span class="pill live pulse"><span class="dot"></span>${esc(TECNICO.nome)}</span><span class="tm" id="rec-tm">${dur(Date.now() - r.ini)}</span></div>`
      : `${who}<div class="livebar"><span class="pill live pulse"><span class="dot"></span>${r.viaSenha ? "Entrou com a senha" : "Controlando agora"}</span><span class="tm" id="rec-tm">${dur(Date.now() - r.ini)}</span></div>
      <div class="perms">${perm("mouse", "mouse", "Mouse e teclado")}${perm("clip", "clip", "Copiar e colar")}${perm("arq", "folder", "Arquivos")}${perm("som", "sound", "Som")}${perm("reiniciar", "power", "Reiniciar o PC")}${perm("gravar", "rec", "Gravar a tela")}</div>
      ${r.chat ? `<div class="cmchat"><div class="msgs" id="msgs-rec">${r.msgs.map((m) => `<div class="msg ${m.eu ? "eu" : ""}">${esc(m.t)}<small>${m.h}</small></div>`).join("") || `<div class="hint">Escreva para o técnico.</div>`}</div>
        <form data-form="chatRec"><input id="chat-rec" placeholder="Escreva para o técnico" autocomplete="off"><button class="ibtn" title="Enviar">${ic("send", "s")}</button></form></div>` : ""}
      <div class="btnrow"><button class="btn ${r.chat ? "p" : ""}" style="flex:1" data-a="recChat">${ic("chat")}Conversar</button><button class="btn d" style="flex:1" data-a="encerrarRec">${ic("power")}Encerrar acesso</button></div>`;
  } else {
    titulo = "Acesso encerrado";
    corpo = `<div class="resumo"><span class="ok">${ic("check")}</span><b>Acesso encerrado</b><span class="hint">${esc(TECNICO.nome)} ficou ${r.resumo} conectado.</span></div>`;
  }
  return `<div class="cmwin" role="dialog" aria-label="${titulo}">
    <div class="titlebar"><span class="t"><span class="logo"></span>${titulo}</span><span class="wctl">${r.fase === "ativo" ? `<i data-a="recMin" style="cursor:pointer" title="${r.min ? "Expandir" : "Minimizar"}">${r.min ? "▢" : "—"}</i>` : ""}</span></div>
    <div class="cm">${corpo}</div>
  </div>`;
}

/* ================= Diálogos ================= */
function modal() {
  const m = S.modal;
  if (!m) return "";
  let html = "";
  if (m.tipo === "senha") {
    html = `<h3>Senha de ${fmtId(m.id)}</h3><p>Este computador ainda não está na sua lista. Peça a senha para quem está do outro lado.</p>
      <form class="field sm" data-form="senha"><input id="m-senha" type="password" placeholder="Senha" autocomplete="off"></form>
      ${m.erro ? `<div class="hint" style="color:var(--danger-text)">${m.erro}</div>` : ""}
      <div class="si" style="padding:0;border:0"><span class="hint">Lembrar a senha neste computador</span>${tg(m.lembrar, "mLembrar")}</div>
      <div class="btnrow"><button class="btn g" data-a="fecharModal">Cancelar</button><button class="btn p" data-a="mSenhaOk">Conectar</button></div>`;
  } else if (m.tipo === "renomear") {
    html = `<h3>Renomear</h3><p>O nome aparece só na sua lista.</p>
      <form class="field sm" data-form="renomear"><input id="m-nome" value="${esc(devPorId(m.id).nome)}" autocomplete="off"></form>
      <div class="btnrow"><button class="btn g" data-a="fecharModal">Cancelar</button><button class="btn p" data-a="mRenomearOk">Salvar</button></div>`;
  } else if (m.tipo === "remover") {
    html = `<h3>Remover ${esc(devPorId(m.id).nome)}?</h3><p>Ele sai da sua lista de recentes. Dá para acessar de novo pelo ID quando quiser.</p>
      <div class="btnrow"><button class="btn g" data-a="fecharModal">Cancelar</button><button class="btn d" data-a="mRemoverOk">Remover</button></div>`;
  } else if (m.tipo === "reiniciar") {
    html = `<h3>Reiniciar ${esc(aba().dev.nome)}?</h3><p>O computador desliga e liga de novo. O acesso volta sozinho quando o Windows terminar de ligar.</p>
      <div class="btnrow"><button class="btn g" data-a="fecharModal">Cancelar</button><button class="btn d" data-a="mReiniciarOk">Reiniciar</button></div>`;
  } else if (m.tipo === "senhaWin") {
    html = `<h3>Senha do Windows</h3><p>O AcessoFast digita a senha na tela de login de ${esc(aba().dev.nome)}.</p>
      <form class="field sm" data-form="senhaWin"><input id="m-win" type="password" placeholder="Senha do Windows" autocomplete="off"></form>
      <div class="btnrow"><button class="btn g" data-a="fecharModal">Cancelar</button><button class="btn p" data-a="mSenhaWinOk">Enviar</button></div>`;
  }
  if (m.tipo === "marcDev") {
    const d = devPorId(m.id);
    const busca = (m.busca || "").trim();
    const lista = S.marcadores.filter((x) => x.label.toLowerCase().includes(busca.toLowerCase()));
    const exato = S.marcadores.some((x) => x.label.toLowerCase() === busca.toLowerCase());
    html = `<h3>Marcadores de ${esc(d.nome)}</h3><p>Os marcadores são os mesmos do painel. O que você marcar aqui aparece lá também.</p>
      <form class="field sm" data-form="marcCriar"><input id="m-marc-busca" placeholder="Buscar ou criar marcador" autocomplete="off" value="${esc(m.busca || "")}"></form>
      <div class="mklist">${lista.map((x) => `<button class="mi" data-a="marcToggle" data-v="${x.id}"><span class="l"><span class="ck ${(d.marc || []).includes(x.id) ? "on" : ""}">${ic("check", "s")}</span>${chip(x)}</span><em>${usoMarc(x.id)}</em></button>`).join("")}
        ${busca && !exato ? `<button class="mi" data-a="marcCriar"><span class="l">${ic("plus", "s")}Criar o marcador ${chip({ label: busca, color: corPara(busca) })}</span></button>` : ""}
        ${!lista.length && !busca ? `<div class="hint">Nenhum marcador ainda. Digite um nome para criar.</div>` : ""}</div>
      <div class="btnrow" style="justify-content:space-between"><button class="btn g sm" data-a="gerenciarMarc">${ic("pencil", "s")}Gerenciar</button><button class="btn p sm" data-a="fecharModal">Pronto</button></div>`;
  } else if (m.tipo === "gerMarc") {
    const cor = m.novoCor || corPara(m.novoNome || "");
    html = `<h3>Gerenciar marcadores</h3><p>Criar, renomear, trocar a cor ou excluir muda em todos os computadores, aqui e no painel.</p>
      <div class="novomk">
        <div class="lbl">Novo marcador</div>
        <form class="field sm" data-form="novoMarc"><input id="m-novo-marc" placeholder="Nome do marcador, ex.: Plantão sábado" autocomplete="off" value="${esc(m.novoNome || "")}"></form>
        <div class="kv"><div class="cores">${CORES_MARC.map((c) => `<button class="corb ${c === cor ? "sel" : ""}" data-a="novoCor" data-v="${c}" data-c="${c}" title="${NOMES_COR[c]}"></button>`).join("")}</div>
          <span style="display:flex;gap:10px;align-items:center">${m.novoNome ? chip({ label: m.novoNome.trim(), color: cor }) : ""}<button class="btn p sm" data-a="novoMarc">${ic("plus", "s")}Criar</button></span></div>
        ${m.erro ? `<div class="hint" style="color:var(--danger-text)">${m.erro}</div>` : ""}
      </div>
      <div class="lbl">Marcadores da empresa</div>
      <div class="mklist">${S.marcadores.map((x) => `<div class="mkrow">
        <button class="corb" data-a="marcCor" data-v="${x.id}" data-c="${x.color}" title="Cor: ${NOMES_COR[x.color]}. Clique para trocar."></button>
        <input id="m-mk-${x.id}" data-mk="${x.id}" value="${esc(x.label)}" aria-label="Nome do marcador" autocomplete="off">
        <span class="hint" style="white-space:nowrap">${usoMarc(x.id)} ${usoMarc(x.id) === 1 ? "computador" : "computadores"}</span>
        ${m.confirmar === x.id
          ? `<button class="btn d sm" data-a="marcExcluirOk" data-v="${x.id}">Excluir</button><button class="btn g sm" data-a="marcExcluir" data-v="">Não</button>`
          : `<button class="ibtn" data-a="marcExcluir" data-v="${x.id}" title="Excluir">${ic("trash", "s")}</button>`}
      </div>`).join("")}</div>
      <div class="btnrow"><button class="btn p sm" data-a="fecharModal">Pronto</button></div>`;
  }
  return `<div class="modal" data-a="fundoModal"><div class="dlg ${m.tipo === "gerMarc" ? "largo" : ""}">${html}</div></div>`;
}

function menuContexto() {
  if (!S.ctx) return "";
  const d = devPorId(S.ctx.id);
  return `<div class="menu" style="left:${S.ctx.x}px;top:${S.ctx.y}px">
    <button class="mi" data-a="conectar" data-v="${d.id}"><span class="l">${ic("monitor", "s")}Conectar</span></button>
    <button class="mi" data-a="abrirArquivos" data-v="${d.id}"><span class="l">${ic("folder", "s")}Transferir arquivos</span></button>
    <button class="mi" data-a="fav" data-v="${d.id}"><span class="l">${ic("star", "s")}${d.fav ? "Tirar dos favoritos" : "Adicionar aos favoritos"}</span></button>
    <button class="mi" data-a="marcDev" data-v="${d.id}"><span class="l">${ic("tag", "s")}Marcadores</span></button>
    <button class="mi" data-a="renomear" data-v="${d.id}"><span class="l">${ic("pencil", "s")}Renomear</span></button>
    <button class="mi" data-a="copiarIdDe" data-v="${d.id}"><span class="l">${ic("copy", "s")}Copiar o ID</span></button>
    <div class="msep"></div>
    <button class="mi danger" data-a="remover" data-v="${d.id}"><span class="l">${ic("trash", "s")}Remover da lista</span></button>
  </div>`;
}

/* ================= Janelas e abas ================= */
function minutos(t) {
  const m = Math.floor((Date.now() - t.ini) / 60000);
  return m < 1 ? "agora há pouco" : m === 1 ? "há 1 minuto" : `há ${m} minutos`;
}

function htmlAba(w, a) {
  const on = w.aba === a.k;
  const icone = a.conectando ? `<span class="tspin"></span>` : ic(a.tipo === "arquivos" ? "folder" : a.dev.os, "s");
  const extras = `${a.rec ? `<span class="trec" title="Gravando"></span>` : ""}${a.mudo ? `<span class="tmudo" title="Som desligado">${ic("soundoff", "s")}</span>` : ""}`;
  const prev = `<div class="prev"><div class="pv-thumb m${Math.min(a.mon || 1, 2)}">${a.tipo === "arquivos" ? ic("folder") : "<i></i>"}</div>
    <b>${esc(a.dev.nome)}</b><span>${a.tipo === "arquivos" ? "Transferência de arquivos" : "Acesso remoto"} · ${fmtId(a.dev.id)}</span>
    <span>${a.conectando ? "Conectando…" : `Conectado ${minutos(a)}`}${a.rec ? " · gravando" : ""}${a.mudo ? " · sem som" : ""}</span>${chipsDev(a.dev, 4)}</div>`;
  return `<div class="wtab ${on ? "on" : ""} ${a.fixa ? "fixa" : ""} ${arrasto_aba && arrasto_aba.k === a.k && arrasto_aba.ativo ? "arrastando" : ""}" role="tab" aria-selected="${on}" data-a="aba" data-v="${a.k}" data-tab="${a.k}">
    ${icone}${a.fixa ? "" : `<span class="n">${esc(a.dev.nome)}</span>`}${extras}
    ${a.fixa ? "" : `<span class="x" data-a="fecharAba" data-v="${a.k}" title="Fechar">${ic("x", "s")}</span>`}${prev}</div>`;
}

function janela(w) {
  const principal = w.id === "main";
  const t = abaAtiva(w);
  const focada = S.foco === w.id;
  const corpo = !t ? telaHome() : t.tipo === "arquivos" ? telaArquivos(t) : telaSessao(t);
  const home = principal ? `<div class="wtab inicio ${!t ? "on" : ""}" data-a="aba" data-v="home:main" title="Início"><span class="logo"></span><span class="n">AcessoFast</span></div>` : "";
  const nova = `<span class="rel"><button class="wnew" data-a="menu" data-v="nova:${w.id}" title="Novo acesso">+</button>
    ${S.menu === "nova:" + w.id ? `<div class="menu" style="left:0;top:34px;width:280px"><div class="mh">Novo acesso nesta janela</div>
      <form class="field sm" data-form="novaAba" data-win="${w.id}" style="margin:4px 6px 8px"><input id="nova-${w.id}" placeholder="ID do computador" inputmode="numeric" autocomplete="off"></form>
      ${listaDevs("recentes").filter((d) => d.online).slice(0, 4).map((d) => `<button class="mi" data-a="novaDe" data-v="${w.id}:${d.id}"><span class="l">${ic(d.os, "s")}${esc(d.nome)}</span><em>${fmtId(d.id)}</em></button>`).join("")}
    </div>` : ""}</span>`;
  const estilo = principal ? "" : `style="left:${w.x}px;top:${w.y}px;width:${w.w}px;height:${w.h}px"`;
  const cls = ["win", principal ? "" : "fwin", w.max ? "max" : "", focada ? "foco" : "", S.cheia && focada && t && t.tipo === "sessao" ? "cheia" : ""].join(" ");
  return `<div class="${cls}" data-win="${w.id}" ${principal ? 'id="win"' : ""} ${estilo}>
      <div class="titlebar" data-arrastar-janela="${principal ? "" : w.id}">
        <div class="tabsbar" data-bar="${w.id}" role="tablist">${home}${w.abas.map((a) => htmlAba(w, a)).join("")}${nova}</div>
        <div class="wctl"><i>—</i><i data-a="maximizar" data-v="${w.id}" title="${w.max ? "Restaurar" : "Maximizar"}">${w.max ? "❐" : "▢"}</i><i ${principal ? "" : `data-a="fecharJanela" data-v="${w.id}"`} title="Fechar">✕</i></div>
      </div>
      <div class="wbody">${corpo}${focada ? modal() : ""}</div>
      ${principal ? menuContexto() : ""}
      ${S.tabCtx && S.tabCtx.win === w.id ? menuAba() : ""}
    </div>`;
}

function menuAba() {
  const c = S.tabCtx;
  const w = W(c.win);
  const a = w.abas.find((x) => x.k === c.k);
  const i = w.abas.indexOf(a);
  return `<div class="menu" style="left:${c.x}px;top:${c.y}px">
    <button class="mi" data-a="abaAcao" data-v="novaJanela"><span class="l">${ic("full", "s")}Abrir em uma janela nova</span></button>
    ${w.id !== "main" ? `<button class="mi" data-a="abaAcao" data-v="principal"><span class="l">${ic("home", "s")}Mover para a janela principal</span></button>` : ""}
    <button class="mi" data-a="abaAcao" data-v="duplicar"><span class="l">${ic("copy", "s")}Duplicar</span></button>
    <button class="mi" data-a="abaAcao" data-v="fixar"><span class="l">${ic("star", "s")}${a.fixa ? "Desafixar" : "Fixar"}</span></button>
    <button class="mi" data-a="abaAcao" data-v="reconectar"><span class="l">${ic("refresh", "s")}Reconectar</span></button>
    ${a.tipo === "sessao" ? `<button class="mi" data-a="abaAcao" data-v="mudo"><span class="l">${ic(a.mudo ? "sound" : "soundoff", "s")}${a.mudo ? "Ligar o som" : "Desligar o som"}</span></button>` : ""}
    <div class="msep"></div>
    <button class="mi" data-a="abaAcao" data-v="fechar"><span class="l">${ic("x", "s")}Fechar</span><em>rodinha</em></button>
    <button class="mi" data-a="abaAcao" data-v="outras" ${w.abas.length < 2 ? "disabled" : ""}><span class="l">${ic("x", "s")}Fechar as outras abas</span></button>
    <button class="mi" data-a="abaAcao" data-v="direita" ${i === w.abas.length - 1 ? "disabled" : ""}><span class="l">${ic("x", "s")}Fechar as abas à direita</span></button>
  </div>`;
}

/* ================= Render ================= */
function render() {
  const foco = document.activeElement && document.activeElement.id;
  const pos = foco && document.activeElement.selectionStart;
  const [principal, ...extras] = S.wins;
  document.getElementById("app").innerHTML = `
    <div class="desk ${S.foco === "main" ? "foco" : ""}">${janela(principal)}</div>
    ${extras.map(janela).join("")}
    ${janelaRecebido()}
    ${S.toast ? `<div class="toast ${S.toast.erro ? "erro" : ""}">${ic(S.toast.erro ? "info" : "check", "s")}${esc(S.toast.t)}</div>` : ""}
    <div class="sim"><b>Simulador</b>
      <button data-a="simPedido">Alguém pede acesso</button>
      <button data-a="simSenha">Alguém entra com a senha</button>
      <button data-a="simMsg">Técnico manda mensagem</button>
      <span class="sp"></span>
      <span class="dim">Esta barra não faz parte do app.</span>
      <button data-a="simTema">Tema: ${S.tema === "claro" ? "claro" : S.tema === "escuro" ? "escuro" : "do Windows"}</button>
      <button data-a="simReset">Recomeçar</button>
    </div>`;
  if (foco) {
    const el = document.getElementById(foco);
    if (el) { el.focus(); try { if (pos != null) el.setSelectionRange(pos, pos); } catch { /* campo sem cursor */ } }
  }
  document.querySelectorAll(".msgs").forEach((m) => { m.scrollTop = m.scrollHeight; });
  ajustarEscala();
}


// Escala proporcional: o app foi desenhado para a janela padrão (1180 x 760). Maximizado, Início,
// Configurações e Arquivos crescem inteiros na mesma proporção, em vez de só esticar. A sessão remota
// fica de fora porque ela já se adapta sozinha.
const BASE_L = 1178, BASE_A = 719;
function ajustarEscala() {
  document.querySelectorAll(".wbody").forEach((corpo) => {
    const el = corpo.querySelector(":scope > .home, :scope > .ftwrap");
    if (!el) return;
    const l = corpo.clientWidth, a = corpo.clientHeight;
    let z = Math.min(l / BASE_L, a / BASE_A);
    z = z < 1.03 ? 1 : Math.min(z, 1.8);
    // No arranjo de tela larga o espaço já é usado pelas colunas; aumentar muito só apertaria tudo.
    const larga = l / Math.min(z, 1.1) >= 1320;
    if (larga) z = Math.min(z, 1.1);
    el.style.zoom = z === 1 ? "" : String(z);
    el.style.width = z === 1 ? "" : l / z + "px";
    el.style.height = z === 1 ? "" : a / z + "px";
    el.style.flex = z === 1 ? "" : "none";
    // Sobrando largura mesmo depois de crescer, a tela Início troca para o arranjo de tela larga.
    el.classList.toggle("larga", larga);
  });
}
addEventListener("resize", ajustarEscala);

let toastTimer;
function toast(t, erro = false) {
  S.toast = { t, erro };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { S.toast = null; render(); }, 2600);
  render();
}

/* ================= Ações ================= */
function abrir(dev, tipo, onde = {}) {
  S.menu = null; S.ctx = null;
  const existe = !onde.duplicar && todas().find((a) => a.dev.id === dev.id && a.tipo === tipo);
  if (existe) { focar(winDaAba(existe.k), existe.k); render(); return; }
  const w = W(onde.win) || W("main");
  const t = { k: "t" + seq++, tipo, dev, conectando: true, ini: Date.now() };
  if (tipo === "sessao") {
    if (w.id === "main") w.max = true;
    Object.assign(t, { mon: 1, tam: "ajustar", escala: 80, mudo: false, qual: "equilibrada", cursor: true, priv: false, bloqFim: false, clip: true, qind: true, codec: "Automática", kbd: "mapa", chat: false, msgs: [], rec: S.prefs.gravarAuto, recIni: Date.now(), tbOff: false, bloqIn: false, virtual: false });
  } else {
    Object.assign(t, {
      fs: { L: structuredClone(FS_LOCAL), R: structuredClone(FS_REMOTO) },
      L: { raiz: "C:\\Users\\Tecnico\\Downloads", path: "C:\\Users\\Tecnico\\Downloads", sel: [] },
      R: { raiz: "C:\\Sistema\\Instaladores", path: "C:\\Sistema\\Instaladores", sel: [] },
      fila: [],
    });
  }
  const i = onde.depoisDe ? w.abas.findIndex((a) => a.k === onde.depoisDe) + 1 : w.abas.length;
  w.abas.splice(i, 0, t);
  focar(w, t.k);
  if (!dev.rede) { dev.quando = "agora"; S.devs = [dev, ...S.devs.filter((d) => d !== dev)]; }
  render();
  setTimeout(() => { t.conectando = false; if (t.rec) toast("Gravação iniciada sozinha, como está nas configurações."); render(); }, 1300);
}

function pedirConexao(id, tipo, win) {
  const dig = soDigitos(id);
  if (!dig) return toast("Digite o ID do computador que você quer acessar.", true);
  if (dig.length < 8) return toast("O ID tem 9 números. Confira com a pessoa do outro lado.", true);
  if (dig === MEU_ID) return toast("Esse é o ID deste computador. Digite o ID do outro.", true);
  const d = devPorId(dig);
  if (d && !d.online) return toast(`${d.nome} está desligado ou sem internet agora.`, true);
  if (d) return abrir(d, tipo, { win });
  S.modal = { tipo: "senha", id: dig, destino: tipo, win, lembrar: true };
  render();
  document.getElementById("m-senha")?.focus();
}

function copiar(texto, msg) {
  navigator.clipboard?.writeText(texto).catch(() => {});
  toast(msg);
}

function enviarArquivos(t, de) {
  const para = de === "L" ? "R" : "L";
  const nomes = t[de].sel;
  if (!nomes.length) return toast(de === "L" ? "Selecione um arquivo deste computador primeiro." : "Selecione um arquivo do outro computador primeiro.", true);
  const itens = t.fs[de][t[de].path].filter((f) => nomes.includes(f.n));
  for (const f of itens) t.fila.push({ id: seq++, n: f.n, de, para, pct: 0, f, destino: t[para].path });
  t[de].sel = [];
  render();
  rodarFila(t);
}

let filaTimer = null;
function rodarFila() {
  if (filaTimer) return;
  filaTimer = setInterval(() => {
    let ativo = false;
    for (const t of todas().filter((a) => a.tipo === "arquivos")) {
      for (const q of t.fila) {
        if (q.pct >= 100) continue;
        ativo = true;
        q.pct = Math.min(100, q.pct + 2 + Math.random() * 7);
        const b = document.getElementById("qb-" + q.id);
        const p = document.getElementById("qp-" + q.id);
        if (b) b.style.width = q.pct + "%";
        if (p) p.textContent = q.pct >= 100 ? "Pronto" : Math.floor(q.pct) + "%";
        if (q.pct >= 100) {
          const lista = t.fs[q.para][q.destino] || (t.fs[q.para][q.destino] = []);
          if (!lista.some((f) => f.n === q.n)) lista.push({ ...q.f, dt: agora().replace(/^(\d+\/\d+) /, "$1 ") });
          S.transf.unshift({ nome: q.n, pc: t.dev.nome, dir: q.de === "L" ? "Enviado" : "Recebido", tam: q.f.s || "—", quando: agora() });
          if (t.fila.every((x) => x.pct >= 100)) toast(q.de === "L" ? `Enviado para ${t.dev.nome}.` : "Arquivo salvo neste computador.");
          else render();
        }
      }
    }
    if (!ativo) { clearInterval(filaTimer); filaTimer = null; }
  }, 110);
}

// Tira a aba da janela dela. Como no Chrome, a vizinha da direita assume; uma janela extra que fica vazia some.
function tirarAba(k) {
  const w = winDaAba(k);
  const i = w.abas.findIndex((a) => a.k === k);
  const [t] = w.abas.splice(i, 1);
  if (w.aba === k) {
    const viz = w.abas[i] || w.abas[i - 1];
    w.aba = viz ? viz.k : "home";
  }
  if (w.id !== "main" && !w.abas.length) {
    S.wins = S.wins.filter((x) => x !== w);
    if (S.foco === w.id) S.foco = "main";
  }
  return t;
}

// Coloca a aba na janela, respeitando que as fixas ficam sempre no começo.
function porAba(t, w, i) {
  const fixas = w.abas.filter((a) => a.fixa).length;
  const pos = t.fixa ? Math.min(i, fixas) : Math.max(i, fixas);
  w.abas.splice(Math.min(pos, w.abas.length), 0, t);
  focar(w, t.k);
}

function novaJanela(k, x, y) {
  const w0 = winDaAba(k);
  if (w0.id !== "main" && w0.abas.length === 1) { w0.x = x; w0.y = y; return; }
  const t = tirarAba(k);
  t.fixa = false;
  const w = { id: "w" + seq++, abas: [], aba: null, x, y, w: Math.min(900, innerWidth - 40), h: Math.min(560, innerHeight - 120), max: false };
  w.x = Math.max(8, Math.min(x, innerWidth - w.w - 8));
  w.y = Math.max(8, Math.min(y, innerHeight - w.h - 64));
  S.wins.push(w);
  porAba(t, w, 0);
}

function fecharAba(k, silencioso) {
  const t = todas().find((a) => a.k === k);
  if (!t) return;
  tirarAba(k);
  S.menu = null;
  if (t.tipo === "sessao") S.cheia = false;
  if (!silencioso && t.tipo === "sessao" && !t.conectando) toast(t.bloqFim ? `Acesso encerrado. ${t.dev.nome} foi bloqueado.` : `Acesso a ${t.dev.nome} encerrado.`);
  else render();
}

function msgChat(lista, texto, eu) {
  const d = new Date();
  lista.push({ t: texto, eu, h: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` });
}

const A = {
  view: (v) => { S.view = v; S.menu = null; if (["recentes", "favoritos", "rede"].includes(v)) S.lista = v; },
  lista: (v) => { S.lista = v; },
  layout: (v) => { S.layout = v; gravar("layout", v); },
  aba: (v) => {
    S.menu = null; S.tabCtx = null;
    if (v === "home:main") { focar(W("main"), "home"); return; }
    const w = winDaAba(v); if (w) focar(w, v);
  },
  fecharJanela: (v) => { const w = W(v); for (const a of [...w.abas]) fecharAba(a.k, true); toast("Janela fechada e acessos encerrados."); return false; },
  novaDe: (v) => { const [win, id] = v.split(":"); S.menu = null; pedirConexao(id, "sessao", win); return false; },
  abaAcao: (v) => {
    const c = S.tabCtx; S.tabCtx = null;
    const w = W(c.win); const a = w.abas.find((x) => x.k === c.k);
    if (!a) return;
    if (v === "novaJanela") { const r = document.querySelector(`[data-win="${w.id}"]`).getBoundingClientRect(); novaJanela(a.k, r.left + 60, r.top + 60); }
    if (v === "principal") { tirarAba(a.k); porAba(a, W("main"), W("main").abas.length); }
    if (v === "duplicar") { abrir(a.dev, a.tipo, { win: w.id, duplicar: true, depoisDe: a.k }); return false; }
    if (v === "fixar") { tirarAba(a.k); a.fixa = !a.fixa; if (!W(w.id)) S.wins.push(w); porAba(a, w, a.fixa ? 0 : w.abas.length); }
    if (v === "reconectar") { a.conectando = true; setTimeout(() => { a.conectando = false; render(); }, 1200); }
    if (v === "mudo") { a.mudo = !a.mudo; }
    if (v === "fechar") { fecharAba(a.k); return false; }
    if (v === "outras") { for (const x of w.abas.filter((x) => x !== a && !x.fixa)) fecharAba(x.k, true); }
    if (v === "direita") { const i = w.abas.indexOf(a); for (const x of w.abas.slice(i + 1)) fecharAba(x.k, true); }
  },
  pwvis: () => { S.pwVis = !S.pwVis; },
  copiar: (v) => copiar(v === "id" ? MEU_ID : SENHA, v === "id" ? "ID copiado." : "Senha copiada."),
  copiarIdDe: (v) => { S.ctx = null; copiar(v, "ID copiado."); },
  menu: (v) => { S.menu = S.menu === v ? null : v; },
  conectar: (v) => { S.ctx = null; pedirConexao(v, "sessao"); },
  conectarCampo: () => pedirConexao(S.destino, "sessao"),
  arquivosCampo: () => pedirConexao(S.destino, "arquivos"),
  abrirArquivos: (v) => { S.ctx = null; pedirConexao(v, "arquivos"); },
  maisOpc: (v) => { S.menu = null; toast(v === "camera" ? "Na versão real, abre a câmera do computador em uma aba nova." : "Na versão real, abre o terminal do computador em uma aba nova."); },
  fav: (v) => { const d = devPorId(v); d.fav = !d.fav; S.ctx = null; toast(d.fav ? `${d.nome} está nos favoritos.` : `${d.nome} saiu dos favoritos.`); },
  renomear: (v) => { S.ctx = null; S.modal = { tipo: "renomear", id: v }; },
  // marcadores
  marcDev: (v) => { S.ctx = null; S.menu = null; S.modal = { tipo: "marcDev", id: v, busca: "" }; setTimeout(() => document.getElementById("m-marc-busca")?.focus()); },
  marcToggle: (v) => { const d = devPorId(S.modal.id); d.marc = (d.marc || []).includes(v) ? d.marc.filter((x) => x !== v) : [...(d.marc || []), v]; },
  marcCriar: () => {
    const label = (S.modal.busca || "").trim();
    if (!label) return;
    const nv = { id: "novo" + seq++, label, color: corPara(label) };
    S.marcadores.push(nv);
    const d = devPorId(S.modal.id); d.marc = [...(d.marc || []), nv.id];
    S.modal.busca = "";
    toast(`Marcador “${label}” criado e aplicado.`); return false;
  },
  filtroMarc: (v) => { S.filtroMarc = S.filtroMarc.includes(v) ? S.filtroMarc.filter((x) => x !== v) : [...S.filtroMarc, v]; },
  limparFiltro: () => { S.filtroMarc = []; S.menu = null; },
  gerenciarMarc: () => { S.menu = null; S.modal = { tipo: "gerMarc" }; },
  criarMarcMenu: () => { S.menu = null; S.modal = { tipo: "gerMarc" }; setTimeout(() => document.getElementById("m-novo-marc")?.focus()); },
  novoCor: (v) => { S.modal.novoCor = v; },
  novoMarc: () => {
    const m = S.modal; const label = (m.novoNome || "").trim();
    if (!label) { m.erro = "Digite o nome do marcador."; setTimeout(() => document.getElementById("m-novo-marc")?.focus()); return; }
    if (S.marcadores.some((x) => x.label.toLowerCase() === label.toLowerCase())) { m.erro = `Já existe um marcador “${label}”.`; return; }
    S.marcadores.push({ id: "novo" + seq++, label, color: m.novoCor || corPara(label) });
    m.novoNome = ""; m.novoCor = null; m.erro = null;
    setTimeout(() => document.getElementById("m-novo-marc")?.focus());
    toast(`Marcador “${label}” criado.`); return false;
  },
  marcCor: (v) => { const x = marcPorId(v); x.color = CORES_MARC[(CORES_MARC.indexOf(x.color) + 1) % CORES_MARC.length]; },
  marcExcluir: (v) => { S.modal.confirmar = v || null; },
  marcExcluirOk: (v) => {
    const x = marcPorId(v);
    S.marcadores = S.marcadores.filter((m) => m !== x);
    for (const d of S.devs) d.marc = (d.marc || []).filter((m) => m !== v);
    S.filtroMarc = S.filtroMarc.filter((m) => m !== v);
    S.modal.confirmar = null;
    toast(`Marcador “${x.label}” excluído.`); return false;
  },
  remover: (v) => { S.ctx = null; S.modal = { tipo: "remover", id: v }; },
  fecharModal: () => { S.modal = null; },
  fundoModal: (_, el, ev) => { if (ev.target === el) S.modal = null; else return false; },
  mLembrar: () => { S.modal.lembrar = !S.modal.lembrar; },
  mSenhaOk: () => {
    const v = document.getElementById("m-senha").value;
    if (!v) { S.modal.erro = "Digite a senha para conectar."; return; }
    const m = S.modal; S.modal = null;
    const d = { id: m.id, nome: `Computador ${fmtId(m.id)}`, os: "win", online: true, quando: "agora" };
    S.devs.unshift(d); S.destino = "";
    abrir(d, m.destino, { win: m.win });
    return false;
  },
  mRenomearOk: () => { const v = document.getElementById("m-nome").value.trim(); if (v) devPorId(S.modal.id).nome = v; S.modal = null; toast("Nome salvo."); return false; },
  mRemoverOk: () => { const d = devPorId(S.modal.id); S.devs = S.devs.filter((x) => x !== d); S.modal = null; toast(`${d.nome} saiu da lista.`); return false; },
  mReiniciarOk: () => {
    const t = aba(); S.modal = null; t.conectando = true; t.msgConexao = `Aguardando ${t.dev.nome} reiniciar`;
    setTimeout(() => { t.conectando = false; t.msgConexao = null; toast(`${t.dev.nome} voltou.`); }, 3500);
  },
  mSenhaWinOk: () => { S.modal = null; toast("Senha digitada na tela de login."); return false; },

  // sessão
  fecharAba: (v) => { fecharAba(v); return false; },
  sessSet: (v) => { const [c, val] = v.split(":"); const t = aba(); t[c] = c === "mon" ? Number(val) : val; if (c === "kbd") S.menu = null; },
  sessTg: (v) => { const t = aba(); t[v] = !t[v]; if (v === "bloqIn") toast(t.bloqIn ? "O mouse e o teclado do cliente estão bloqueados." : "O cliente pode mexer de novo."); },
  codec: () => { const t = aba(); const ops = ["Automática", "VP9", "H.264", "H.265", "AV1"]; t.codec = ops[(ops.indexOf(t.codec) + 1) % ops.length]; },
  acao: (v) => {
    const t = aba(); S.menu = null;
    const msgs = { cad: "Ctrl + Alt + Del enviado.", bloquear: `${t.dev.nome} foi bloqueado.`, colar: "Texto colado no outro computador.", recarregar: "Imagem recarregada.", inverter: "Na versão real, o outro computador passa a controlar este." };
    if (v === "reiniciar") { S.modal = { tipo: "reiniciar" }; return; }
    if (v === "senhaWin") { S.modal = { tipo: "senhaWin" }; return; }
    if (v === "virtual") { t.virtual = !t.virtual; if (!t.virtual && t.mon === 3) t.mon = 1; toast(t.virtual ? "Tela virtual criada. Ela aparece como monitor 3." : "Tela virtual removida."); return false; }
    toast(msgs[v]); return false;
  },
  maximizar: (v) => { const w = W(v); w.max = !w.max; },
  mudo: () => { const t = aba(); t.mudo = !t.mudo; toast(t.mudo ? `Som de ${t.dev.nome} desligado.` : `Som de ${t.dev.nome} ligado.`); return false; },
  gravar: () => { const t = aba(); t.rec = !t.rec; t.recIni = Date.now(); toast(t.rec ? "Gravando o acesso." : "Gravação salva em Vídeos\\AcessoFast."); return false; },
  capturar: () => { const t = aba(); t.flash = true; setTimeout(() => { t.flash = false; }, 400); toast("Captura salva em Imagens\\AcessoFast."); return false; },
  cheia: () => {
    S.cheia = !S.cheia;
    if (S.cheia) document.documentElement.requestFullscreen?.().catch(() => {});
    else if (document.fullscreenElement) document.exitFullscreen?.();
  },

  // arquivos
  fsel: (v, el, ev) => {
    const t = aba(); const p = t[v]; const n = el.dataset.n;
    const outro = v === "L" ? "R" : "L"; t[outro].sel = [];
    if (ev.ctrlKey || ev.metaKey) p.sel = p.sel.includes(n) ? p.sel.filter((x) => x !== n) : [...p.sel, n];
    else p.sel = [n];
  },
  fsUp: (v) => { const t = aba(); const p = t[v]; if (p.path !== p.raiz) { p.path = p.path.slice(0, p.path.lastIndexOf("\\")); p.sel = []; } },
  enviar: (v) => { enviarArquivos(aba(), v); return false; },

  // configurações
  cfg: (v) => { S.cfg = v; },
  tema: (v) => { S.tema = v; gravar("tema", v); aplicarTema(); },
  pref: (v) => { S.prefs[v] = !S.prefs[v]; },
  permPad: (v) => { S.prefs.perms[v] = !S.prefs.perms[v]; },
  idioma: () => { const ops = ["Português (Brasil)", "English", "Español"]; S.prefs.idioma = ops[(ops.indexOf(S.prefs.idioma) + 1) % ops.length]; toast("No protótipo, só o nome do idioma muda."); return false; },
  pasta: () => { toast("Na versão real, abre a janela para escolher a pasta."); return false; },
  aviso: (v) => { S.menu = null; toast(v); return false; },

  // acesso recebido
  permitir: () => { const r = S.recebido; r.fase = "ativo"; r.ini = Date.now(); },
  recusar: () => { S.recebido = null; toast("Acesso recusado. O técnico foi avisado."); return false; },
  permRec: (v) => { S.recebido.perms[v] = !S.recebido.perms[v]; },
  recChat: () => { S.recebido.chat = !S.recebido.chat; S.recebido.min = false; },
  recMin: () => { S.recebido.min = !S.recebido.min; },
  encerrarRec: () => {
    const r = S.recebido; const s = Math.max(1, Math.round((Date.now() - r.ini) / 60000));
    r.fase = "fim"; r.resumo = s === 1 ? "1 minuto" : `${s} minutos`;
    setTimeout(() => { if (S.recebido === r) { S.recebido = null; render(); } }, 5000);
  },

  // simulador
  simPedido: () => { if (S.recebido?.fase === "ativo") return toast("Já tem um acesso em andamento. Encerre antes.", true); S.recebido = { fase: "pedido", perms: { ...S.prefs.perms, reiniciar: true, gravar: false }, msgs: [] }; },
  simSenha: () => { if (S.recebido?.fase === "ativo") return toast("Já tem um acesso em andamento.", true); S.recebido = { fase: "ativo", viaSenha: true, ini: Date.now(), perms: { ...S.prefs.perms, reiniciar: true, gravar: false }, msgs: [] }; },
  simMsg: () => {
    const r = S.recebido;
    if (!r || r.fase !== "ativo") return toast("Primeiro simule um acesso a este computador.", true);
    msgChat(r.msgs, "Olá! Vou atualizar o sistema, pode deixar o computador ligado?", false); r.chat = true; r.min = false;
  },
  simTema: () => { const ops = ["escuro", "claro", "sistema"]; A.tema(ops[(ops.indexOf(S.tema) + 1) % ops.length]); },
  simReset: () => { try { localStorage.removeItem("afp.tema"); localStorage.removeItem("afp.layout"); } catch { /* ok */ } location.reload(); return false; },
};

/* ================= Eventos ================= */
// Depois de soltar uma aba, o navegador ainda dispara um clique; ele é ignorado só nesse instante.
let engoleAte = 0;
document.addEventListener("click", (ev) => {
  if (Date.now() < engoleAte) { engoleAte = 0; ev.preventDefault(); return; }
  const el = ev.target.closest("[data-a]");
  const dentroMenu = ev.target.closest(".menu");
  if (!el) {
    if ((S.menu && !dentroMenu) || S.ctx || S.tabCtx) { S.menu = null; S.ctx = null; S.tabCtx = null; render(); }
    return;
  }
  const fn = A[el.dataset.a];
  if (!fn) return;
  if (S.menu && !dentroMenu && el.dataset.a !== "menu") S.menu = null;
  if (S.ctx && !dentroMenu) S.ctx = null;
  if (S.tabCtx && !dentroMenu) S.tabCtx = null;
  ev.preventDefault();
  ev.stopPropagation();
  if (fn(el.dataset.v, el, ev) !== false) render();
});

document.addEventListener("dblclick", (ev) => {
  const bar = ev.target.closest(".tabsbar");
  if (bar && !ev.target.closest("[data-tab], .wtab, .wnew, .menu")) { const w = W(bar.dataset.bar); w.max = !w.max; render(); return; }
  const el = ev.target.closest('.fr[data-dir="1"]');
  if (!el) return;
  const t = aba(); const L = el.dataset.v;
  t[L].path = t[L].path + "\\" + el.dataset.n; t[L].sel = [];
  render();
});

document.addEventListener("contextmenu", (ev) => {
  const tab = ev.target.closest("[data-tab]");
  if (tab) {
    ev.preventDefault();
    const w = winDaAba(tab.dataset.tab);
    const r = document.querySelector(`[data-win="${w.id}"]`).getBoundingClientRect();
    focar(w, tab.dataset.tab);
    S.menu = null; S.ctx = null;
    S.tabCtx = { k: tab.dataset.tab, win: w.id, x: Math.min(ev.clientX - r.left, r.width - 260), y: Math.min(ev.clientY - r.top, Math.max(40, r.height - 330)) };
    render();
    return;
  }
  const el = ev.target.closest("[data-dev]");
  if (!el) return;
  ev.preventDefault();
  const r = document.getElementById("win").getBoundingClientRect();
  S.ctx = { id: el.dataset.dev, x: Math.min(ev.clientX - r.left, r.width - 250), y: Math.min(ev.clientY - r.top, r.height - 260) };
  S.menu = null; S.tabCtx = null;
  render();
});

// Clique com a rodinha fecha a aba, como no navegador.
document.addEventListener("mousedown", (ev) => { if (ev.button === 1 && ev.target.closest("[data-tab]")) ev.preventDefault(); });
document.addEventListener("auxclick", (ev) => {
  const tab = ev.target.closest("[data-tab]");
  if (ev.button !== 1 || !tab) return;
  ev.preventDefault();
  fecharAba(tab.dataset.tab);
});

/* ---------- Arrastar abas e janelas ---------- */
let arrasto_aba = null;
let arrasto_janela = null;
let fantasma = null;

function mostrarFantasma(t, x, y) {
  if (!fantasma) {
    fantasma = document.createElement("div");
    fantasma.className = "fantasma";
    document.body.appendChild(fantasma);
  }
  fantasma.innerHTML = `<div class="fg-bar">${ic(t.tipo === "arquivos" ? "folder" : t.dev.os, "s")}<span>${esc(t.dev.nome)}</span></div><div class="fg-body m${Math.min(t.mon || 1, 2)}"><span>Solte para abrir numa janela nova</span></div>`;
  fantasma.style.transform = `translate(${x - 40}px, ${y - 14}px)`;
}
function esconderFantasma() { if (fantasma) { fantasma.remove(); fantasma = null; } }

document.addEventListener("pointerdown", (ev) => {
  if (ev.button !== 0) return;
  // Qualquer clique numa janela traz ela para frente, sem redesenhar (senão o clique se perde).
  const winEl = ev.target.closest("[data-win]");
  if (winEl && S.foco !== winEl.dataset.win) {
    S.foco = winEl.dataset.win;
    document.querySelectorAll("[data-win]").forEach((e) => e.classList.toggle("foco", e === winEl));
    document.querySelector(".desk").classList.toggle("foco", S.foco === "main");
  }
  const tab = ev.target.closest("[data-tab]");
  if (tab && !ev.target.closest(".x")) {
    arrasto_aba = { k: tab.dataset.tab, x0: ev.clientX, y0: ev.clientY, ativo: false };
    return;
  }
  const barra = ev.target.closest("[data-arrastar-janela]");
  if (barra && barra.dataset.arrastarJanela && !ev.target.closest(".wtab, .wnew, .wctl, .menu")) {
    const w = W(barra.dataset.arrastarJanela);
    if (w.max) return;
    arrasto_janela = { w, dx: ev.clientX - w.x, dy: ev.clientY - w.y, el: barra.closest("[data-win]") };
  }
});

document.addEventListener("pointermove", (ev) => {
  if (arrasto_janela) {
    const j = arrasto_janela;
    j.w.x = Math.max(-j.w.w + 120, Math.min(ev.clientX - j.dx, innerWidth - 120));
    j.w.y = Math.max(0, Math.min(ev.clientY - j.dy, innerHeight - 100));
    j.el.style.left = j.w.x + "px";
    j.el.style.top = j.w.y + "px";
    return;
  }
  const d = arrasto_aba;
  if (!d) return;
  if (!d.ativo && Math.hypot(ev.clientX - d.x0, ev.clientY - d.y0) < 6) return;
  const t = todas().find((a) => a.k === d.k);
  if (!t) { arrasto_aba = null; return; }
  if (!d.ativo) { d.ativo = true; document.body.classList.add("arrastando-aba"); S.menu = null; S.tabCtx = null; render(); }
  if (fantasma) fantasma.style.display = "none";
  const sob = document.elementFromPoint(ev.clientX, ev.clientY);
  const bar = sob && sob.closest("[data-bar]");
  if (bar) {
    esconderFantasma();
    d.fora = false;
    const destino = W(bar.dataset.bar);
    // Posição = quantas abas (sem contar a arrastada) têm o centro à esquerda do ponteiro.
    const outras = [...bar.querySelectorAll("[data-tab]")].filter((e) => e.dataset.tab !== d.k);
    let i = 0;
    for (const e of outras) { const r = e.getBoundingClientRect(); if (ev.clientX > r.left + r.width / 2) i++; }
    const origem = winDaAba(d.k);
    const iAtual = origem.abas.findIndex((a) => a.k === d.k);
    if (origem !== destino || iAtual !== i) {
      tirarAba(d.k);
      porAba(t, destino, i);
      render();
    }
  } else {
    d.fora = true;
    mostrarFantasma(t, ev.clientX, ev.clientY);
    fantasma.style.display = "";
  }
});

document.addEventListener("pointerup", (ev) => {
  if (arrasto_janela) { arrasto_janela = null; return; }
  const d = arrasto_aba;
  arrasto_aba = null;
  if (!d || !d.ativo) return;
  engoleAte = Date.now() + 300;
  document.body.classList.remove("arrastando-aba");
  esconderFantasma();
  if (d.fora) novaJanela(d.k, ev.clientX - 60, ev.clientY - 18);
  render();
});

document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") {
    if (S.modal || S.menu || S.ctx) { S.modal = null; S.menu = null; S.ctx = null; render(); }
    return;
  }
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches('[role="button"][data-a]')) { ev.preventDefault(); ev.target.click(); }
});

document.addEventListener("input", (ev) => {
  const k = ev.target.dataset.escala;
  if (k) {
    const t = todas().find((a) => a.k === k);
    t.escala = Number(ev.target.value);
    document.getElementById("rmon-" + k).style.width = Math.round(19.2 * t.escala) + "px";
    document.getElementById("escala-v-" + k).textContent = t.escala + "%";
    return;
  }
  if (ev.target.id === "m-marc-busca") { S.modal.busca = ev.target.value; render(); return; }
  if (ev.target.id === "m-novo-marc") { S.modal.novoNome = ev.target.value; S.modal.erro = null; render(); return; }
  if (ev.target.id === "destino") {
    S.destino = soDigitos(ev.target.value).slice(0, 10);
    const f = fmtId(S.destino);
    if (ev.target.value !== f) { ev.target.value = f; ev.target.setSelectionRange(f.length, f.length); }
  }
});

document.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const f = ev.target.dataset.form;
  if (f === "conectar") return pedirConexao(S.destino, "sessao");
  if (f === "novoMarc") { if (A.novoMarc() !== false) render(); return; }
  if (f === "marcCriar") {
    // Enter: aplica o marcador que bate exatamente com o texto, ou cria um novo.
    const b = (S.modal.busca || "").trim().toLowerCase();
    const x = S.marcadores.find((m) => m.label.toLowerCase() === b);
    if (x) { A.marcToggle(x.id); S.modal.busca = ""; render(); } else A.marcCriar();
    return;
  }
  if (f === "novaAba") { const win = ev.target.dataset.win; const v = document.getElementById("nova-" + win).value; S.menu = null; return pedirConexao(v, "sessao", win); }
  if (f === "senha") { if (A.mSenhaOk() !== false) render(); return; }
  if (f === "renomear") return A.mRenomearOk();
  if (f === "senhaWin") return A.mSenhaWinOk();
  if (f === "chatSessao") {
    const t = aba(); const inp = document.getElementById("chat-" + t.k); const v = inp.value.trim();
    if (!v) return;
    msgChat(t.msgs, v, true); render();
    setTimeout(() => { msgChat(t.msgs, "Tudo certo, pode mexer. Estou acompanhando aqui.", false); render(); }, 1500);
  }
  if (f === "chatRec") {
    const r = S.recebido; const v = document.getElementById("chat-rec").value.trim();
    if (!v) return;
    msgChat(r.msgs, v, true); render();
    setTimeout(() => { if (S.recebido === r) { msgChat(r.msgs, "Combinado, obrigado!", false); render(); } }, 1500);
  }
});

// Arrastar arquivos entre os lados
let arrasto = null;
document.addEventListener("dragstart", (ev) => {
  const el = ev.target.closest(".fr");
  if (!el) return;
  const t = aba(); const L = el.dataset.v;
  if (!t[L].sel.includes(el.dataset.n)) t[L].sel = [el.dataset.n];
  arrasto = L;
  ev.dataTransfer.effectAllowed = "copy";
  ev.dataTransfer.setData("text/plain", el.dataset.n);
});
document.addEventListener("dragover", (ev) => {
  const p = ev.target.closest("[data-pane]");
  if (!p || !arrasto || p.dataset.pane === arrasto) return;
  ev.preventDefault();
  document.querySelectorAll(".pane.drop").forEach((x) => x !== p && x.classList.remove("drop"));
  p.classList.add("drop");
});
document.addEventListener("dragleave", (ev) => { const p = ev.target.closest("[data-pane]"); if (p && !p.contains(ev.relatedTarget)) p.classList.remove("drop"); });
document.addEventListener("drop", (ev) => {
  const p = ev.target.closest("[data-pane]");
  if (!p || !arrasto || p.dataset.pane === arrasto) return;
  ev.preventDefault();
  const de = arrasto; arrasto = null;
  enviarArquivos(aba(), de);
});
document.addEventListener("dragend", () => { arrasto = null; document.querySelectorAll(".pane.drop").forEach((x) => x.classList.remove("drop")); });

document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && S.cheia) { S.cheia = false; render(); } });

// Relógios: acesso recebido e gravação
setInterval(() => {
  const r = S.recebido;
  const tm = document.getElementById("rec-tm");
  if (r && r.fase === "ativo" && tm) tm.textContent = dur(Date.now() - r.ini);
  for (const t of todas()) {
    const e = document.getElementById("rec-" + t.k);
    if (e && t.rec) e.textContent = dur(Date.now() - t.recIni);
  }
}, 1000);

aplicarTema();
// Atalho de teste: abrir com #sessao já entra num acesso.
if (location.hash === "#sessao") abrir(S.devs[0], "sessao");
if (location.hash === "#max") W("main").max = true;
if (location.hash === "#marcadores") S.modal = { tipo: "gerMarc", novoNome: "Plantão sábado", novoCor: "violet" };
if (location.hash === "#abas") {
  abrir(S.devs[0], "sessao"); abrir(S.devs[1], "sessao"); abrir(S.devs[3], "arquivos"); abrir(S.devs[4], "sessao");
  const t = W("main").abas[0]; t.fixa = true; t.mudo = true; W("main").abas[1].rec = true;
  novaJanela(W("main").abas[3].k, 380, 260);
}
render();

// Renomear marcador na janela Gerenciar: salva ao sair do campo ou apertar Enter.
document.addEventListener("change", (ev) => {
  const id = ev.target.dataset && ev.target.dataset.mk;
  if (!id) return;
  const x = marcPorId(id); const v = ev.target.value.trim();
  if (!v) { ev.target.value = x.label; return; }
  if (v !== x.label) { x.label = v; toast("Marcador renomeado."); }
});
document.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && ev.target.dataset && ev.target.dataset.mk) ev.target.blur(); });
