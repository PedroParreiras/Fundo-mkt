// Chave de tela (deploy só manual, opção D, 05/11/2026): o que é visível nasce desligado. GET /api/fundo-mkt/chaves
// (auth/routes/fundo_mkt_chaves.py; a variável fica no auth/.env, lista em services/chaves_de_tela.py).
// Devolve null enquanto carrega e false se a chave não existe ou a leitura falhou: na dúvida, não mostra.
// Uma leitura por carga da página. Mesmo contrato do useChave do Financeiro e do Marketplace.
import { useEffect, useState } from 'react'
import { api } from './api'

let carga: Promise<Record<string, boolean>> | null = null

function chaves(): Promise<Record<string, boolean>> {
  carga ??= api.chaves()
    .then((r) => r.chaves)
    .catch(() => { carga = null; return {} })
  return carga
}

export function useChave(nome: string): boolean | null {
  const [ligada, setLigada] = useState<boolean | null>(null)
  useEffect(() => {
    let vivo = true
    void chaves().then((c) => { if (vivo) setLigada(c[nome] === true) })
    return () => { vivo = false }
  }, [nome])
  return ligada
}
