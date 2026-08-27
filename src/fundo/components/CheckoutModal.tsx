import { useMemo, useState } from 'react'
import { FUND_STORES } from '../catalog'
import { brl, etaLabel, modeLabel } from '../format'
import type { FundItem } from '../types'
import type { StoreSelection } from '../useFundoWallet'
import { Modal } from './Modal'
import { Stepper } from './Stepper'

interface CheckoutModalProps {
  /** null = modal fechada. */
  item: FundItem | null
  balance: number
  onClose: () => void
  onConfirm: (selection: StoreSelection) => void
}

/** Primeira loja já vem marcada, como no protótipo.
 *  O estado é remontado a cada ação porque a página passa `key={item.id}`. */
const initialSelection = (): StoreSelection => ({ [FUND_STORES[0].id]: 1 })

export function CheckoutModal({ item, balance, onClose, onConfirm }: CheckoutModalProps) {
  const [selection, setSelection] = useState<StoreSelection>(initialSelection)

  const totals = useMemo(() => {
    const units = Object.values(selection).reduce((a, b) => a + b, 0)
    return { units, price: units * (item?.price ?? 0), lojas: Object.keys(selection).length }
  }, [selection, item])

  const toggleStore = (id: string) =>
    setSelection(({ [id]: current, ...rest }) => (current ? rest : { ...rest, [id]: 1 }))

  const setQty = (id: string, qty: number) =>
    setSelection((sel) => (sel[id] ? { ...sel, [id]: qty } : sel))

  if (!item) return null
  const afford = totals.price <= balance && totals.units > 0

  return (
    <Modal open title="Resgatar ação" subtitle="Escolha as lojas e a quantidade" variant="co" onClose={onClose}>
      <div className="co-item">
        <div className="co-thumb" style={{ background: item.tint }}>{item.emoji}</div>
        <div>
          <div className="co-nm">{item.name}</div>
          <div className="co-unit">{brl(item.price)} / unidade · debitado da carteira</div>
        </div>
      </div>

      <div className="co-sec-t">Para quais lojas?</div>
      <div className="co-stores">
        {FUND_STORES.map((s) => {
          const on = !!selection[s.id]
          return (
            <div className={`co-store ${on ? 'on' : ''}`} key={s.id}>
              <button className="co-check" onClick={() => toggleStore(s.id)} aria-pressed={on}>{on ? '✓' : ''}</button>
              <div className="co-store-info" onClick={() => toggleStore(s.id)}>
                <div className="co-store-nm">{s.name}</div>
                <div className="co-store-ci">{s.city}</div>
              </div>
              <Stepper value={selection[s.id] ?? 1} disabled={!on} onChange={(q) => setQty(s.id, q)} />
            </div>
          )
        })}
      </div>

      <div className="co-summary">
        <div className="co-row">
          <span className="mut">{totals.units} unidade(s) · {totals.lojas} loja(s)</span>
          <span>{brl(totals.price)}</span>
        </div>
        <div className="co-row">
          <span className="mut">Saldo após o resgate</span>
          <span>{brl(Math.max(0, balance - totals.price))}</span>
        </div>
        <div className="co-row total"><span>Total</span><span>{brl(totals.price)}</span></div>
      </div>

      <div className="co-eta">
        🚚 <div><b>{modeLabel(item)}:</b> {etaLabel(item)}</div>
      </div>

      {!afford && totals.units > 0 && (
        <div className="co-warn">Saldo insuficiente para essa quantidade. Ajuste as lojas ou a quantidade.</div>
      )}
      {totals.units === 0 && <div className="co-warn">Selecione ao menos uma loja.</div>}

      <div className="co-foot">
        <button
          className="btn btn-accent btn-block btn-lg"
          disabled={!afford}
          onClick={() => onConfirm(selection)}
        >
          Confirmar resgate · {brl(totals.price)}
        </button>
      </div>
    </Modal>
  )
}
