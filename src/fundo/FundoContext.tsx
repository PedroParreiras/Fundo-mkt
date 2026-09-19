import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, ApiError } from '../lib/api'
import { CARTEIRA_VAZIA, FundoCtx, type FundoState } from './fundoStore'
import { useRegiao } from './regiaoStore'
import type { Acao, Carteira, LojaOpcao } from './types'

export function FundoProvider({ children }: { children: ReactNode }) {
  // O catálogo é POR REGIÃO: trocar de operação no toggle refaz as buscas.
  const { regiao } = useRegiao()
  const [acoes, setAcoes] = useState<Acao[]>([])
  const [carteira, setCarteira] = useState<Carteira | null>(null)
  const [lojas, setLojas] = useState<LojaOpcao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [a, c, l] = await Promise.all([api.acoes(false, regiao), api.carteira(), api.lojas()])
      setAcoes(a.acoes)
      setCarteira(c)
      setLojas(l.lojas)
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui carregar o Fundo de Marketing')
    } finally {
      setLoading(false)
    }
  }, [regiao])

  // Busca inicial. A regra set-state-in-effect não distingue fetch-on-mount de
  // cascata de render: o setState acontece depois do await, não no corpo do
  // efeito. Sem TanStack Query neste app, este é o padrão.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  const value = useMemo<FundoState>(
    () => ({ acoes, carteira: carteira ?? CARTEIRA_VAZIA, lojas, loading, error, refresh: load }),
    [acoes, carteira, lojas, loading, error, load],
  )

  return <FundoCtx.Provider value={value}>{children}</FundoCtx.Provider>
}

