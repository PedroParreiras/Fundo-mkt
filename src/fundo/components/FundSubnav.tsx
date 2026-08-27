import type { FundView } from '../types'

const TABS: { id: FundView; label: string }[] = [
  { id: 'store', label: '🛍️ Loja do Fundo' },
  { id: 'schedule', label: '🗓️ Cronograma' },
  { id: 'orders', label: '📦 Meus Pedidos' },
]

interface FundSubnavProps {
  view: FundView
  ordersCount: number
  onChange: (view: FundView) => void
}

export function FundSubnav({ view, ordersCount, onChange }: FundSubnavProps) {
  return (
    <div className="fund-subnav">
      {TABS.map((t) => (
        <button key={t.id} className={`fsub ${view === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          {t.label}
          {t.id === 'orders' && <span className="fsub-badge">{ordersCount}</span>}
        </button>
      ))}
    </div>
  )
}
