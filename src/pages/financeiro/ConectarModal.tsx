import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../../fundo/components/Modal'
import type { FranqueadoFinanceiro, UsuarioLivre } from '../../fundo/types'
import { api, ApiError } from '../../lib/api'

interface Props {
  /** null = fechado. */
  franqueado: FranqueadoFinanceiro | null
  onClose: () => void
  onConectado: (mensagem: string) => void
}

/**
 * "Conectar e-mail": o gestor escolhe, entre os usuários do HRM que ainda não
 * estão ligados a nenhum franqueado, quem é o dono da carteira. O backend grava
 * o vínculo (vale acima do e-mail do financeiro) e já credita os boletos pagos.
 */
export function ConectarModal({ franqueado, onClose, onConectado }: Props) {
  const [livres, setLivres] = useState<UsuarioLivre[] | null>(null)
  const [busca, setBusca] = useState('')
  const [escolhido, setEscolhido] = useState<number | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!franqueado) return
    api.usuariosLivres()
      .then((r) => setLivres(r.usuarios))
      .catch((e) => setErro(e instanceof ApiError ? e.message : 'Não consegui listar os usuários do HRM'))
  }, [franqueado])

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return (livres ?? []).filter((u) => !q || `${u.nome} ${u.email}`.toLowerCase().includes(q))
  }, [livres, busca])

  const conectar = async () => {
    if (!franqueado || !escolhido) return
    setSalvando(true)
    setErro(null)
    try {
      const r = await api.conectarFranqueado(franqueado.franqueado_norm, escolhido)
      const nome = livres?.find((u) => u.id === escolhido)?.nome ?? 'usuário'
      onConectado(`${franqueado.franqueado} conectado a ${nome}` +
        (r.criados || r.atualizados ? ' · crédito lançado' : ''))
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não consegui conectar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal open={!!franqueado} onClose={onClose} title="Conectar e-mail"
      subtitle={franqueado ? `${franqueado.franqueado} · ${franqueado.email ?? 'sem e-mail no financeiro'}` : ''}>
      <div className="fin-conectar">
        <input className="co-search" autoFocus placeholder="Buscar usuário do HRM por nome ou e-mail…"
          value={busca} onChange={(e) => setBusca(e.target.value)} />
        <div className="fin-livres" role="radiogroup" aria-label="Usuários do HRM sem conexão">
          {livres === null && !erro && <div className="td-sub">Carregando os usuários…</div>}
          {livres !== null && visiveis.length === 0 && (
            <div className="td-sub">Nenhum usuário do HRM sem conexão com esse nome.</div>
          )}
          {visiveis.map((u) => (
            <button key={u.id} type="button" role="radio" aria-checked={escolhido === u.id}
              className={`fin-livre ${escolhido === u.id ? 'on' : ''}`} onClick={() => setEscolhido(u.id)}>
              <span className="td-nome">{u.nome}</span>
              <span className="td-sub">{u.email}</span>
            </button>
          ))}
        </div>
        {erro && <div className="co-warn">{erro}</div>}
        <div className="ger-hint">
          A conexão vale acima do e-mail do financeiro. Se o franqueado já pagou, o crédito de 85%
          entra na carteira do usuário escolhido agora.
        </div>
        <div className="ger-form-foot">
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary" disabled={!escolhido || salvando} onClick={conectar}>
            {salvando ? 'Conectando…' : 'Conectar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
