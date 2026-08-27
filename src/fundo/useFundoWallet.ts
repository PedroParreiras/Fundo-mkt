import { useCallback, useMemo, useRef, useState } from 'react'
import { findStore } from './catalog'
import { etaLabel, todayBR } from './format'
import {
  FUND_CONTRIB,
  FUND_HISTORY_SEED,
  FUND_ORDERS_SEED,
  FUND_ORDER_SEQ_SEED,
  FUND_SPENT_SEED,
} from './seed'
import type { FundHistoryEntry, FundItem, FundOrder, FundOrderStatus } from './types'

export const FO_STATUS: Record<FundOrderStatus, { label: string; cls: string; next: FundOrderStatus | null }> = {
  prep: { label: 'Em preparação', cls: 'st-prep', next: 'trans' },
  trans: { label: 'A caminho', cls: 'st-trans', next: 'done' },
  done: { label: 'Entregue', cls: 'st-done', next: null },
}

/** Seleção do checkout: id da loja -> quantidade. */
export type StoreSelection = Record<string, number>

function buildOrderStores(selection: StoreSelection) {
  return Object.keys(selection).map((sid) => ({ name: findStore(sid).name, qty: selection[sid] }))
}

/**
 * Carteira do fundo: saldo, resgatado, histórico e pedidos.
 * Estado 100% em memória (mock do protótipo) — trocar por API quando o
 * backend do fundo existir.
 */
export function useFundoWallet() {
  const [spent, setSpent] = useState(FUND_SPENT_SEED)
  const [history, setHistory] = useState<FundHistoryEntry[]>(FUND_HISTORY_SEED)
  const [orders, setOrders] = useState<FundOrder[]>(FUND_ORDERS_SEED)
  const seq = useRef(FUND_ORDER_SEQ_SEED)

  const balance = useMemo(() => FUND_CONTRIB - spent, [spent])

  /** Debita a carteira e abre o pedido. Devolve false se não couber no saldo. */
  const redeem = useCallback(
    (item: FundItem, selection: StoreSelection): boolean => {
      const stores = buildOrderStores(selection)
      const units = stores.reduce((a, s) => a + s.qty, 0)
      const total = units * item.price
      if (units === 0 || total > FUND_CONTRIB - spent) return false

      const plural = stores.length > 1 ? 's' : ''
      // Id fora do updater: em StrictMode o updater roda 2x e pularia um número.
      const id = `FM-${seq.current++}`
      setSpent((s) => s + total)
      setHistory((h) => [
        { t: 'out', desc: `Resgate · ${item.name} (${units} un · ${stores.length} loja${plural})`, date: todayBR(), val: total },
        ...h,
      ])
      setOrders((o) => [
        { id, emoji: item.emoji, name: item.name, date: todayBR(), stores, units, total, status: 'prep', eta: etaLabel(item) },
        ...o,
      ])
      return true
    },
    [spent],
  )

  /** "Simular avanço" do protótipo: prep → trans → done. Devolve o novo rótulo. */
  const advanceOrder = useCallback(
    (id: string): string | null => {
      const order = orders.find((o) => o.id === id)
      const next = order ? FO_STATUS[order.status].next : null
      if (!next) return null
      setOrders((list) =>
        list.map((o) =>
          o.id === id ? { ...o, status: next, eta: next === 'done' ? `Entregue em ${todayBR()}` : o.eta } : o,
        ),
      )
      return FO_STATUS[next].label
    },
    [orders],
  )

  return { contrib: FUND_CONTRIB, spent, balance, history, orders, redeem, advanceOrder }
}
