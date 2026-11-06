# Changelog — Fundo-mkt

Mais recente primeiro. A visão atual está em `AGENT_README.md`.

## 2026-11-06 · Controle financeiro: competência por mês, todos os meses ou período

Pedido do usuário depois da prévia: escolher um mês mostrava a planilha inteira.
- Competência agora tem "Todos os meses", "Período específico…" (abre De / Até) e cada mês; um mês mostra só
  a coluna dele (sem Total). Filtros em `ControleFiltros.tsx`; API `financeiroControle(usuarioId, de, ate)`.
- KPIs, lista por franqueado e lançamentos seguem o período; saldo = no fim do período.
- Planilha do tamanho do conteúdo (um mês não estica a 1ª coluna pela tela). Saiu o destaque de coluna
  (`col-on`), que não tem mais sentido. `periodoCurto` em `fundo/format.ts`.

## 2026-11-06 · Controle financeiro em planilha; reembolso só quando pago

Ajustes do usuário depois da prévia em HTML:
- O fluxo virou **planilha de fluxo de caixa**: linhas = saldo inicial, entradas (crédito do fundo, lançamento
  manual), saídas (ações do catálogo, reembolso ao franqueado), resultado e saldo final; colunas = meses + Total
  (`ControlePlanilha`). "Todos" mostra a planilha da rede somada + a lista por franqueado.
- **Reembolso só entra quando confirmado**: sai "A reembolsar" (KPI, coluna e situação). KPIs: Saldo, Entradas,
  Gasto em ações, Reembolsado.
- **Entradas em verde, saídas em vermelho** (KPI, planilha, extrato e lista); zero fica neutro.
- `ControleExtrato` saiu; entraram `ControlePlanilha` e `ControleLancamentos`. `valorBR` em `fundo/format.ts`;
  `Kpi` ganhou `tom`.

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
