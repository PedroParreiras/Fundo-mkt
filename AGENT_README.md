# Fundo MKT — nota para agentes

App do fundo de marketing (arrecadação × investimento por loja/franqueado).
Estado atual: **scaffold** — só `/dashboard` com cards placeholder, nenhuma
chamada de API real, nenhum schema de banco próprio.

Regras deste repo:
- Design system vem de `src/index.css` (cópia sincronizada do HRM). Ao editar o
  bloco `PLATFORM THEMES`, sincronize com as outras cópias nos sub-apps.
- FX/animações ficam em `src/fundo-mkt-fx.css` com prefixo `.fm-*` (aditivo, não
  briga com estilos inline).
- Sessão/HTTP sempre por `src/lib/api.ts` (nunca `fetch` solto).
- Build: `npm run build` → `dist/` com base `/system/fundo-mkt/`.
- Ao terminar uma entrega: commit + push imediato (o deploy faz
  `git reset --hard origin` e apagaria commit local).

Pendências de plataforma (fora deste repo): slug no nginx, slug no deploy
runner, tile no hub `/system` e flag `can_access_*` no backend `auth`.
