import { ETAPAS, ETAPA_LABEL } from '../meta'
import type { PedidoEvento } from '../types'

interface StatusTrackProps {
  /** Índice da etapa atual (0..3), como vem em `pedido.etapa`. */
  etapa: number
  /** Trilha real do pedido — dá a data de cada passo já percorrido. */
  eventos: PedidoEvento[]
}

/** As 4 etapas do pedido: Solicitação → Conferência → Solicitado → Disponível.
 *  É o que o franqueado usa para saber onde o resgate dele está. */
export function StatusTrack({ etapa, eventos }: StatusTrackProps) {
  const dataDe = (status: string) => eventos.find((e) => e.status === status)?.date

  return (
    <div className="track">
      {ETAPAS.map((s, i) => {
        const estado = i < etapa ? 'done' : i === etapa ? 'current' : ''
        const quando = dataDe(s)
        return (
          <div className={`tstep ${estado}`} key={s}>
            <div className="tdot">{i < etapa ? '✓' : i + 1}</div>
            <div className="tlabel">{ETAPA_LABEL[s]}</div>
            {quando && <div className="tdate">{quando}</div>}
          </div>
        )
      })}
    </div>
  )
}
