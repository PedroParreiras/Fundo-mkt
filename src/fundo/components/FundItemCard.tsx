import { findCat } from '../catalog'
import { brl } from '../format'
import { tileGradient } from '../tile'
import type { FundItem } from '../types'

interface FundItemCardProps {
  item: FundItem
  onSelect: (id: string) => void
}

/** Card de ação da vitrine do fundo. */
export function FundItemCard({ item, onSelect }: FundItemCardProps) {
  return (
    <div className="pcard">
      <div className="thumb" style={{ background: tileGradient(item.id) }}>
        <span className="cat-tag">{findCat(item.cat).name}</span>
        {item.emoji}
      </div>
      <div className="pbody">
        <div className="pname">{item.name}</div>
        <div className="pdesc">{item.desc}</div>
        <div className="pprice-row">
          <span className="pprice">{brl(item.price)}</span>
          <small>/ unidade</small>
        </div>
        <div className="pcard-foot">
          <button className="btn btn-primary btn-block" onClick={() => onSelect(item.id)}>
            Selecionar ação
          </button>
        </div>
      </div>
    </div>
  )
}
