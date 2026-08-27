import { brl } from '../format'
import type { Carteira } from '../types'
import { Modal } from './Modal'

interface HistoryModalProps {
  open: boolean
  carteira: Carteira
  onClose: () => void
}

/** Extrato da carteira: contribuições (↑) e resgates (↓). */
export function HistoryModal({ open, carteira, onClose }: HistoryModalProps) {
  return (
    <Modal open={open} title="Histórico da carteira"
      subtitle="Contribuições e resgates do Fundo de Marketing" onClose={onClose}>
      <div className="modal-balance">Saldo atual <b>{brl(carteira.saldo)}</b></div>
      <div className="hist-list">
        {carteira.historico.length === 0 && (
          <div className="hr-date" style={{ padding: '18px 0' }}>Nenhum lançamento ainda.</div>
        )}
        {carteira.historico.map((h, i) => (
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
