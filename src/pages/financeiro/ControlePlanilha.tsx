import { mesCurto, valorBR } from '../../fundo/format'
import type { ControleMes } from '../../fundo/types'

type Campo = Exclude<keyof ControleMes, 'mes'>
/** entrada = verde · saída = vermelho · sinal = verde/vermelho pelo sinal · neutro = sem cor */
type Tom = 'entrada' | 'saida' | 'sinal' | 'neutro'
type Tipo = 'item' | 'total' | 'resultado' | 'saldo'

interface Linha { campo: Campo; label: string; tom: Tom; tipo: Tipo; title?: string }

/** Linhas da planilha, de cima para baixo. A regra de cada número fica no `title`. */
const BLOCOS: { titulo?: string; linhas: Linha[] }[] = [
  { linhas: [{ campo: 'saldo_inicial', label: 'Saldo inicial', tom: 'neutro', tipo: 'saldo' }] },
  { titulo: 'Entradas', linhas: [
    { campo: 'credito_fundo', label: 'Crédito do fundo (85%)', tom: 'entrada', tipo: 'item',
      title: '85% do boleto do fundo pago, no mês da competência' },
    { campo: 'lancamento_manual', label: 'Lançamento manual', tom: 'entrada', tipo: 'item' },
    { campo: 'entradas', label: 'Total de entradas', tom: 'entrada', tipo: 'total' },
  ] },
  { titulo: 'Saídas', linhas: [
    { campo: 'acoes', label: 'Ações do catálogo', tom: 'saida', tipo: 'item',
      title: 'Resgates não recusados, no mês do pedido' },
    { campo: 'reembolsos', label: 'Reembolso ao franqueado', tom: 'saida', tipo: 'item',
      title: 'Entra só quando o pagamento é confirmado, no mês do pagamento' },
    { campo: 'saidas', label: 'Total de saídas', tom: 'saida', tipo: 'total' },
  ] },
  { linhas: [
    { campo: 'resultado', label: 'Resultado do mês', tom: 'sinal', tipo: 'resultado' },
    { campo: 'saldo', label: 'Saldo final', tom: 'neutro', tipo: 'saldo' },
  ] },
]

/** Coluna Total: fluxos somam; saldo inicial é o do 1º mês e saldo final o do último. */
function total(meses: ControleMes[], campo: Campo): number {
  if (campo === 'saldo_inicial') return meses[0]?.saldo_inicial ?? 0
  if (campo === 'saldo') return meses[meses.length - 1]?.saldo ?? 0
  return meses.reduce((s, m) => s + m[campo], 0)
}

function classeDoValor(v: number, tom: Tom): string {
  if (v === 0 || tom === 'neutro') return v < 0 ? 'fin-saida' : ''
  if (tom === 'sinal') return v > 0 ? 'fin-entrada' : 'fin-saida'
  return `fin-${tom}`
}

function textoDoValor(v: number, tom: Tom, tipo: Tipo): string {
  if (v === 0 && tipo === 'item') return '—'
  if (tom === 'saida' && v > 0) return `− ${valorBR(v)}`
  if (tom === 'sinal' && v !== 0) return `${v > 0 ? '+' : '−'} ${valorBR(Math.abs(v))}`
  return valorBR(v)
}

function LinhaPlanilha({ l, meses, comTotal }: { l: Linha; meses: ControleMes[]; comTotal: boolean }) {
  const celulas = meses.map((m) => ({ chave: m.mes, v: m[l.campo] }))
  if (comTotal) celulas.push({ chave: 'total', v: total(meses, l.campo) })
  return (
    <tr className={`pl-${l.tipo}`}>
      <th scope="row" title={l.title}>{l.label}</th>
      {celulas.map((c) => (
        <td key={c.chave} className={c.chave === 'total' ? 'col-total' : undefined}>
          <span className={classeDoValor(c.v, l.tom)}>{textoDoValor(c.v, l.tom, l.tipo)}</span>
        </td>
      ))}
    </tr>
  )
}

/** Fluxo de caixa em formato de planilha: linhas = entradas e saídas, colunas
 *  = os meses do período (+ Total quando há mais de um). */
export function ControlePlanilha({ meses }: { meses: ControleMes[] }) {
  const comTotal = meses.length > 1
  const colunas = meses.length + (comTotal ? 2 : 1)
  return (
    <div className="ger-table-wrap fin-planilha-wrap">
      <table className="fin-planilha">
        <thead>
          <tr>
            <th scope="col" className="pl-canto">R$</th>
            {meses.map((m) => <th key={m.mes} scope="col">{mesCurto(m.mes)}</th>)}
            {comTotal && <th scope="col" className="col-total">Total</th>}
          </tr>
        </thead>
        <tbody>
          {BLOCOS.map((b, i) => [
            b.titulo && <tr key={`t${i}`} className="pl-secao"><th scope="rowgroup" colSpan={colunas}>{b.titulo}</th></tr>,
            ...b.linhas.map((l) => <LinhaPlanilha key={l.campo} l={l} meses={meses} comTotal={comTotal} />),
          ])}
        </tbody>
      </table>
    </div>
  )
}
