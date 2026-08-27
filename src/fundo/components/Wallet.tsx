import { brl } from '../format'

interface WalletProps {
  balance: number
  contrib: number
  spent: number
  /** Nome de quem está logado, exibido na linha "Conectado como". */
  userName: string
  storeCount: number
  onOpenHistory: () => void
}

/** Cartão navy da carteira: saldo (abre o histórico) + contribuído/resgatado. */
export function Wallet({ balance, contrib, spent, userName, storeCount, onOpenHistory }: WalletProps) {
  return (
    <div className="wallet">
      <div className="w-left">
        <div className="w-hi">
          <span className="wdot" />
          Conectado como
          <b style={{ color: '#fff', marginLeft: 2 }}>{userName}</b> · Franqueado · {storeCount} lojas
        </div>
        <button className="balance-btn" onClick={onOpenHistory}>
          <span className="wl-label">Saldo na carteira</span>
          <span className="balance">{brl(balance)}</span>
          <span className="wl-hint">acumulado da sua contribuição de 1% · toque para ver o histórico ›</span>
        </button>
      </div>
      <div className="w-right">
        <div className="w-stat"><span>Contribuído em 2026</span><b>{brl(contrib)}</b></div>
        <div className="w-stat"><span>Já resgatado</span><b>{brl(spent)}</b></div>
      </div>
    </div>
  )
}
