import type { ReactNode } from 'react'

/**
 * Porta de entrada do app enquanto o Fundo de Marketing não tem backend:
 * só admin do HRM vê a tela. É gate de UI (lê o `user` da sessão do HRM no
 * localStorage, portanto forjável) — vale como "ainda não é pra todo mundo",
 * NÃO como controle de acesso. Quando existir API do fundo, a autorização
 * real tem que ser no servidor + flag `can_access_fundo_mkt`.
 */
function isAdmin(): boolean {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw)?.role === 'admin' : false
  } catch {
    return false
  }
}

export function AdminOnly({ children }: { children: ReactNode }) {
  if (isAdmin()) return <>{children}</>

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
