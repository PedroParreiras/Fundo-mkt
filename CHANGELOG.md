# Changelog — Fundo-mkt

Mais recente primeiro. A visão atual está em `AGENT_README.md`.

## 2026-11-06 · Financeiro › Controle financeiro (no escuro)

Sub-aba nova do Financeiro (gestor): mini fluxo de caixa por franqueado, inspirado no
Lead time › Por fornecedor do marketplace. Nasce DESLIGADA — chave `controleFinanceiro`
(`FUNDO_MKT_CONTROLE_FIN=on` no auth/.env; `src/lib/useChave.ts` + `GET /api/fundo-mkt/chaves`).

- Dropdowns: franqueado (ou "Todos") e competência. KPIs = posição até o fim do mês: saldo
  acumulado, gasto da carteira, a reembolsar, reembolsado.
- Todos: uma linha por carteira, "Extrato →" abre o franqueado. Um franqueado: fluxo mês a mês
  (entrou, gastou, reembolso pedido, reembolsado, a reembolsar, saldo acumulado) e os lançamentos
  do mês escolhido.
- Decisões do usuário (06/11): reembolso nasce do pedido **Documento** do app e reserva o saldo
  ao nascer; o pagamento (chave PIX + "pago") virá da aba Reembolso, que ainda não existe — até lá
  `reembolsado` = 0. Gasto inclui o reembolso.
- `Kpi` saiu do `ValoresTab` para `pages/financeiro/Kpi.tsx` (usado pelas duas abas).
