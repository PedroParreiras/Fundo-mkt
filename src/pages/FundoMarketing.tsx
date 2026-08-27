import { useState } from 'react'
import { findItem, FUND_STORES } from '../fundo/catalog'
import { CheckoutModal } from '../fundo/components/CheckoutModal'
import { FundOrdersView } from '../fundo/components/FundOrdersView'
import { FundScheduleView } from '../fundo/components/FundScheduleView'
import { FundStoreView } from '../fundo/components/FundStoreView'
import { FundSubnav } from '../fundo/components/FundSubnav'
import { HistoryModal } from '../fundo/components/HistoryModal'
import { Toast } from '../fundo/components/Toast'
import { Wallet } from '../fundo/components/Wallet'
import type { FundView } from '../fundo/types'
import { useFundoWallet, type StoreSelection } from '../fundo/useFundoWallet'
import { useToast } from '../fundo/useToast'

function readUserName(): string {
  try {
    const raw = localStorage.getItem('user')
    const u = raw ? JSON.parse(raw) : null
    return u?.name || u?.email || 'Franqueado'
  } catch {
    return 'Franqueado'
  }
}

/** Aba "Fundo de Marketing" do Hub de Abastecimento, portada do protótipo. */
export function FundoMarketing() {
  const wallet = useFundoWallet()
  const { message, toast } = useToast()
  const [view, setView] = useState<FundView>('store')
  const [activeCat, setActiveCat] = useState('all')
  const [checkoutId, setCheckoutId] = useState<string | null>(null)
  const [histOpen, setHistOpen] = useState(false)

  const changeView = (v: FundView) => {
    setView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmCheckout = (selection: StoreSelection) => {
    const item = findItem(checkoutId!)
    if (!wallet.redeem(item, selection)) {
      toast('Saldo insuficiente na carteira')
      return
    }
    setCheckoutId(null)
    changeView('orders')
    toast('Resgate confirmado — acompanhe em Meus Pedidos')
  }

  const advance = (id: string) => {
    const label = wallet.advanceOrder(id)
    if (label) toast(`${id} · ${label}`)
  }

  return (
    <div className="fundo-app">
      <main className="wrap">
        <section className="screen">
          <div className="page-head">
            <div className="eyebrow">Fundo de Marketing</div>
            <h1 className="page-title">Loja do Fundo de Marketing</h1>
            <p className="page-desc">
              Use o saldo que você acumulou no fundo para contratar ações que fazem a sua loja vender
              mais. Escolha por categoria, veja o valor e selecione.
            </p>
          </div>

          <Wallet
            balance={wallet.balance}
            contrib={wallet.contrib}
            spent={wallet.spent}
            userName={readUserName()}
            storeCount={FUND_STORES.length}
            onOpenHistory={() => setHistOpen(true)}
          />

          <div className="fund-note">
            💡
            <div>
              <b>Como funciona:</b> a cada mês, 1% do faturamento das suas lojas entra na carteira.
              Você decide como investir esse saldo entre as ações abaixo — escolhe as lojas, a
              quantidade, e recebe a previsão de entrega.
            </div>
          </div>

          <FundSubnav view={view} ordersCount={wallet.orders.length} onChange={changeView} />

          {view === 'store' && (
            <FundStoreView activeCat={activeCat} onCatChange={setActiveCat} onSelectItem={setCheckoutId} />
          )}
          {view === 'schedule' && <FundScheduleView onSelectItem={setCheckoutId} />}
          {view === 'orders' && (
            <FundOrdersView orders={wallet.orders} onAdvance={advance} onGoToStore={() => changeView('store')} />
          )}
        </section>
      </main>

      <HistoryModal
        open={histOpen}
        balance={wallet.balance}
        history={wallet.history}
        onClose={() => setHistOpen(false)}
      />
      <CheckoutModal
        key={checkoutId ?? 'closed'}
        item={checkoutId ? findItem(checkoutId) : null}
        balance={wallet.balance}
        onClose={() => setCheckoutId(null)}
        onConfirm={confirmCheckout}
      />
      <Toast message={message} />
    </div>
  )
}
