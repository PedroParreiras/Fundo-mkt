import type { FundHistoryEntry, FundOrder } from './types'

/** Estado inicial da carteira — mock do protótipo, ainda sem backend. */
export const FUND_CONTRIB = 4820
export const FUND_SPENT_SEED = 540
export const FUND_ORDER_SEQ_SEED = 1043

export const FUND_HISTORY_SEED: FundHistoryEntry[] = [
  { t: 'out', desc: 'Resgate · Kit de comunicação mensal (3 lojas)', date: '05/07/2026', val: 540 },
  { t: 'in', desc: 'Contribuição · 1% de julho', date: '01/07/2026', val: 1100 },
  { t: 'in', desc: 'Contribuição · 1% de junho', date: '01/06/2026', val: 1300 },
  { t: 'in', desc: 'Contribuição · 1% de maio', date: '01/05/2026', val: 1240 },
  { t: 'in', desc: 'Contribuição · 1% de abril', date: '01/04/2026', val: 1180 },
]

export const FUND_ORDERS_SEED: FundOrder[] = [
  {
    id: 'FM-1042', emoji: '🪧', name: 'Kit de comunicação mensal', date: '05/07/2026',
    stores: [
      { name: 'Cond. Alphaville', qty: 1 },
      { name: 'Cond. Vila da Serra', qty: 1 },
      { name: 'Ed. Buritis Class', qty: 1 },
    ],
    units: 3, total: 540, status: 'done', eta: 'Entregue em 12/07/2026',
  },
]
