import { useCallback, useEffect, useMemo, useState } from 'react'
import { brl } from '../../fundo/format'
import type { Contribuicao, UsuarioCarteira } from '../../fundo/types'
import { api, ApiError } from '../../lib/api'
import { Carregando, ErroBox, EstadoVazio } from '../shared'

/** Competência default = mês corrente, no formato do <input type="month">. */
function mesCorrente(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Carteira dos franqueados. Enquanto o 1% não é calculado por worker, é aqui
 * que o saldo entra: 1 lançamento por (usuário, competência). Relançar a mesma
 * competência SOBRESCREVE — o backend faz upsert para não dobrar o saldo.
 */
export function CarteirasTab({ onToast }: { onToast: (m: string) => void }) {
  const [usuarios, setUsuarios] = useState<UsuarioCarteira[]>([])
  const [lancamentos, setLancamentos] = useState<Contribuicao[]>([])
  const [alvo, setAlvo] = useState<number | null>(null)
  const [competencia, setCompetencia] = useState(mesCorrente())
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  const load = useCallback(async () => {
    try {
      const [u, c] = await Promise.all([api.usuarios(), api.contribuicoes()])
      setUsuarios(u.usuarios)
      setLancamentos(c.contribuicoes)
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui carregar as carteiras')
    } finally {
      setLoading(false)
    }
  }, [])

  // Ver a nota em fundo/usePedidos.ts sobre esta regra.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return q ? usuarios.filter((u) => `${u.nome} ${u.email}`.toLowerCase().includes(q)) : usuarios
  }, [usuarios, busca])

  const lancar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alvo) { setErroForm('Escolha o usuário'); return }
    setSalvando(true)
    setErroForm(null)
    try {
      await api.lancarContribuicao({
        usuario_id: alvo,
        competencia,
        valor: Number(valor.replace(',', '.')) || 0,
        descricao: descricao.trim() || undefined,
      })
      setValor('')
      setDescricao('')
      await load()
      onToast('Saldo lançado na carteira')
    } catch (err) {
      setErroForm(err instanceof ApiError ? err.message : 'Não consegui lançar o saldo')
    } finally {
      setSalvando(false)
    }
  }

  const remover = async (id: number) => {
    try {
      await api.removerContribuicao(id)
      await load()
      onToast('Lançamento removido')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui remover o lançamento')
    }
  }

  if (loading) return <Carregando texto="Carregando as carteiras…" />

  const selecionado = usuarios.find((u) => u.id === alvo)
  const doAlvo = alvo ? lancamentos.filter((l) => l.usuario_id === alvo) : lancamentos

  return (
    <>
      {error && <ErroBox mensagem={error} />}

      <div className="ger-panel">
        <div className="ger-panel-title">Lançar saldo na carteira</div>
        <form className="ger-form" onSubmit={lancar}>
          <div className="ger-grid">
            <label className="fld fld-wide">
              <span>Usuário</span>
              <select value={alvo ?? ''} onChange={(e) => setAlvo(Number(e.target.value) || null)}>
                <option value="">Escolha o franqueado…</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome} · {u.email}</option>
                ))}
              </select>
            </label>
            <label className="fld">
              <span>Competência</span>
              <input type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)} />
            </label>
            <label className="fld">
              <span>Valor (R$)</span>
              <input type="number" min="0.01" step="0.01" value={valor}
                onChange={(e) => setValor(e.target.value)} placeholder="1.200,00" />
            </label>
            <label className="fld fld-wide">
              <span>Descrição (opcional)</span>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)}
                placeholder="Contribuição · 1% de agosto de 2026" />
            </label>
          </div>

          <div className="ger-hint">
            Um lançamento por <b>usuário + competência</b>. Relançar a mesma competência
            <b> substitui</b> o valor — não soma. O cálculo automático de 1% do faturamento,
            quando existir, entra como origem <b>faturamento</b> e convive com estes.
          </div>

          {erroForm && <div className="co-warn" style={{ margin: '10px 0 0' }}>{erroForm}</div>}

          <div className="ger-form-foot">
            <button type="submit" className="btn btn-primary" disabled={salvando}>
              {salvando ? 'Lançando…' : 'Lançar saldo'}
            </button>
          </div>
        </form>
      </div>

      <div className="ger-bar">
        <div className="ger-bar-count">{usuarios.length} usuários com acesso ao fundo</div>
        <input className="co-search" style={{ maxWidth: 260, margin: 0 }} placeholder="Buscar usuário…"
          value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <div className="ger-table-wrap">
        <table className="ger-table">
          <thead>
            <tr><th>Usuário</th><th>Papel</th><th>Contribuído</th><th>Resgatado</th><th>Saldo</th><th /></tr>
          </thead>
          <tbody>
            {visiveis.map((u) => (
              <tr key={u.id} className={alvo === u.id ? 'row-on' : ''}>
                <td>
                  <div className="td-nome">{u.nome}</div>
                  <div className="td-sub">{u.email}</div>
                </td>
                <td>{u.role}</td>
                <td className="num">{brl(u.contribuido)}</td>
                <td className="num">{brl(u.resgatado)}</td>
                <td className="num"><b>{brl(u.saldo)}</b></td>
                <td className="acoes-col">
                  <button className="link-btn" onClick={() => setAlvo(u.id)}>Lançar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ger-panel-title" style={{ margin: '26px 0 12px' }}>
        Lançamentos {selecionado ? `· ${selecionado.nome}` : '(todos)'}
      </div>

      {doAlvo.length === 0 ? (
        <EstadoVazio icone="💰" titulo="Nenhum lançamento ainda"
          texto="Use o formulário acima para creditar a carteira do franqueado." />
      ) : (
        <div className="ger-table-wrap">
          <table className="ger-table">
            <thead>
              <tr><th>Competência</th><th>Usuário</th><th>Descrição</th><th>Origem</th><th>Valor</th><th /></tr>
            </thead>
            <tbody>
              {doAlvo.map((l) => (
                <tr key={l.id}>
                  <td>{l.competencia}</td>
                  <td>{l.usuario_nome}</td>
                  <td className="td-sub">{l.descricao}</td>
                  <td>{l.origem}</td>
                  <td className="num">{brl(l.valor)}</td>
                  <td className="acoes-col">
                    <button className="link-btn danger" onClick={() => remover(l.id)}>Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
