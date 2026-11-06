import { useEffect, useState } from 'react'
import { mesCurto, periodoCurto } from '../../fundo/format'
import type { ControlePosicao, ControleResposta } from '../../fundo/types'
import { api, ApiError } from '../../lib/api'
import { Carregando, ErroBox } from '../shared'
import { ControleFiltros, type Periodo } from './ControleFiltros'
import { ControleLancamentos } from './ControleLancamentos'
import { ControlePlanilha } from './ControlePlanilha'
import { ControleTodos } from './ControleTodos'
import { Kpi } from './Kpi'

/** O Total do período; o saldo é o do fim dele. Zero fica sem cor. */
function PosicaoKpis({ p, ate }: { p: ControlePosicao; ate: string }) {
  const tom = (v: number, t: 'entrada' | 'saida') => (v ? t : undefined)
  return (
    <div className="fin-kpis">
      <Kpi label="Saldo na carteira" valor={p.saldo} sub={`fim de ${mesCurto(ate)}`} destaque />
      <Kpi label="Entradas" valor={p.entradas} sub="créditos" tom={tom(p.entradas, 'entrada')} />
      <Kpi label="Gasto em ações" valor={p.acoes} sub="catálogo" tom={tom(p.acoes, 'saida')} />
      <Kpi label="Reembolsado" valor={p.reembolsos} sub="pago ao franqueado" tom={tom(p.reembolsos, 'saida')} />
    </div>
  )
}

function Titulo({ texto, sub }: { texto: string; sub?: string }) {
  return (
    <div className="ger-panel-title fin-secao">
      {texto}
      {sub && <span className="fin-secao-sub">{sub}</span>}
    </div>
  )
}

/** Controle financeiro: fluxo de caixa POR franqueado em formato de planilha —
 *  entradas (crédito do fundo) × saídas (ações e reembolsos pagos) — no mês, no
 *  período ou em todos os meses. Regra no backend (fundo_mkt_service/controle.py). */
export function ControleTab() {
  const [usuarioId, setUsuarioId] = useState<number | undefined>()
  // Sem de/ate o backend devolve o mês corrente.
  const [periodo, setPeriodo] = useState<Periodo>({ modo: 'mes' })
  const [dados, setDados] = useState<ControleResposta | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    api.financeiroControle(usuarioId, periodo.de, periodo.ate)
      .then((d) => { if (vivo) { setDados(d); setError(null) } })
      .catch((e) => {
        if (vivo) setError(e instanceof ApiError ? e.message : 'Não consegui carregar o controle financeiro')
      })
    return () => { vivo = false }
  }, [usuarioId, periodo.de, periodo.ate])

  if (!dados) return error ? <ErroBox mensagem={error} /> : <Carregando texto="Montando o fluxo de caixa…" />

  const f = dados.franqueado
  const rotulo = periodo.modo === 'todos' ? 'todos os meses' : periodoCurto(dados.de, dados.ate)
  const escopo = f
    ? `${f.nome} · ${f.email}${f.na_cobranca ? '' : ' · fora da cobrança'}`
    : `Rede · ${dados.linhas.length} franqueados`
  return (
    <>
      {error && <ErroBox mensagem={error} />}
      <ControleFiltros dados={dados} modo={periodo.modo} onFranqueado={setUsuarioId} onPeriodo={setPeriodo} />
      <PosicaoKpis p={dados.posicao} ate={dados.ate} />

      <Titulo texto={`Fluxo de caixa · ${rotulo}`} sub={escopo} />
      <ControlePlanilha meses={dados.meses} />

      {f ? (
        <>
          <Titulo texto={`Lançamentos · ${rotulo}`} />
          <ControleLancamentos itens={dados.lancamentos} rotulo={rotulo} />
        </>
      ) : (
        <>
          <Titulo texto="Por franqueado" sub={rotulo} />
          <ControleTodos linhas={dados.linhas} onEscolher={setUsuarioId} />
        </>
      )}

      <div className="ger-hint">Reembolso entra no fluxo quando o pagamento é confirmado.</div>
    </>
  )
}
