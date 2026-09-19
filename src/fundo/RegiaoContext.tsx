import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { gravarRegiao, regiaoAtiva, type Region } from '../lib/region'
import { isGestor } from '../lib/session'
import { RegiaoCtx, type RegiaoState } from './regiaoStore'

/** Guarda a região ativa e a publica para as telas. A escolha é gravada no
 *  localStorage porque é `lib/api` quem a lê na hora de montar a URL — assim
 *  nenhuma chamada precisa receber a região como parâmetro. */
export function RegiaoProvider({ children }: { children: ReactNode }) {
  const [regiao, setRegiao] = useState<Region>(regiaoAtiva)
  const podeTrocar = isGestor()

  const definir = useCallback((r: Region) => {
    gravarRegiao(r)
    setRegiao(r)
  }, [])

  const value = useMemo<RegiaoState>(() => ({ regiao, definir, podeTrocar }),
    [regiao, definir, podeTrocar])

  return <RegiaoCtx.Provider value={value}>{children}</RegiaoCtx.Provider>
}
