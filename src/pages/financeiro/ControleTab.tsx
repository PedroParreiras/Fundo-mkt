import { useEffect, useState } from 'react'
import { mesCurto } from '../../fundo/format'
import type { ControlePosicao, ControleResposta } from '../../fundo/types'
import { api, ApiError } from '../../lib/api'
import { Carregando, ErroBox } from '../shared'
import { ControleLancamentos } from './ControleLancamentos'
import { ControlePlanilha } from './ControlePlanilha'
import { ControleTodos } from './ControleTodos'
import { Kpi } from './Kpi'

/** Acumulado até o fim do mês. Reembolso só conta depois de pago. Zero fica sem cor. */
function PosicaoKpis({ p }: { p: ControlePosicao }) {
  const tom = (v: number, t: 'entrada' | 'saida') => (v ? t : undefined)
  return (
    <div className="fin-kpis">
      <Kpi label="Saldo na carteira" valor={p.saldo} sub="acumulado" destaque />
      <Kpi label="Entradas" valor={p.entradas} sub="créditos" tom={tom(p.entradas, 'entrada')} />
      <Kpi label="Gasto em ações" valor={p.acoes} sub="catálogo" tom={tom(p.acoes, 'saida')} />
      <Kpi label="Reembolsado" valor={p.reembolsos} sub="pago ao franqueado" tom={tom(p.reembolsos, 'saida')} />
    </div>
  )
}

function Filtros({ dados, onFranqueado, onCompetencia }: {
  dados: ControleResposta
  onFranqueado: (id: number | undefined) => void
  onCompetencia: (c: string) => void
}) {
  return (
    <div className="ger-bar">
      <label className="fin-select fin-select--largo">
        <span>Franqueado</span>
        <select value={dados.usuario_id ?? ''}
          onChange={(e) => onFranqueado(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">Todos os franqueados</option>
          {dados.franqueados.map((f) => <option key={f.usuario_id} value={f.usuario_id}>{f.franqueado}</option>)}
        </select>
      </label>
      <label className="fin-select">
        <span>Competência</span>
        <select value={dados.competencia} onChange={(e) => onCompetencia(e.target.value)}>
          {dados.competencias.map((c) => <option key={c} value={c}>{mesCurto(c)}</option>)}
        </select>
      </label>
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
 *  entradas (crédito do fundo) × saídas (ações e reembolsos pagos), mês a mês.
 *  Regra no backend (fundo_mkt_service/controle.py). */
export function ControleTab() {
  const [usuarioId, setUsuarioId] = useState<number | undefined>()
  const [competencia, setCompetencia] = useState<string | undefined>()
  const [dados, setDados] = useState<ControleResposta | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    api.financeiroControle(usuarioId, competencia)
      .then((d) => { if (vivo) { setDados(d); setError(null) } })
      .catch((e) => {
        if (vivo) setError(e instanceof ApiError ? e.message : 'Não consegui carregar o controle financeiro')
      })
    return () => { vivo = false }
  }, [usuarioId, competencia])

  if (!dados) return error ? <ErroBox mensagem={error} /> : <Carregando texto="Montando o fluxo de caixa…" />

  const f = dados.franqueado
  const escopo = f
    ? `${f.nome} · ${f.email}${f.na_cobranca ? '' : ' · fora da cobrança'}`
    : `Rede · ${dados.linhas.length} franqueados`
  return (
    <>
      {error && <ErroBox mensagem={error} />}
      <Filtros dados={dados} onFranqueado={setUsuarioId} onCompetencia={setCompetencia} />
      <PosicaoKpis p={dados.posicao} />

      <Titulo texto="Fluxo de caixa" sub={escopo} />
      <ControlePlanilha meses={dados.meses} competencia={dados.competencia} />

      {f ? (
        <>
          <Titulo texto={`Lançamentos de ${mesCurto(dados.competencia)}`} />
          <ControleLancamentos itens={dados.lancamentos} competencia={dados.competencia} />
        </>
      ) : (
        <>
          <Titulo texto="Por franqueado" sub={`posição até ${mesCurto(dados.competencia)}`} />
          <ControleTodos linhas={dados.linhas} onEscolher={setUsuarioId} />
        </>
      )}

      <div className="ger-hint">Reembolso entra no fluxo quando o pagamento é confirmado.</div>
    </>
  )
}
