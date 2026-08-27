import { brl } from '../format'
import { catMeta } from '../meta'
import { tileGradient } from '../tile'
import type { Acao } from '../types'

interface FundItemCardProps {
  acao: Acao
  onSelect: (acao: Acao) => void
}

/** Card de ação da vitrine. */
export function FundItemCard({ acao, onSelect }: FundItemCardProps) {
  return (
    <div className="pcard">
      <div className="thumb" style={{ background: tileGradient(acao.slug) }}>
        <span className="cat-tag">{catMeta(acao.categoria).name}</span>
        {acao.emoji}
      </div>
      <div className="pbody">
        <div className="pname">{acao.nome}</div>
        <div className="pdesc">{acao.descricao}</div>
        <div className="pprice-row">
          <span className="pprice">{brl(acao.preco)}</span>
          <small>/ unidade</small>
        </div>
        <div className="pcard-foot">
          <button className="btn btn-primary btn-block" onClick={() => onSelect(acao)}>
            Selecionar ação
          </button>
        </div>
      </div>
    </div>
  )
}
