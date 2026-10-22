import { REGIAO_NOME, REGIOES, type Region } from '../../lib/region'
import type { PrecoDraft } from '../acaoDraft'

interface PrecosRegiaoFieldProps {
  precos: Record<Region, PrecoDraft>
  /** Categoria `documento`: o valor vem do boleto/NF, então só se escolhe onde aparece. */
  semPreco: boolean
  onChange: (r: Region, v: PrecoDraft) => void
}

/** "Onde vende e por quanto": a mesma ação em MG · GO · ES, cada uma com o
 *  seu preço. Desmarcar tira de venda ali — o preço fica guardado no backend. */
export function PrecosRegiaoField({ precos, semPreco, onChange }: PrecosRegiaoFieldProps) {
  return (
    <div className="fld fld-wide" role="group" aria-labelledby="reg-precos-titulo">
      <span id="reg-precos-titulo">
        {semPreco ? 'Regiões em que aparece' : 'Regiões e preço por unidade (R$)'}
      </span>
      <div className="reg-precos">
        {REGIOES.map((r) => {
          const p = precos[r]
          return (
            <div key={r} className={`reg-preco ${p.ativo ? 'on' : ''}`}>
              <label className="reg-preco-head">
                <input type="checkbox" checked={p.ativo}
                  onChange={(e) => onChange(r, { ...p, ativo: e.target.checked })} />
                <span className="reg-uf">{r}</span>
                <span className="reg-nome">{REGIAO_NOME[r]}</span>
              </label>
              {semPreco ? (
                <div className="fld-static">Valor do documento</div>
              ) : (
                <input type="number" min={0} step="0.01" inputMode="decimal"
                  aria-label={`Preço em ${REGIAO_NOME[r]}`} placeholder="180,00"
                  value={p.preco} disabled={!p.ativo}
                  onChange={(e) => onChange(r, { ...p, preco: e.target.value })} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
