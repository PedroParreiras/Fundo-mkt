import { brl } from '../format'
import type { FundHistoryEntry } from '../types'
import { Modal } from './Modal'

interface HistoryModalProps {
  open: boolean
  balance: number
  history: FundHistoryEntry[]
  onClose: () => void
}

/** Extrato da carteira: contribuições (↑ verde) e resgates (↓ azul). */
export function HistoryModal({ open, balance, history, onClose }: HistoryModalProps) {
  return (
    <Modal
      open={open}
      title="Histórico da carteira"
      subtitle="Contribuições e resgates do Fundo de Marketing"
      onClose={onClose}
    >
      <div className="modal-balance">Saldo atual <b>{brl(balance)}</b></div>
      <div className="hist-list">
        {history.map((h, i) => (
          <div className="hist-row" key={`${h.date}-${i}`}>
            <div className={`hr-ico ${h.t}`}>{h.t === 'in' ? '↑' : '↓'}</div>
            <div className="hr-info">
              <div className="hr-desc">{h.desc}</div>
              <div className="hr-date">{h.date}</div>
            </div>
            <div className={`hr-val ${h.t}`}>{h.t === 'in' ? '+' : '−'}{brl(h.val)}</div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
