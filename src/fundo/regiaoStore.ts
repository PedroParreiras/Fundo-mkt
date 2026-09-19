import { createContext, useContext } from 'react'
import type { Region } from '../lib/region'

/** Região ativa da tela. Só o gestor troca (toggle da navbar); para o
 *  franqueado é a dele e `podeTrocar` é false. Trocar a região refaz as buscas:
 *  catálogo, pedidos e carteiras são por operação. */
export interface RegiaoState {
  regiao: Region
  definir: (r: Region) => void
  podeTrocar: boolean
}

export const RegiaoCtx = createContext<RegiaoState | null>(null)

export function useRegiao(): RegiaoState {
  const v = useContext(RegiaoCtx)
  if (!v) throw new Error('useRegiao fora do RegiaoProvider')
  return v
}
