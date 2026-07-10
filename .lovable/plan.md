# Plano — Integrar a marca Acessofast

Recebi a logo oficial (mockup do monitor com "A" e setas, wordmark "AcessoFast" + tagline "CONECTOU. RESOLVEU."). Vou integrá-la ao site já construído.

## Ações

1. **Upload da logo como asset CDN**
   - `lovable-assets create` a partir de `/mnt/user-uploads/Captura_de_Tela_2026-07-09_às_22.51.42.png` → gera `src/assets/acessofast-logo.png.asset.json`.
   - Uso a logo completa (monitor + wordmark) nos lugares grandes; para o header (compacto) uso a mesma imagem em altura reduzida — a logo funciona bem enxuta.

2. **Favicon**
   - Gero uma versão quadrada e centrada no ícone do monitor com `imagegen--edit_image` (crop no símbolo, fundo branco) → `public/favicon.png`.
   - Removo `public/favicon.ico` (padrão Lovable) e atualizo `<link rel="icon">` em `src/routes/__root.tsx` para `/favicon.png`.

3. **Header (`src/components/site/Header.tsx`)**
   - Substituir o placeholder (quadrado azul "A" + texto) por `<img>` da logo completa, altura ~32px, mantendo boa legibilidade tanto no estado transparente quanto no `glass` (após scroll). Alt text: "Acessofast".

4. **Hero (`src/components/site/Hero.tsx`)**
   - Adicionar a tagline oficial **"Conectou. Resolveu."** como eyebrow acima do headline (substitui o badge "Plataforma brasileira · LGPD-ready", que passa para a barra de confiança). Fica em caps espaçadas, cor primary, coerente com o tratamento da logo.
   - Mantenho o restante do hero visual como está.

5. **Footer (`src/components/site/Footer.tsx`)**
   - Trocar o placeholder textual pela logo completa (altura ~40px), mantendo o parágrafo "produto da ASP Softwares".

6. **Meta social (og:image opcional)**
   - Como a logo tem letras pequenas e proporção não-social (não é 1200×630), **não** vou usá-la como `og:image` por padrão — ficaria com muito espaço vazio nas laterais. Se você quiser, num próximo passo eu gero uma versão social (1200×630) com a logo centrada sobre o mesh azul do site.

## O que NÃO vou mexer
- Não altero paleta, tipografia nem estrutura das outras seções.
- Não uso a logo como imagem decorativa gigante no hero (a marca fala melhor no header/footer + eyebrow com tagline).
- Não crio/altero tabelas Supabase.

Confirmando o plano, aplico as mudanças em um único lote.
