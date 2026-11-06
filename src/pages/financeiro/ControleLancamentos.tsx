import { brl } from '../../fundo/format'
import type { ControleLancamento } from '../../fundo/types'
import { EstadoVazio } from '../shared'

const TIPO_LABEL: Record<ControleLancamento['tipo'], string> = {
  credito: 'Crédito do fundo (85%)',
  manual: 'Lançamento manual',
  acao: 'Ação do catálogo',
  reembolso: 'Reembolso ao franqueado',
}

const ehEntrada = (l: ControleLancamento) => l.tipo === 'credito' || l.tipo === 'manual'

function LinhaLancamento({ l }: { l: ControleLancamento }) {
  const entrada = ehEntrada(l)
  return (
    <tr>
      <td>
        <div className="td-nome">{l.descricao}</div>
        <div className="td-sub">{[l.codigo, TIPO_LABEL[l.tipo], l.etapa].filter(Boolean).join(' · ')}</div>
      </td>
      <td data-label="Data">{l.data}</td>
      <td className="num" data-label="Valor">
        <span className={entrada ? 'fin-entrada' : 'fin-saida'}>{entrada ? '+' : '−'} {brl(l.valor)}</span>
      </td>
    </tr>
  )
}

/** Extrato do período: o que entrou e o que saiu da carteira. */
export function ControleLancamentos({ itens, rotulo }: { itens: ControleLancamento[]; rotulo: string }) {
  if (!itens.length) {
    return <EstadoVazio icone="🧾" titulo={`Sem lançamentos em ${rotulo}`}
      texto="O saldo vem dos meses anteriores." />
  }
  return (
    <div className="ger-table-wrap">
      <table className="ger-table ger-table--cards">
        <thead><tr><th>Lançamento</th><th>Data</th><th>Valor</th></tr></thead>
        <tbody>{itens.map((l, i) => <LinhaLancamento key={`${l.tipo}-${l.codigo ?? i}`} l={l} />)}</tbody>
      </table>
    </div>
  )
}
