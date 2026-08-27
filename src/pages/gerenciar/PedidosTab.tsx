import { useState } from 'react'
import { StatusTrack } from '../../fundo/components/StatusTrack'
import { brl } from '../../fundo/format'
import { ETAPAS, ETAPA_CLASSE, ETAPA_LABEL } from '../../fundo/meta'
import { usePedidos } from '../../fundo/usePedidos'
import { ApiError } from '../../lib/api'
import { Carregando, ErroBox, EstadoVazio } from '../shared'

/** Todos os pedidos (`?todos=1`) com o controle de esteira do gestor.
 *  O backend só aceita mover UMA etapa por vez, então só os vizinhos aparecem. */
export function PedidosTab({ onToast }: { onToast: (m: string) => void }) {
  const { pedidos, loading, error, mudarStatus } = usePedidos(true)
  const [filtro, setFiltro] = useState<string>('all')
  const [erroAcao, setErroAcao] = useState<string | null>(null)

  const mover = async (id: number, status: string) => {
    setErroAcao(null)
    try {
      onToast(`Pedido movido para ${await mudarStatus(id, status)}`)
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
          {ETAPAS.map((s) => {
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
        const vizinhos = [ETAPAS[i - 1], ETAPAS[i + 1]].filter(Boolean)
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

            <StatusTrack etapa={p.etapa} eventos={p.eventos} />

            <div className="fo-body">
              <div className="fo-stores">
                {p.lojas.map((l) => (
                  <span className="fo-store-tag" key={l.name}>{l.name} · {l.qty} un</span>
                ))}
              </div>
              <div className="fo-right">
                <div className="fo-total">{brl(p.total)}</div>
                <div className="fo-eta">{p.previsao}</div>
                <div className="ger-move">
                  {vizinhos.map((s) => (
                    <button key={s} className="btn btn-ghost btn-sm" onClick={() => mover(p.id, s)}>
                      {ETAPAS.indexOf(s) < i ? '← ' : ''}{ETAPA_LABEL[s]}{ETAPAS.indexOf(s) > i ? ' →' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
