import { StatusTrack } from '../fundo/components/StatusTrack'
import { brl } from '../fundo/format'
import { ETAPA_CLASSE } from '../fundo/meta'
import { usePedidos } from '../fundo/usePedidos'
import { Carregando, ErroBox, EstadoVazio, Page, PageHead } from './shared'

/** "Meus pedidos": só os resgates do usuário logado (o backend filtra pelo
 *  JWT — não há como pedir os de outro), com as 4 etapas da esteira. */
export function Pedidos() {
  const { pedidos, loading, error } = usePedidos()

  return (
    <Page>
      <PageHead eyebrow="Fundo de Marketing" title="Meus pedidos"
        desc="Acompanhe cada ação que você resgatou — da solicitação até ficar disponível na sua loja." />

      {error && <ErroBox mensagem={error} />}
      {loading && <Carregando texto="Carregando seus pedidos…" />}

      {!loading && !error && pedidos.length === 0 && (
        <EstadoVazio icone="📦" titulo="Você ainda não resgatou nenhuma ação"
          texto="Vá até a Loja do Fundo e escolha uma ação para começar."
          acao={<a className="btn btn-primary" href="fundo">Ir para a loja</a>} />
      )}

      {pedidos.map((p) => (
        <div className="fo-card" key={p.id}>
          <div className="fo-top">
            <div className="fo-thumb">{p.emoji}</div>
            <div>
              <div className="fo-nm">{p.nome}</div>
              <div className="fo-meta">Pedido {p.codigo} · {p.date} · {p.unidades} unidade(s)</div>
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
            </div>
          </div>
        </div>
      ))}
    </Page>
  )
}
