import { brl } from '../format'
import { CATEGORIA_DOCUMENTO, catMeta } from '../meta'
import type { Acao } from '../types'
import { AcaoThumb } from './AcaoThumb'

interface FundItemCardProps {
  acao: Acao
  onSelect: (acao: Acao) => void
}

/** Card de ação da vitrine. */
export function FundItemCard({ acao, onSelect }: FundItemCardProps) {
  return (
    <div className="pcard">
      <AcaoThumb acao={acao}>
        <span className="cat-tag">{catMeta(acao.categoria).name}</span>
      </AcaoThumb>
      <div className="pbody">
        <div className="pname">{acao.nome}</div>
        <div className="pdesc">{acao.descricao}</div>
        <div className="pprice-row">
          {acao.categoria === CATEGORIA_DOCUMENTO ? (
            // Sem preço de tabela: quem define o valor é o documento anexado.
            <span className="pprice-doc">Valor do documento</span>
          ) : (
            <>
              <span className="pprice">{brl(acao.preco)}</span>
              <small>/ unidade</small>
            </>
          )}
        </div>
        <div className="pcard-foot">
          <button className="btn btn-primary btn-block" onClick={() => onSelect(acao)}>
            {acao.categoria === CATEGORIA_DOCUMENTO ? 'Enviar documento' : 'Selecionar ação'}
          </button>
        </div>
      </div>
    </div>
  )
}
