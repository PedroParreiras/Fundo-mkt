import { useEffect, useState } from 'react'
import { brl, mesCurto } from '../../fundo/format'
import type { FluxoCarteira, FluxoMes, FluxoResposta } from '../../fundo/types'
import { api, ApiError } from '../../lib/api'
import { Carregando, ErroBox, EstadoVazio } from '../shared'
import { GraficoColunas, type Serie } from './GraficoColunas'

/** Cor por PAPEL, a mesma nos dois gráficos (tokens em styles/financeiro.css). */
const COR = {
  credito: 'var(--fin-credito)',
  taxa: 'var(--fin-taxa)',
  aberto: 'var(--fin-aberto)',
  utilizado: 'var(--fin-utilizado)',
}

function Kpi({ label, valor, sub }: { label: string; valor: number; sub?: string }) {
  return (
    <div className="fin-kpi">
      <div className="fin-kpi-label">{label}</div>
      <div className="fin-kpi-valor">{brl(valor)}</div>
      {sub && <div className="fin-kpi-sub">{sub}</div>}
    </div>
  )
}

function serie(id: keyof typeof COR, label: string, meses: FluxoMes[], campo: keyof Omit<FluxoMes, 'mes'>): Serie {
  return { id, label, cor: COR[id], valores: meses.map((m) => m[campo]) }
}

function TabelaMeses({ meses }: { meses: FluxoMes[] }) {
  return (
    <div className="ger-table-wrap">
      <table className="ger-table">
        <thead>
          <tr><th>Mês</th><th>Boletos</th><th>Adimplente</th><th>Não adimplente</th>
            <th>Crédito (85%)</th><th>A liberar</th><th>Taxa adm. (15%)</th><th>Utilizado</th></tr>
        </thead>
        <tbody>
          {[...meses].reverse().map((m) => (
            <tr key={m.mes}>
              <td><b>{mesCurto(m.mes)}</b></td>
              <td className="num">{brl(m.boletos)}</td>
              <td className="num">{brl(m.adimplente)}</td>
              <td className="num">{brl(m.nao_adimplente)}</td>
              <td className="num">{brl(m.credito)}</td>
              <td className="num">{brl(m.credito_a_liberar)}</td>
              <td className="num">{brl(m.taxa_adm)}</td>
              <td className="num">{brl(m.utilizado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TabelaCarteiras({ carteiras }: { carteiras: FluxoCarteira[] }) {
  if (!carteiras.length) {
    return <EstadoVazio icone="👛" titulo="Nenhum franqueado conectado"
      texto="Quando o e-mail do financeiro bater com o login do HRM, a carteira aparece aqui." />
  }
  return (
    <div className="ger-table-wrap">
      <table className="ger-table ger-table--cards">
        <thead><tr><th>Franqueado</th><th>Créditos</th><th>Utilizado</th><th>Saldo</th></tr></thead>
        <tbody>
          {carteiras.map((c) => (
            <tr key={c.usuario_id}>
              <td>
                <div className="td-nome">{c.franqueado}</div>
                <div className="td-sub">{c.nome} · {c.email}</div>
              </td>
              <td className="num" data-label="Créditos">{brl(c.creditos)}</td>
              <td className="num" data-label="Utilizado">{brl(c.utilizado)}</td>
              <td className="num" data-label="Saldo"><b>{brl(c.saldo)}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Fluxo financeiro do fundo: o que foi pago, o que não foi, quanto virou
 *  crédito do franqueado, quanto ele já usou e a taxa que fica com a casa. */
export function ValoresTab() {
  const [dados, setDados] = useState<FluxoResposta | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.financeiroFluxo()
      .then(setDados)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Não consegui carregar o fluxo financeiro'))
  }, [])

  if (error) return <ErroBox mensagem={error} />
  if (!dados) return <Carregando texto="Calculando o fluxo do fundo…" />

  const { meses, totais: t } = dados
  const rotulos = meses.map((m) => mesCurto(m.mes))

  return (
    <>
      <div className="fin-kpis">
        <Kpi label="Boletos emitidos" valor={t.boletos} />
        <Kpi label="Adimplente" valor={t.adimplente} />
        <Kpi label="Não adimplente" valor={t.nao_adimplente} />
        <Kpi label={`Crédito na carteira (${dados.pct_credito}%)`} valor={t.credito}
          sub={t.credito_a_liberar ? `+ ${brl(t.credito_a_liberar)} aguardando conexão` : undefined} />
        <Kpi label="Utilizado" valor={t.utilizado} />
        <Kpi label={`Taxa de administração (${dados.pct_taxa_adm}%)`} valor={t.taxa_adm} />
      </div>

      <div className="fin-charts">
        <GraficoColunas titulo="Boletos por mês · adimplente × não adimplente" modo="empilhado"
          categorias={rotulos} series={[
            // Os 85% inteiros (na carteira + a liberar): a pilha fecha no total de boletos.
            { id: 'credito', label: `Pago · ${dados.pct_credito}% do franqueado`, cor: COR.credito,
              valores: meses.map((m) => m.credito + m.credito_a_liberar) },
            serie('taxa', `Pago · taxa de administração (${dados.pct_taxa_adm}%)`, meses, 'taxa_adm'),
            serie('aberto', 'Não adimplente', meses, 'nao_adimplente'),
          ]} />
        <GraficoColunas titulo="Crédito gerado × utilizado" modo="agrupado"
          categorias={rotulos} series={[
            serie('credito', 'Crédito na carteira', meses, 'credito'),
            serie('utilizado', 'Utilizado', meses, 'utilizado'),
          ]} />
      </div>

      <div className="ger-panel-title fin-secao">Mês a mês</div>
      <TabelaMeses meses={meses} />

      <div className="ger-panel-title fin-secao">Carteira de cada franqueado</div>
      <TabelaCarteiras carteiras={dados.carteiras} />

      <div className="ger-hint">
        Boleto e crédito contam no mês da <b>competência</b>; utilizado conta no mês do <b>resgate</b>
        (pedido recusado não entra). <b>A liberar</b> = pagou, mas o e-mail não está conectado a um
        usuário do HRM — no primeiro gráfico ela está dentro dos 85%; no segundo, não.
      </div>
    </>
  )
}
