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
- `src/App.tsx` — rotas (default `/fundo`) + gate de acesso
- `src/pages/` — `Loja`, `Cronograma`, `Pedidos` e `Gerenciar` (gestor)
- `src/fundo/` — contexto de dados, tipos, formatação e componentes
- `src/lib/api.ts` — cliente de `/api/fundo-mkt/*` · `src/lib/session.ts` — sessão/papel
- `src/index.css` — design system do HRM (tokens, navbar, cards, grids)
- `src/fundo-mkt-fx.css` — camada aditiva `.fm-*` de animação/FX
- `src/styles/fundo.css` — estilo da tela (tokens `--mkt-*`), escopado em `.fundo-app`

## Telas

Quatro rotas na navbar (o "Gerenciar" só aparece para admin/manager):

- **Loja do Fundo** (`/fundo`) — carteira + ações por categoria (Tração /
  Recorrência / Branding Local) e o resgate (escolhe lojas + quantidade, valida
  saldo, mostra a previsão conforme o modo Entrega/Ativação/Evento).
- **Cronograma** (`/cronograma`) — campanhas do ano por trimestre, com as ações
  recomendadas clicáveis (abrem o mesmo resgate).
- **Pedidos** (`/pedidos`) — os pedidos **do usuário logado**, com a esteira
  Solicitação → Conferência → Solicitado → Disponível e a data de cada etapa.
- **Gerenciar** (`/gerenciar`, **só admin/manager**) — **Produtos**:
  cria/edita/desativa as ações (nome, preço, categoria, descrição, emoji **ou
  imagem**, modo e prazo). **Campanhas**: monta o cronograma do ano e escolhe
  quais ações entram em cada data. **Carteiras**: saldo de cada usuário e o
  lançamento manual de contribuição. **Pedidos**: todos os pedidos, filtro por
  etapa, avanço da esteira e a recusa com motivo.

### Categorias

Tração, Recorrência e Branding Local têm preço de tabela. **Boleto ou Nota
Fiscal** não: o franqueado informa o valor, anexa o documento (PDF ou imagem) e
o pedido passa pela Conferência — o gestor aprova ou recusa com um motivo, e a
recusa devolve o valor pra carteira.

> O banco nasce **vazio**: sem catálogo e sem saldo. O gestor cadastra as ações
> e credita as carteiras pelo Gerenciar.

## Backend

Schema `fundo_mkt` no `sales_db` e `/api/fundo-mkt/*` no Flask do HRM
(`auth/routes/fundo_mkt.py`). Ver `AGENT_README.md` para as regras de negócio
e a documentação completa no Swagger (grupo "Fundo de Marketing").

## Deploy

Ainda **não** publicado: o slug `fundo-mkt` não está nas listas de `location`
do `/etc/nginx/sites-enabled/behonest`, não há entrada no mapa de slugs do
`deploy_queue` e não há tile/rota no hub `/system`. Para publicar é preciso
(1) adicionar o slug nas 4 regex de submódulo do nginx, (2) registrar o slug no
runner de deploy e (3) criar o card no hub com a flag `can_access_*`
correspondente.
