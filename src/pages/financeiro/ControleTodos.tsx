import { brl } from '../../fundo/format'
import type { ControleLinha } from '../../fundo/types'
import { EstadoVazio } from '../shared'

/** Valor colorido só quando há movimento: zero fica neutro. */
function Valor({ v, tom }: { v: number; tom: 'entrada' | 'saida' }) {
  if (!v) return <span className="td-sub">{brl(0)}</span>
  return <span className={`fin-${tom}`}>{tom === 'saida' ? '− ' : ''}{brl(v)}</span>
}

/** Todos os franqueados na posição do mês — uma linha cada; "Extrato" abre a
 *  planilha dele (mesmo efeito do dropdown). */
export function ControleTodos({ linhas, onEscolher }: {
  linhas: ControleLinha[]
  onEscolher: (usuarioId: number) => void
}) {
  if (!linhas.length) {
    return <EstadoVazio icone="👛" titulo="Nenhuma carteira ainda"
      texto="Aparece quando o franqueado conectado recebe o primeiro crédito." />
  }
  return (
    <div className="ger-table-wrap">
      <table className="ger-table ger-table--cards">
        <thead>
          <tr><th>Franqueado</th><th>Entradas</th><th>Ações</th><th>Reembolsos</th><th>Saldo</th><th /></tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.usuario_id}>
              <td>
                <div className="td-nome">{l.franqueado}</div>
                <div className="td-sub">{l.nome} · {l.email}{l.na_cobranca ? '' : ' · fora da cobrança'}</div>
              </td>
              <td className="num" data-label="Entradas"><Valor v={l.entradas} tom="entrada" /></td>
              <td className="num" data-label="Ações"><Valor v={l.acoes} tom="saida" /></td>
              <td className="num" data-label="Reembolsos"><Valor v={l.reembolsos} tom="saida" /></td>
              <td className="num" data-label="Saldo"><b className={l.saldo < 0 ? 'fin-saida' : ''}>{brl(l.saldo)}</b></td>
              <td className="acoes-col">
                <button type="button" className="link-btn" onClick={() => onEscolher(l.usuario_id)}>Extrato →</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
