import { mesCurto } from '../../fundo/format'
import type { ControleResposta } from '../../fundo/types'

/** mes = uma coluna · todos = o histórico inteiro · periodo = De..Até escolhidos. */
export type ModoPeriodo = 'mes' | 'todos' | 'periodo'
export interface Periodo { modo: ModoPeriodo; de?: string; ate?: string }

const TODOS = '__todos'
const PERIODO = '__periodo'

function MesSelect({ rotulo, valor, meses, onChange }: {
  rotulo: string; valor: string; meses: string[]; onChange: (m: string) => void
}) {
  return (
    <label className="fin-select">
      <span>{rotulo}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)}>
        {meses.map((m) => <option key={m} value={m}>{mesCurto(m)}</option>)}
      </select>
    </label>
  )
}

/** Franqueado + competência. A competência tem, além de cada mês, "Todos os
 *  meses" e "Período específico" — este abre o De / Até (só meses coerentes:
 *  o De não passa do Até e vice-versa). */
export function ControleFiltros({ dados, modo, onFranqueado, onPeriodo }: {
  dados: ControleResposta
  modo: ModoPeriodo
  onFranqueado: (id: number | undefined) => void
  onPeriodo: (p: Periodo) => void
}) {
  const asc = [...dados.competencias].reverse()
  const inteiro = { de: asc[0], ate: asc[asc.length - 1] }
  const valor = modo === 'todos' ? TODOS : modo === 'periodo' ? PERIODO : dados.de

  const escolher = (v: string) => {
    if (v === TODOS) onPeriodo({ modo: 'todos', ...inteiro })
    else if (v === PERIODO) onPeriodo({ modo: 'periodo', ...inteiro })
    else onPeriodo({ modo: 'mes', de: v, ate: v })
  }

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
        <select value={valor} onChange={(e) => escolher(e.target.value)}>
          <option value={TODOS}>Todos os meses</option>
          <option value={PERIODO}>Período específico…</option>
          <optgroup label="Mês">
            {dados.competencias.map((c) => <option key={c} value={c}>{mesCurto(c)}</option>)}
          </optgroup>
        </select>
      </label>
      {modo === 'periodo' && (
        <>
          <MesSelect rotulo="De" valor={dados.de} meses={asc.filter((m) => m <= dados.ate)}
            onChange={(de) => onPeriodo({ modo: 'periodo', de, ate: dados.ate })} />
          <MesSelect rotulo="Até" valor={dados.ate} meses={asc.filter((m) => m >= dados.de)}
            onChange={(ate) => onPeriodo({ modo: 'periodo', de: dados.de, ate })} />
        </>
      )}
    </div>
  )
}
