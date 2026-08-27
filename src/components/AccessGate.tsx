import type { ReactNode } from 'react'
import { podeEntrar } from '../lib/session'

/**
 * Porta de entrada do app. Gate de UI apenas — quem barra de verdade é o
 * backend (role admin/manager OU can_access_fundo_mkt) em todo endpoint.
 */
export function AccessGate({ children }: { children: ReactNode }) {
  if (podeEntrar()) return <>{children}</>

  return (
    <div className="fundo-app">
      <main className="wrap">
        <div className="empty" style={{ maxWidth: 520, margin: '60px auto' }}>
          <div className="ei">🔒</div>
          <div className="et">Em construção</div>
          <div className="ed">
            O Fundo de Marketing ainda está restrito ao time interno. Em breve ele fica
            disponível para os franqueados.
          </div>
          <a className="btn btn-primary" href="/system">Voltar para o Honesty System</a>
        </div>
      </main>
    </div>
  )
}
