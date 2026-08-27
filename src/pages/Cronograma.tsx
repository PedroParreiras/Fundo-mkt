import { useMemo, useState } from 'react'
import { CheckoutModal } from '../fundo/components/CheckoutModal'
import { Toast } from '../fundo/components/Toast'
import { useFundo } from '../fundo/fundoStore'
import { brl } from '../fundo/format'
import { FUND_SCHEDULE } from '../fundo/schedule'
import type { Acao } from '../fundo/types'
import { useToast } from '../fundo/useToast'
import { api, ApiError } from '../lib/api'
import { Carregando, ErroBox, Page, PageHead } from './shared'

/** Campanhas do ano com as ações recomendadas — cada uma abre o mesmo resgate. */
export function Cronograma() {
  const { acoes, carteira, lojas, loading, error, refresh } = useFundo()
  const { message, toast } = useToast()
  const [alvo, setAlvo] = useState<Acao | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const porSlug = useMemo(() => new Map(acoes.map((a) => [a.slug, a])), [acoes])
  const mesAtual = new Date().getMonth() + 1

  const resgatar = async (sel: { nome: string; store_unique_id?: string; quantidade: number }[]) => {
    if (!alvo) return
    setEnviando(true)
    try {
      const pedido = await api.resgatar(alvo.id, sel)
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

      {!loading && FUND_SCHEDULE.map((qt) => (
        <div className="q-group" key={qt.q}>
          <div className="q-head">{qt.q}</div>
          {qt.months.map((mo) => {
            // Slug fora do catálogo (ação desativada) simplesmente não aparece.
            const recs = mo.items.map((s) => porSlug.get(s)).filter((a): a is Acao => !!a)
            return (
              <div className={`month-card ${mo.n === mesAtual ? 'current' : ''}`} key={mo.m}>
                <div className="mc-when">
                  {mo.m}
                  <span className="mc-theme">{mo.theme}</span>
                  {mo.n === mesAtual && <span className="mc-badge-now">mês atual</span>}
                </div>
                <div className="mc-desc">{mo.desc}</div>
                {recs.length > 0 && (
                  <>
                    <div className="mc-rec-label">Ações recomendadas pra essa campanha</div>
                    <div className="mc-recs">
                      {recs.map((a) => (
                        <button className="rec" key={a.id} onClick={() => { setErro(null); setAlvo(a) }}>
                          <span className="rec-emoji">{a.emoji}</span>
                          {a.nome}
                          <span className="rec-price">{brl(a.preco)}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      ))}

      <CheckoutModal key={alvo?.id ?? 'closed'} acao={alvo} saldo={carteira!.saldo} lojas={lojas}
        erro={erro} enviando={enviando} onClose={() => setAlvo(null)} onConfirm={resgatar} />
      <Toast message={message} />
    </Page>
  )
}
