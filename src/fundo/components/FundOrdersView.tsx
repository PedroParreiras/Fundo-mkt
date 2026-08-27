import { brl } from '../format'
import type { FundOrder } from '../types'
import { FO_STATUS } from '../useFundoWallet'

interface FundOrdersViewProps {
  orders: FundOrder[]
  onAdvance: (id: string) => void
  onGoToStore: () => void
}

/** Pedidos resgatados do fundo, com o botão de simular avanço do protótipo. */
export function FundOrdersView({ orders, onAdvance, onGoToStore }: FundOrdersViewProps) {
  if (!orders.length) {
    return (
      <div className="empty">
        <div className="ei">📦</div>
        <div className="et">Você ainda não resgatou nenhuma ação</div>
        <div className="ed">Vá até a Loja do Fundo e escolha uma ação para começar.</div>
        <button className="btn btn-primary" onClick={onGoToStore}>Ir para a loja</button>
      </div>
    )
  }

  return (
    <>
      {orders.map((o) => {
        const st = FO_STATUS[o.status]
        return (
          <div className="fo-card" key={o.id}>
            <div className="fo-top">
              <div className="fo-thumb" style={{ background: '#EEF2F7' }}>{o.emoji}</div>
              <div>
                <div className="fo-nm">{o.name}</div>
                <div className="fo-meta">Pedido {o.id} · {o.date} · {o.units} unidade(s)</div>
              </div>
              <div className={`fo-status ${st.cls}`}>{st.label}</div>
            </div>
            <div className="fo-body">
              <div className="fo-stores">
                {o.stores.map((s) => (
                  <span className="fo-store-tag" key={s.name}>{s.name} · {s.qty} un</span>
                ))}
              </div>
              <div className="fo-right">
                <div className="fo-total">{brl(o.total)}</div>
                <div className="fo-eta">{o.eta}</div>
                {st.next && (
                  <button className="fo-adv" onClick={() => onAdvance(o.id)}>Simular avanço →</button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
