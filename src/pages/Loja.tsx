import { useMemo, useState } from 'react'
import { CategoriaChips } from '../fundo/components/CategoriaChips'
import { CheckoutModal } from '../fundo/components/CheckoutModal'
import { FundItemCard } from '../fundo/components/FundItemCard'
import { HistoryModal } from '../fundo/components/HistoryModal'
import { Toast } from '../fundo/components/Toast'
import { Wallet } from '../fundo/components/Wallet'
import { useFundo } from '../fundo/fundoStore'
import { CATEGORIAS } from '../fundo/meta'
import type { Acao, TipoDocumento } from '../fundo/types'
import { useToast } from '../fundo/useToast'
import { api, ApiError } from '../lib/api'
import { isGestor, userName } from '../lib/session'
import { Carregando, ErroBox, EstadoVazio, Page, PageHead } from './shared'

/** Vitrine do fundo: carteira + ações por categoria + resgate. */
export function Loja() {
  const { acoes, carteira, lojas, loading, error, refresh } = useFundo()
  const { message, toast } = useToast()
  const [cat, setCat] = useState('all')
  const [alvo, setAlvo] = useState<Acao | null>(null)
  const [histOpen, setHistOpen] = useState(false)
  const [erroResgate, setErroResgate] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const grupos = useMemo(
    () => CATEGORIAS.filter((c) => cat === 'all' || c.id === cat)
      .map((c) => ({ meta: c, itens: acoes.filter((a) => a.categoria === c.id) }))
      .filter((g) => g.itens.length > 0),
    [acoes, cat],
  )

  const abrir = (a: Acao) => { setErroResgate(null); setAlvo(a) }

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
      setErroResgate(e instanceof ApiError ? e.message : 'Não consegui registrar o resgate')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Page>
      <PageHead
        eyebrow="Fundo de Marketing"
        title="Loja do Fundo de Marketing"
        desc="Use o saldo que você acumulou no fundo para contratar ações que fazem a sua loja vender mais. Escolha por categoria, veja o valor e selecione."
      />

      <Wallet carteira={carteira} userName={userName()} lojasCount={lojas.length}
        onOpenHistory={() => setHistOpen(true)} />

      <div className="fund-note">
        💡
        <div>
          <b>Como funciona:</b> a cada mês, 1% do faturamento das suas lojas entra na carteira.
          Você decide como investir esse saldo entre as ações abaixo — escolhe as lojas, a
          quantidade, e acompanha o pedido até ficar disponível.
        </div>
      </div>

      {error && <ErroBox mensagem={error} />}
      {loading && <Carregando texto="Carregando o catálogo…" />}

      {!loading && !error && acoes.length === 0 && (
        <EstadoVazio icone="🗂️" titulo="Nenhuma ação no catálogo ainda"
          texto={isGestor()
            ? 'Cadastre as ações em Gerenciar › Produtos para os franqueados poderem resgatar.'
            : 'Assim que o time cadastrar as ações do fundo, elas aparecem aqui.'}
          acao={isGestor() ? <a className="btn btn-primary" href="gerenciar">Ir para Gerenciar</a> : undefined} />
      )}

      {!loading && !error && acoes.length > 0 && (
        <>
          <CategoriaChips ativa={cat} onChange={setCat} />
          {grupos.map(({ meta, itens }) => (
            <div className="sup-group" key={meta.id}>
              <div className="sup-head">
                <div className="sup-logo" style={{ background: meta.color }}>{meta.short}</div>
                <div>
                  <div className="sup-name">{meta.name}</div>
                  <div className="sup-tag">{meta.tag}</div>
                </div>
                <div className="sup-count">{itens.length} ações</div>
              </div>
              <div className="pgrid">
                {itens.map((a) => <FundItemCard key={a.id} acao={a} onSelect={abrir} />)}
              </div>
            </div>
          ))}
        </>
      )}

      <HistoryModal open={histOpen} carteira={carteira} onClose={() => setHistOpen(false)} />
      <CheckoutModal
        key={alvo?.id ?? 'closed'}
        acao={alvo}
        saldo={carteira.saldo}
        lojas={lojas}
        erro={erroResgate}
        enviando={enviando}
        onClose={() => setAlvo(null)}
        onConfirm={resgatar}
      />
      <Toast message={message} />
    </Page>
  )
}
