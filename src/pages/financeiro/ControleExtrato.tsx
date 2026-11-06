import { brl, mesCurto } from '../../fundo/format'
import type { ControleDetalhe, ControleLancamento, ControleMes } from '../../fundo/types'
import { EstadoVazio } from '../shared'

const TIPO_LABEL: Record<ControleLancamento['tipo'], string> = {
  credito: 'Entrada',
  resgate: 'Ação do catálogo',
  reembolso: 'Reembolso',
}

/** Fluxo de caixa da carteira em ordem cronológica (o saldo se acumula de
 *  cima para baixo); o mês escolhido fica destacado. */
function TabelaFluxo({ meses, competencia }: { meses: ControleMes[]; competencia: string }) {
  return (
    <div className="ger-table-wrap">
      <table className="ger-table">
        <thead>
          <tr>
            <th>Mês</th>
            <th title="Crédito do fundo (85% do boleto pago) + lançamento manual, no mês da competência">Entrou</th>
            <th title="Tudo que saiu da carteira no mês do pedido: ações do catálogo e reembolsos (recusado não entra)">Gastou</th>
            <th title="Parte do gasto do mês que é reembolso (pedido Documento)">Reembolso pedido</th>
            <th title="Pago ao franqueado no mês">Reembolsado</th>
            <th title="Reembolso ainda não pago, no fim do mês">A reembolsar</th>
            <th title="Entrou − gastou, acumulado até o fim do mês">Saldo acumulado</th>
          </tr>
        </thead>
        <tbody>
          {meses.map((m) => (
            <tr key={m.mes} className={m.mes === competencia ? 'row-on' : ''}>
              <td><b>{mesCurto(m.mes)}</b></td>
              <td className="num">{brl(m.entrou)}</td>
              <td className="num">{brl(m.gasto)}</td>
              <td className="num">{brl(m.reembolso)}</td>
              <td className="num">{brl(m.reembolsado)}</td>
              <td className="num">{brl(m.a_reembolsar)}</td>
              <td className="num"><b>{brl(m.saldo)}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LinhaLancamento({ l }: { l: ControleLancamento }) {
  const entrada = l.tipo === 'credito'
  return (
    <tr>
      <td>
        <div className="td-nome">{l.descricao}</div>
        <div className="td-sub">{[l.codigo, TIPO_LABEL[l.tipo]].filter(Boolean).join(' · ')}</div>
      </td>
      <td data-label="Data">{l.data}</td>
      <td data-label="Situação">
        <span className={l.tipo === 'reembolso' ? 'fin-alerta' : 'td-sub'}>{l.situacao}</span>
        {l.tipo === 'reembolso' && l.etapa && <div className="td-sub">{l.etapa}</div>}
      </td>
      <td className="num" data-label="Valor">
        <span className={entrada ? 'fin-entrada' : 'fin-saida'}>{entrada ? '+' : '−'} {brl(l.valor)}</span>
      </td>
    </tr>
  )
}

function Lancamentos({ itens, competencia }: { itens: ControleLancamento[]; competencia: string }) {
  if (!itens.length) {
    return <EstadoVazio icone="🧾" titulo={`Sem lançamentos em ${mesCurto(competencia)}`}
      texto="O saldo vem dos meses anteriores." />
  }
  return (
    <div className="ger-table-wrap">
      <table className="ger-table ger-table--cards">
        <thead><tr><th>Lançamento</th><th>Data</th><th>Situação</th><th>Valor</th></tr></thead>
        <tbody>{itens.map((l, i) => <LinhaLancamento key={`${l.tipo}-${l.codigo ?? i}`} l={l} />)}</tbody>
      </table>
    </div>
  )
}

/** Um franqueado: fluxo mês a mês + o extrato do mês escolhido. */
export function ControleExtrato({ detalhe, competencia }: { detalhe: ControleDetalhe; competencia: string }) {
  return (
    <>
      <div className="ger-panel-title fin-secao">
        Fluxo mês a mês
        <span className="fin-secao-sub">{detalhe.nome} · {detalhe.email}{detalhe.na_cobranca ? '' : ' · fora da cobrança'}</span>
      </div>
      <TabelaFluxo meses={detalhe.meses} competencia={competencia} />

      <div className="ger-panel-title fin-secao">Lançamentos de {mesCurto(competencia)}</div>
      <Lancamentos itens={detalhe.lancamentos} competencia={competencia} />
    </>
  )
}
