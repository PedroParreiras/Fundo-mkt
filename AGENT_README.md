# Fundo MKT — nota para agentes

App do fundo de marketing (arrecadação × investimento por loja/franqueado).
Estado atual: **aba "Fundo de Marketing" do protótipo do Hub portada 1:1** —
tela única em `/fundo`, dados ainda **mock em memória** (nenhuma chamada de API,
nenhum schema de banco próprio).

## O que existe

`src/pages/FundoMarketing.tsx` monta a tela e orquestra 3 sub-abas (estado
local, sem rota própria — igual ao protótipo):

| Sub-aba | Componente | O quê |
|---|---|---|
| 🛍️ Loja do Fundo | `fundo/components/FundStoreView` | vitrine de ações por categoria + chips |
| 🗓️ Cronograma | `fundo/components/FundScheduleView` | campanhas do ano com ações recomendadas |
| 📦 Meus Pedidos | `fundo/components/FundOrdersView` | resgates + "simular avanço" prep→trans→done |

Camada de dados/estado em `src/fundo/`:
- `catalog.ts` / `schedule.ts` / `seed.ts` — **mock**, trocar por API
- `types.ts` — contratos (`FundItem`, `FundOrder`, `FundHistoryEntry`…)
- `format.ts` — `brl`, datas BR, `etaLabel` (o prazo muda por `mode`)
- `useFundoWallet.ts` — saldo/resgatado/histórico/pedidos + `redeem()`/`advanceOrder()`
- `useToast.ts` — toast do protótipo

## Regras deste repo

- Design system vem de `src/index.css` (cópia sincronizada do HRM). Ao editar o
  bloco `PLATFORM THEMES`, sincronize com as outras cópias nos sub-apps.
- FX/animações ficam em `src/fundo-mkt-fx.css` com prefixo `.fm-*` (aditivo).
- **`src/styles/fundo-proto.css` é CSS portado do protótipo, não redesenhado.**
  Tudo escopado sob `.fundo-app` porque o protótipo usa nomes genéricos
  (`.btn`, `.chip`, `.modal-overlay`, `.empty`) que colidem com o design system
  do HRM. O arquivo também neutraliza o `button:hover{transform}` global do
  `index.css`. Ao mexer no visual, altere lá — não redesenhe a partir da tela.
- A paleta do protótipo é clara e fixa (`--navy/--bg` locais), independente do
  `hrm_theme`. Consciente: é uma porta 1:1 do mockup.
- Sessão/HTTP sempre por `src/lib/api.ts` (nunca `fetch` solto).
- Build: `npm run build` → `dist/` com base `/system/fundo-mkt/`.
  `npm run preview` NÃO funciona (o `base` do config só vale em `build`); use
  `npm run dev`.
- Ao terminar uma entrega: commit + push imediato (o deploy faz
  `git reset --hard origin` e apagaria commit local).

## Próximo passo (backend)

Nada aqui persiste. Para virar produto é preciso: endpoint de carteira
(saldo/contribuições), catálogo de ações, e resgate (POST que debita e abre o
pedido) — `useFundoWallet` é o único ponto a trocar.

Pendências de plataforma (fora deste repo): slug no nginx, slug no deploy
runner, tile no hub `/system` e flag `can_access_*` no backend `auth`.
