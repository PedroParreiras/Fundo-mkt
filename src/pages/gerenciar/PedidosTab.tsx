import { useState } from 'react'
import { DocumentoLink } from '../../fundo/components/DocumentoLink'
import { StatusTrack } from '../../fundo/components/StatusTrack'
import { brl } from '../../fundo/format'
import { ETAPAS, ETAPA_CLASSE, ETAPA_LABEL, STATUS_RECUSADO } from '../../fundo/meta'
import { usePedidos } from '../../fundo/usePedidos'
import { ApiError } from '../../lib/api'
import { Carregando, ErroBox, EstadoVazio } from '../shared'

/** Todos os pedidos (`?todos=1`) com o controle de esteira do gestor.
 *  O backend só aceita mover UMA etapa por vez, então só os vizinhos aparecem. */
export function PedidosTab({ onToast }: { onToast: (m: string) => void }) {
  const { pedidos, loading, error, mudarStatus } = usePedidos(true)
  const [filtro, setFiltro] = useState<string>('all')
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  /** Pedido em recusa: o motivo é obrigatório e o franqueado lê. */
  const [recusando, setRecusando] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')

  const mover = async (id: number, status: string, nota?: string) => {
    setErroAcao(null)
    try {
      onToast(`Pedido movido para ${await mudarStatus(id, status, nota)}`)
      setRecusando(null)
      setMotivo('')
    } catch (e) {
      setErroAcao(e instanceof ApiError ? e.message : 'Não consegui mudar a etapa')
    }
  }

  if (loading) return <Carregando texto="Carregando os pedidos…" />

  const visiveis = filtro === 'all' ? pedidos : pedidos.filter((p) => p.status === filtro)

  return (
    <>
      {error && <ErroBox mensagem={error} />}
      {erroAcao && <ErroBox mensagem={erroAcao} />}

      <div className="toolbar">
        <div className="chips">
          <div className={`chip ${filtro === 'all' ? 'active' : ''}`} onClick={() => setFiltro('all')}>
            Todos <span className="fsub-badge">{pedidos.length}</span>
          </div>
          {[...ETAPAS, STATUS_RECUSADO].map((s) => {
            const n = pedidos.filter((p) => p.status === s).length
            return (
              <div key={s} className={`chip ${filtro === s ? 'active' : ''}`} onClick={() => setFiltro(s)}>
                {ETAPA_LABEL[s]} <span className="fsub-badge">{n}</span>
              </div>
            )
          })}
        </div>
      </div>

      {visiveis.length === 0 && (
        <EstadoVazio icone="📭" titulo="Nenhum pedido nessa etapa"
          texto="Assim que um franqueado resgatar uma ação, ela aparece aqui." />
      )}

      {visiveis.map((p) => {
        const i = p.etapa
        // Recusado é terminal: só volta pro começo. Nas demais, um passo por vez.
        const vizinhos = p.status === STATUS_RECUSADO
          ? [ETAPAS[0]]
          : [ETAPAS[i - 1], ETAPAS[i + 1]].filter(Boolean)
        return (
          <div className="fo-card" key={p.id}>
            <div className="fo-top">
              <div className="fo-thumb">{p.emoji}</div>
              <div>
                <div className="fo-nm">{p.nome}</div>
                <div className="fo-meta">
                  {p.codigo} · {p.usuario_nome} · {p.date} · {p.unidades} unidade(s)
                </div>
              </div>
              <div className={`fo-status ${ETAPA_CLASSE[p.status]}`}>{p.status_label}</div>
            </div>

            {p.status === STATUS_RECUSADO ? (
              <div className="recusa-box"><b>Recusado.</b> {p.motivo_recusa}</div>
            ) : (
              <StatusTrack etapa={p.etapa} eventos={p.eventos} />
            )}

            <div className="fo-body">
              <div className="fo-stores">
                {p.lojas.map((l) => (
                  <span className="fo-store-tag" key={l.name}>{l.name} · {l.qty} un</span>
                ))}
              </div>
              <div className="fo-right">
                <div className="fo-total">{brl(p.total)}</div>
                <div className="fo-eta">{p.previsao}</div>
                <DocumentoLink pedido={p} />
                <div className="ger-move">
                  {vizinhos.map((s) => (
                    <button key={s} className="btn btn-ghost btn-sm" onClick={() => mover(p.id, s)}>
                      {p.status === STATUS_RECUSADO ? 'Reabrir em ' : ETAPAS.indexOf(s) < i ? '← ' : ''}
                      {ETAPA_LABEL[s]}
                      {p.status !== STATUS_RECUSADO && ETAPAS.indexOf(s) > i ? ' →' : ''}
                    </button>
                  ))}
                  {p.status !== STATUS_RECUSADO && (
                    <button className="btn btn-danger btn-sm"
                      onClick={() => { setRecusando(p.id); setMotivo('') }}>Recusar</button>
                  )}
                </div>
                {recusando === p.id && (
                  <div className="recusa-form">
                    <input value={motivo} autoFocus placeholder="Motivo — o franqueado vê essa mensagem"
                      onChange={(e) => setMotivo(e.target.value)} />
                    <button className="btn btn-danger btn-sm"
                      onClick={() => mover(p.id, STATUS_RECUSADO, motivo)}>Confirmar recusa</button>
                    <button className="link-btn" onClick={() => setRecusando(null)}>Cancelar</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
