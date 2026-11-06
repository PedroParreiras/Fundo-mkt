import { brl } from '../../fundo/format'
import type { ControleLinha } from '../../fundo/types'
import { EstadoVazio } from '../shared'

/** Todos os franqueados na posição do mês — uma linha cada; "Extrato" abre o
 *  fluxo de caixa dele (mesmo efeito do dropdown). */
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
          <tr><th>Franqueado</th><th>Entrou</th><th>Gasto</th><th>A reembolsar</th>
            <th>Reembolsado</th><th>Saldo</th><th /></tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.usuario_id}>
              <td>
                <div className="td-nome">{l.franqueado}</div>
                <div className="td-sub">{l.nome} · {l.email}{l.na_cobranca ? '' : ' · fora da cobrança'}</div>
              </td>
              <td className="num" data-label="Entrou">{brl(l.entrou)}</td>
              <td className="num" data-label="Gasto">{brl(l.gasto)}</td>
              <td className="num" data-label="A reembolsar">{brl(l.a_reembolsar)}</td>
              <td className="num" data-label="Reembolsado">{brl(l.reembolsado)}</td>
              <td className="num" data-label="Saldo"><b>{brl(l.saldo)}</b></td>
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
