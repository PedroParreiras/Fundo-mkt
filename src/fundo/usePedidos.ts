import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../lib/api'
import type { Pedido } from './types'

/**
 * Pedidos da tela. `todos=false` (padrão) traz só os do usuário logado — é o
 * que a aba "Pedidos" mostra; `todos=true` é a aba "Gerenciar" e o backend
 * recusa com 403 quem não é gestor.
 */
export function usePedidos(todos = false) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setPedidos((await api.pedidos(todos)).pedidos)
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui carregar os pedidos')
    } finally {
      setLoading(false)
    }
  }, [todos])

  // Busca inicial. A regra set-state-in-effect não distingue fetch-on-mount de
  // cascata de render: o setState acontece depois do await, não no corpo do
  // efeito. Sem TanStack Query neste app, este é o padrão.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  /** Troca de etapa (gestor). Devolve o rótulo novo, ou lança com a mensagem
   *  PT-BR do backend (ex.: "Mova o pedido uma etapa por vez"). */
  const mudarStatus = useCallback(async (id: number, status: string) => {
    const atualizado = await api.mudarStatus(id, status)
    setPedidos((list) => list.map((p) => (p.id === id ? atualizado : p)))
    return atualizado.status_label
  }, [])

  return { pedidos, loading, error, refresh: load, mudarStatus }
}
