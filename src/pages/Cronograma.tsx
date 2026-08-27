import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckoutModal } from '../fundo/components/CheckoutModal'
import { Toast } from '../fundo/components/Toast'
import { useFundo } from '../fundo/fundoStore'
import { brl } from '../fundo/format'
import type { Acao, Campanha, TipoDocumento } from '../fundo/types'
import { useToast } from '../fundo/useToast'
import { api, ApiError } from '../lib/api'
import { isGestor } from '../lib/session'
import { Carregando, ErroBox, EstadoVazio, Page, PageHead } from './shared'

/** Campanhas do ano com as ações recomendadas — cada uma abre o mesmo resgate.
 *  O calendário vem do banco (Gerenciar › Campanhas), não do código. */
export function Cronograma() {
  const { carteira, lojas, refresh } = useFundo()
  const { message, toast } = useToast()
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alvo, setAlvo] = useState<Acao | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const load = useCallback(async () => {
    try {
      setCampanhas((await api.campanhas()).campanhas)
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui carregar o cronograma')
    } finally {
      setLoading(false)
    }
  }, [])

  // Ver a nota em fundo/usePedidos.ts sobre esta regra.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  const hoje = new Date()
  const trimestres = useMemo(() => {
    const grupos = new Map<string, Campanha[]>()
    for (const c of campanhas) {
      const chave = `${c.trimestre}º Trimestre · ${c.ano}`
      grupos.set(chave, [...(grupos.get(chave) ?? []), c])
    }
    return [...grupos.entries()]
  }, [campanhas])

  const resgatar = async (payload: {
    lojas: { nome: string; store_unique_id?: string; quantidade: number }[]
    valor?: number; documento_tipo?: TipoDocumento; documento?: string
  }) => {
    if (!alvo) return
    setEnviando(true)
    try {
      const pedido = await api.resgatar({ acao_id: alvo.id, ...payload })
      setAlvo(null)
      await refresh()
      toast(`${pedido.codigo} solicitado — acompanhe em Pedidos`)
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não consegui registrar o resgate')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Page>
      <PageHead eyebrow="Fundo de Marketing" title="Cronograma de campanhas"
        desc="O calendário do ano com as datas que puxam venda e as ações recomendadas para cada uma." />

      <div className="fund-note">
        🗓️
        <div>
          <b>Planejamento do ano:</b> cada campanha já vem com as ações recomendadas pra ela.
          Clique numa ação pra resgatar direto da sua carteira.
        </div>
      </div>

      {error && <ErroBox mensagem={error} />}
      {loading && <Carregando />}

      {!loading && !error && campanhas.length === 0 && (
        <EstadoVazio icone="🗓️" titulo="Cronograma vazio"
          texto={isGestor()
            ? 'Monte o calendário em Gerenciar › Campanhas.'
            : 'Assim que o time montar o calendário do ano, ele aparece aqui.'}
          acao={isGestor() ? <a className="btn btn-primary" href="gerenciar">Ir para Gerenciar</a> : undefined} />
      )}

      {trimestres.map(([titulo, meses]) => (
        <div className="q-group" key={titulo}>
          <div className="q-head">{titulo}</div>
          {meses.map((c) => {
            const agora = c.mes === hoje.getMonth() + 1 && c.ano === hoje.getFullYear()
            return (
              <div className={`month-card ${agora ? 'current' : ''}`} key={c.id}>
                <div className="mc-when">
                  {c.mes_nome}
                  <span className="mc-theme">{c.tema}</span>
                  {agora && <span className="mc-badge-now">mês atual</span>}
                </div>
                {c.descricao && <div className="mc-desc">{c.descricao}</div>}
                <div className="mc-rec-label">Ações recomendadas pra essa campanha</div>
                {c.acoes.length > 0 ? (
                  <div className="mc-recs">
                    {c.acoes.map((a) => (
                      <button className="rec" key={a.id} onClick={() => { setErro(null); setAlvo(a) }}>
                        <span className="rec-emoji">{a.emoji}</span>
                        {a.nome}
                        <span className="rec-price">
                          {a.categoria === 'documento' ? 'documento' : brl(a.preco)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mc-rec-empty">Nenhuma ação ligada a esta campanha ainda.</div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      <CheckoutModal key={alvo?.id ?? 'closed'} acao={alvo} saldo={carteira.saldo} lojas={lojas}
        erro={erro} enviando={enviando} onClose={() => setAlvo(null)} onConfirm={resgatar} />
      <Toast message={message} />
    </Page>
  )
}
