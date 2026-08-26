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
- `src/App.tsx` — rotas (default `/dashboard`)
- `src/index.css` — design system do HRM (tokens, navbar, cards, grids)
- `src/fundo-mkt-fx.css` — camada aditiva `.fm-*` de animação/FX

## Deploy

Ainda **não** publicado: o slug `fundo-mkt` não está nas listas de `location`
do `/etc/nginx/sites-enabled/behonest`, não há entrada no mapa de slugs do
`deploy_queue` e não há tile/rota no hub `/system`. Para publicar é preciso
(1) adicionar o slug nas 4 regex de submódulo do nginx, (2) registrar o slug no
runner de deploy e (3) criar o card no hub com a flag `can_access_*`
correspondente.
