// Sessão do HRM lida do localStorage (mesma origem behonest.com.br).
// É leitura de UI: o `user` é forjável, então nada aqui é autorização — o
// backend refaz a checagem em todo /api/fundo-mkt/*.

export interface SessionUser {
  name?: string
  email?: string
  role?: string
  can_access_fundo_mkt?: boolean
}

export function readUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** admin/manager — mantém o catálogo e move os pedidos na esteira. */
export const isGestor = (u = readUser()) => u?.role === 'admin' || u?.role === 'manager'

/** Gestor OU franqueado com a flag liberada. */
export const podeEntrar = (u = readUser()) => isGestor(u) || !!u?.can_access_fundo_mkt

export const userName = (u = readUser()) => u?.name || u?.email || 'Franqueado'
