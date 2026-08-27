import { createContext, useContext } from 'react'
import type { Acao, Carteira, LojaOpcao } from './types'

/** Estado compartilhado das telas: catálogo, carteira e lojas do usuário.
 *  Vive num contexto porque as 4 páginas leem os mesmos três recursos — sem
 *  isso, trocar de aba refaz as mesmas 3 chamadas. */
export interface FundoState {
  acoes: Acao[]
  carteira: Carteira
  lojas: LojaOpcao[]
  loading: boolean
  error: string | null
  /** Recarrega catálogo + carteira (após resgate ou edição do catálogo). */
  refresh: () => Promise<void>
}

export const CARTEIRA_VAZIA: Carteira = { contribuido: 0, resgatado: 0, saldo: 0, historico: [] }

export const FundoCtx = createContext<FundoState | null>(null)

export function useFundo(): FundoState {
  const v = useContext(FundoCtx)
  if (!v) throw new Error('useFundo fora do FundoProvider')
  return v
}
