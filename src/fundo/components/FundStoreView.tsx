import { FUND_CATS, FUND_ITEMS } from '../catalog'
import { FundItemCard } from './FundItemCard'

interface FundStoreViewProps {
  /** Id da categoria ativa, ou 'all'. */
  activeCat: string
  onCatChange: (id: string) => void
  onSelectItem: (id: string) => void
}

/** Vitrine: chips de categoria + um grupo de cards por categoria. */
export function FundStoreView({ activeCat, onCatChange, onSelectItem }: FundStoreViewProps) {
  const cats = FUND_CATS.filter((c) => activeCat === 'all' || c.id === activeCat)

  return (
    <>
      <div className="toolbar">
        <div className="chips">
          <div className={`chip ${activeCat === 'all' ? 'active' : ''}`} onClick={() => onCatChange('all')}>
            Todas as categorias
          </div>
          {FUND_CATS.map((c) => (
            <div key={c.id} className={`chip ${activeCat === c.id ? 'active' : ''}`} onClick={() => onCatChange(c.id)}>
              <span className="dot" style={{ background: c.color }} />
              {c.name}
            </div>
          ))}
        </div>
      </div>

      <div>
        {cats.map((c) => {
          const items = FUND_ITEMS.filter((i) => i.cat === c.id)
          return (
            <div className="sup-group" key={c.id}>
              <div className="sup-head">
                <div className="sup-logo" style={{ background: c.color }}>{c.short}</div>
                <div>
                  <div className="sup-name">{c.name}</div>
                  <div className="sup-tag">{c.tag}</div>
                </div>
                <div className="sup-count">{items.length} ações</div>
              </div>
              <div className="pgrid">
                {items.map((it) => <FundItemCard key={it.id} item={it} onSelect={onSelectItem} />)}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
