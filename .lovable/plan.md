# Plano — Site Acessofast (Landing + Captura de Leads)

## Escopo desta primeira versão
Página única responsiva, PT-BR, estilo Apple claro com azul, integrada ao Supabase existente "ASP remoto" para INSERT anônimo em `leads`. Sem criar/alterar tabelas. Sem ler `leads` de volta.

## Design system (src/styles.css)
- Tokens exatos fornecidos (bg #F5F7FA, primary #2D6DF6, success #22C55E, radius 16/12, shadow-soft, etc.) mapeados em `@theme inline` para virar utilitários Tailwind v4 (`bg-primary`, `text-muted`, `rounded-card`, `shadow-soft`).
- Fontes via `<link>` no `head()` do `__root.tsx`: **Manrope** (400/500/600/700/800) e **JetBrains Mono** (400/600). Registradas em `--font-sans` e `--font-mono`.
- Header fixo com `backdrop-blur` + borda hairline; cards brancos com sombra grande e suave; toggles/CTAs cantos 12px.
- Transições spring contidas (ease-out ~200-300ms), sem quica.
- Ícones: `lucide-react` (linha fina, strokeWidth 1.5).

## Estrutura de arquivos
- `src/routes/__root.tsx` — meta PT-BR ("Acessofast — Acesso remoto e suporte de TI soberano"), fontes, og/twitter.
- `src/routes/index.tsx` — monta a landing.
- `src/components/site/` — `Header.tsx`, `Hero.tsx`, `TrustBar.tsx`, `Features.tsx`, `Differentiators.tsx`, `HowItWorks.tsx`, `Pricing.tsx`, `Faq.tsx`, `LeadForm.tsx`, `Footer.tsx`.
- `src/lib/leads.ts` — função `insertLead(payload)` usando o client browser `@/integrations/supabase/client` (INSERT direto, RLS anônimo permite só INSERT).
- Placeholders visuais enquanto você não envia assets: wordmark textual "Acessofast" em Manrope 700, ilustração de herói substituída por um bloco visual abstrato (grid/mesh sutil em CSS) marcado com `data-placeholder` para troca depois.

## Seções (topo → base)
1. **Header fixo** — logo "Acessofast", nav (Recursos, Diferenciais, Preço, FAQ), CTA "Falar com especialista" (rola ao form `#contato`).
2. **Hero** — headline: "Acesso remoto e suporte de TI, sem surpresa no custo." Subheadline curta. CTA primário "Solicitar demonstração" (→ `#contato`) + secundário "Ver recursos" (→ `#recursos`). Visual de fundo em vidro/mesh.
3. **Barra de confiança** — 5 slots placeholder para logos + 3 selos ("Dados em região brasileira", "LGPD-ready", "Suporte em PT-BR").
4. **Recursos** (`#recursos`) — 9 cards: acesso não assistido, multi-monitor, transferência de arquivos, gravação de sessão, address book, auditoria/logs, 2FA, apps mobile, reconexão pós-reboot.
5. **Diferenciais** (`#diferenciais`) — 4 blocos: custo transparente por assento; sem policiamento de uso comercial; soberania de dados/LGPD; foco Brasil.
6. **Como funciona** — 3 passos numerados.
7. **Preço/posicionamento** (`#preco`) — sem tabela; bloco explicando modelo por assento + CTA "Receber proposta".
8. **FAQ** (`#faq`) — acordeão (shadcn Accordion) com 5 perguntas cobrindo segurança, LGPD, cobrança, migração, requisitos.
9. **CTA final + Formulário** (`#contato`) — ver abaixo.
10. **Footer** — nav, contato, link para Política de Privacidade (rota `/privacidade` como placeholder com texto curto).

## Formulário de captura
- Componente controlado por `useState` (sem `<form onSubmit>` HTML nativo; botão `onClick`), validação com **zod** + `react-hook-form` (já disponíveis via shadcn) OU zod puro se preferir simplicidade — vou usar `react-hook-form + zodResolver` porque o template já traz.
- Campos: `nome`, `empresa`, `email` (email corporativo), `telefone`, `tecnicos` (select: "1" | "2-5" | "6-20" | "20+"), `segmento` (select: "MSP" | "Clinica" | "TI interno" | "Outro"), `mensagem` (opcional), `consentimento_lgpd` (checkbox obrigatório) com link para `/privacidade`.
- Estados: idle / loading (botão com spinner, desabilitado) / success (troca o card por mensagem "Recebemos seus dados. Nosso time entra em contato em breve.") / error (toast `sonner` + mensagem inline amigável).
- **INSERT**: `supabase.from('leads').insert({ nome, empresa, email, telefone, tecnicos, segmento, mensagem, consentimento_lgpd: true })`. Não faz `.select()` de volta (RLS bloqueia leitura anônima — esperado).
- Se o INSERT falhar por schema divergente (coluna inexistente), o toast mostra mensagem genérica e eu te aviso para conferir nomes das colunas.

## Regras técnicas / o que NÃO farei
- Não crio nem altero tabelas, não mexo em RLS, não gero migration.
- Não uso Edge Functions nem server functions — o INSERT vai direto do browser com a anon key (é o padrão para form de lead com RLS `INSERT` anônimo).
- Não invento copy fora do escopo dado; textos serão curtos, originais, em PT-BR, focados nos pontos-chave.
- Não uso imagens da web; apenas placeholder visual em CSS até você entregar os assets.
- Header fixo com `backdrop-filter: blur(...)` escrito só na forma padrão (Lightning CSS adiciona prefixos).

## Aviso sobre autenticação
Esta landing é 100% pública; não requer login. Como a única escrita é o INSERT anônimo em `leads`, você precisa garantir no Supabase que existe policy `INSERT` `TO anon` na tabela `leads` (você disse que o schema/RLS já estão prontos — só confirmando: se o INSERT der 401/403, é essa policy que falta).

## Entregável
Ao aprovar, implemento tudo acima em um único lote de edições, priorizando hero, diferenciais e formulário funcional.
