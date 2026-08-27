// Cliente HTTP do Fundo MKT. Reaproveita a sessão do HRM (localStorage, mesma
// origem behonest.com.br); 401/403 volta pro login do HRM, igual às outras
// ferramentas /system/. Nenhuma tela faz `fetch` solto — tudo passa por aqui.

import type { Acao, Carteira, LojaOpcao, Pedido, PedidosResposta } from '../fundo/types'

const TOKEN_KEY = 'auth_token'
const BASE = '/api/fundo-mkt'

function bounceToLogin(): void {
  const next = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.replace(`/system/login?next=${next}`)
}

/** Erro com a mensagem PT-BR que o backend devolve em `{error}`. */
export class ApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  })
  if (res.status === 401) {
    bounceToLogin()
    throw new ApiError('Sessão expirada', res.status)
  }
  if (!res.ok) {
    // 400/403 do backend vêm com mensagem pronta para o usuário.
    const body = await res.json().catch(() => null)
    throw new ApiError(body?.error || `${res.status} ${res.statusText}`, res.status)
  }
  return (await res.json()) as T
}

const get = <T>(path: string) => request<T>(path)
const send = <T>(method: string, path: string, body?: unknown) =>
  request<T>(path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })

export const api = {
  // catálogo
  acoes: (todas = false) => get<{ acoes: Acao[] }>(`${BASE}/acoes${todas ? '?todas=1' : ''}`),
  criarAcao: (body: Partial<Acao>) => send<Acao>('POST', `${BASE}/acoes`, body),
  editarAcao: (id: number, body: Partial<Acao>) => send<Acao>('PUT', `${BASE}/acoes/${id}`, body),
  desativarAcao: (id: number) => send<Acao>('DELETE', `${BASE}/acoes/${id}`),

  // carteira + lojas
  carteira: () => get<Carteira>(`${BASE}/carteira`),
  lojas: () => get<{ lojas: LojaOpcao[] }>(`${BASE}/lojas`),

  // pedidos
  pedidos: (todos = false) => get<PedidosResposta>(`${BASE}/pedidos${todos ? '?todos=1' : ''}`),
  resgatar: (acao_id: number, lojas: { nome: string; store_unique_id?: string; quantidade: number }[]) =>
    send<Pedido>('POST', `${BASE}/pedidos`, { acao_id, lojas }),
  mudarStatus: (id: number, status: string, nota?: string) =>
    send<Pedido>('PATCH', `${BASE}/pedidos/${id}/status`, { status, nota }),
}
