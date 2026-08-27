import { useState } from 'react'
import { api, ApiError } from '../../lib/api'
import type { Pedido } from '../types'

/** Abre o boleto/NF do pedido. A rota exige o header de auth (é documento
 *  fiscal de um franqueado), então não dá pra usar <a href> direto: busca com
 *  o token e abre o blob. */
export function DocumentoLink({ pedido }: { pedido: Pedido }) {
  const [erro, setErro] = useState<string | null>(null)
  const [abrindo, setAbrindo] = useState(false)

  if (!pedido.tem_documento) return null

  const abrir = async () => {
    setAbrindo(true)
    setErro(null)
    try {
      window.open(await api.documentoUrl(pedido.id), '_blank', 'noopener')
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não consegui abrir o documento')
    } finally {
      setAbrindo(false)
    }
  }

  const rotulo = pedido.documento_tipo === 'boleto' ? 'Ver boleto' : 'Ver nota fiscal'
  return (
    <>
      <button className="doc-link" onClick={abrir} disabled={abrindo}>
        🧾 {abrindo ? 'Abrindo…' : rotulo}
      </button>
      {erro && <div className="file-hint erro">{erro}</div>}
    </>
  )
}
