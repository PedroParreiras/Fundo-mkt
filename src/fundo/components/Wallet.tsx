import { brl } from '../format'
import type { Carteira } from '../types'

interface WalletProps {
  carteira: Carteira
  userName: string
  lojasCount: number
  onOpenHistory: () => void
}

/** Cartão navy da carteira: saldo (abre o extrato) + contribuído/resgatado. */
export function Wallet({ carteira, userName, lojasCount, onOpenHistory }: WalletProps) {
  return (
    <div className="wallet">
      <div className="w-left">
        <div className="w-hi">
          <span className="wdot" />
          Conectado como
          <b style={{ color: '#fff', marginLeft: 2 }}>{userName}</b>
          {lojasCount > 0 && ` · ${lojasCount} ${lojasCount === 1 ? 'loja' : 'lojas'}`}
        </div>
        <button className="balance-btn" onClick={onOpenHistory}>
          <span className="wl-label">Saldo na carteira</span>
          <span className="balance">{brl(carteira.saldo)}</span>
          <span className="wl-hint">acumulado da sua contribuição de 1% · toque para ver o histórico ›</span>
        </button>
      </div>
      <div className="w-right">
        <div className="w-stat"><span>Contribuído</span><b>{brl(carteira.contribuido)}</b></div>
        <div className="w-stat"><span>Já resgatado</span><b>{brl(carteira.resgatado)}</b></div>
      </div>
    </div>
  )
}
