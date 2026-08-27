# Fundo MKT — Be Honest

Vite + React 19 + TypeScript app do fundo de marketing Be Honest, servido em
`/system/fundo-mkt/` atrás do nginx (root `/` no dev). Submódulo do HRM-Beta em
`1.0 Honesty/honesty/sub repositories/Fundo-mkt`.

Carrega o design system canônico do HRM (`src/index.css`), a navbar compartilhada
(`src/components/Layout.tsx`), a fonte Poppins e o logo/favicon Be Honest —
mesmo look & feel das outras ferramentas `/system/*` (marketplace, logística,
financeiro, planograma…).

## Dev

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build -> dist/  (base /system/fundo-mkt/)
npm run lint
```

## Auth

Reaproveita a sessão do HRM: `auth_token` / `user` do `localStorage` na origem
`behonest.com.br`. `src/lib/api.ts` anexa `Authorization: Bearer` e joga para
`/system/login` em 401/403.

## Layout

- `src/main.tsx` — `BrowserRouter basename="/system/fundo-mkt"` (derivado de `BASE_URL`)
- `src/App.tsx` — rotas (default `/fundo`)
- `src/pages/FundoMarketing.tsx` — a tela do fundo (3 sub-abas)
- `src/fundo/` — dados mock, tipos, formatação e o hook da carteira
- `src/index.css` — design system do HRM (tokens, navbar, cards, grids)
- `src/fundo-mkt-fx.css` — camada aditiva `.fm-*` de animação/FX
- `src/styles/fundo.css` — estilo da tela (tokens `--mkt-*`), escopado em `.fundo-app`

## Tela do fundo

Estrutura e conteúdo vieram da aba **"💰 Fundo de Marketing"** do protótipo
`mockup-hub-fundo-marketing.html` (Hub de Abastecimento) — só essa aba; o resto
do hub (marketplace, carrinho, pedidos, estoque CD, pedidos loja) ficou de fora.
A topbar de abas do protótipo virou a navbar padrão do HRM, e o **visual segue a
vitrine do marketplace**: mesmos tokens `--mkt-*`, então o botão de tema da
navbar alterna claro/escuro aqui igual nas outras ferramentas `/system`.

- **Loja do Fundo** — ações por categoria (Tração / Recorrência / Branding Local),
  card com preço por unidade e checkout de resgate (escolhe lojas + quantidade,
  valida saldo, mostra a previsão conforme o modo Entrega/Ativação/Evento).
- **Cronograma** — campanhas do ano por trimestre, com as ações recomendadas
  clicáveis (abrem o mesmo checkout).
- **Meus Pedidos** — resgates feitos, com "simular avanço" (Em preparação → A
  caminho → Entregue).
- **Carteira** — saldo clicável abre o histórico (contribuições × resgates).

> Os dados são **mock em memória** (`src/fundo/catalog.ts`, `schedule.ts`,
> `seed.ts`), como no protótipo: nada persiste ao recarregar a página.

## Deploy

Ainda **não** publicado: o slug `fundo-mkt` não está nas listas de `location`
do `/etc/nginx/sites-enabled/behonest`, não há entrada no mapa de slugs do
`deploy_queue` e não há tile/rota no hub `/system`. Para publicar é preciso
(1) adicionar o slug nas 4 regex de submódulo do nginx, (2) registrar o slug no
runner de deploy e (3) criar o card no hub com a flag `can_access_*`
correspondente.
