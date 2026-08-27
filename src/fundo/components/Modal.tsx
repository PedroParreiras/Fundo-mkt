import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  subtitle: string
  onClose: () => void
  /** Classe extra do painel (o checkout usa `co`, que alarga o modal). */
  variant?: string
  children: ReactNode
}

/** Overlay + cabeçalho compartilhados pelo histórico e pelo checkout.
 *  Fecha no ✕, no clique fora e no Esc (igual ao protótipo). */
export function Modal({ open, title, subtitle, onClose, variant = '', children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal ${variant}`}>
        <div className="modal-head">
          <div>
            <div className="mh-title">{title}</div>
            <div className="mh-sub">{subtitle}</div>
          </div>
          <button className="modal-x" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
