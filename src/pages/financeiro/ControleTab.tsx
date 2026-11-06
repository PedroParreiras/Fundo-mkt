import { useEffect, useState } from 'react'
import { mesCurto } from '../../fundo/format'
import type { ControlePosicao, ControleResposta } from '../../fundo/types'
import { api, ApiError } from '../../lib/api'
import { Carregando, ErroBox } from '../shared'
import { ControleExtrato } from './ControleExtrato'
import { ControleTodos } from './ControleTodos'
import { Kpi } from './Kpi'

/** Posição acumulada até o fim do mês. Gasto já inclui o reembolso. */
function PosicaoKpis({ p }: { p: ControlePosicao }) {
  return (
    <div className="fin-kpis">
      <Kpi label="Saldo na carteira" valor={p.saldo} sub="acumulado" destaque />
      <Kpi label="Gasto da carteira" valor={p.gasto} sub="ações + reembolsos" />
      <Kpi label="A reembolsar" valor={p.a_reembolsar} sub="já reservado" />
      <Kpi label="Reembolsado" valor={p.reembolsado} sub="pago ao franqueado" />
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

/** Controle financeiro: mini fluxo de caixa POR franqueado — quanto tem na
 *  carteira (acumulado), quanto gastou, quanto devemos de reembolso e quanto
 *  já reembolsamos. Regra no backend (fundo_mkt_service/controle.py). */
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

  return (
    <>
      {error && <ErroBox mensagem={error} />}
      <Filtros dados={dados} onFranqueado={setUsuarioId} onCompetencia={setCompetencia} />
      <PosicaoKpis p={dados.detalhe?.posicao ?? dados.total} />
      {dados.detalhe
        ? <ControleExtrato detalhe={dados.detalhe} competencia={dados.competencia} />
        : <ControleTodos linhas={dados.linhas} onEscolher={setUsuarioId} />}
      <div className="ger-hint">
        Posição até o fim de <b>{mesCurto(dados.competencia)}</b>. Reembolso = pedido da categoria Documento.
      </div>
    </>
  )
}
