import { useCallback, useEffect, useState } from 'react'
import { useFundo } from '../../fundo/fundoStore'
import { catMeta, MESES } from '../../fundo/meta'
import type { Campanha } from '../../fundo/types'
import { api, ApiError } from '../../lib/api'
import { Carregando, ErroBox, EstadoVazio } from '../shared'

interface Draft {
  ano: string
  mes: string
  tema: string
  descricao: string
  acao_ids: number[]
}

const novoDraft = (): Draft => ({
  ano: String(new Date().getFullYear()),
  mes: String(new Date().getMonth() + 1),
  tema: '',
  descricao: '',
  acao_ids: [],
})

const draftDe = (c: Campanha): Draft => ({
  ano: String(c.ano), mes: String(c.mes), tema: c.tema,
  descricao: c.descricao, acao_ids: c.acoes.map((a) => a.id),
})

/**
 * Campanhas do cronograma: o que aparece em cada mês e quais ações do catálogo
 * são recomendadas ali. Substituiu a lista chumbada no frontend — agora o
 * gestor monta o calendário sem depender de deploy.
 */
export function CampanhasTab({ onToast }: { onToast: (m: string) => void }) {
  const { acoes } = useFundo()
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editando, setEditando] = useState<Campanha | null>(null)
  const [criando, setCriando] = useState(false)
  const [draft, setDraft] = useState<Draft>(novoDraft)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setCampanhas((await api.campanhas(true)).campanhas)
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui carregar as campanhas')
    } finally {
      setLoading(false)
    }
  }, [])

  // Ver a nota em fundo/usePedidos.ts sobre esta regra.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  const abrirNova = () => { setDraft(novoDraft()); setErroForm(null); setEditando(null); setCriando(true) }
  const abrirEdicao = (c: Campanha) => { setDraft(draftDe(c)); setErroForm(null); setCriando(false); setEditando(c) }
  const fechar = () => { setCriando(false); setEditando(null); setErroForm(null) }

  const alternaAcao = (id: number) =>
    setDraft((d) => ({
      ...d,
      acao_ids: d.acao_ids.includes(id) ? d.acao_ids.filter((x) => x !== id) : [...d.acao_ids, id],
    }))

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setErroForm(null)
    const body = {
      ano: Number(draft.ano), mes: Number(draft.mes), tema: draft.tema,
      descricao: draft.descricao, acao_ids: draft.acao_ids,
    }
    try {
      const r = editando ? await api.editarCampanha(editando.id, body) : await api.criarCampanha(body)
      setCampanhas(r.campanhas)
      fechar()
      onToast(editando ? 'Campanha atualizada' : 'Campanha criada')
    } catch (err) {
      setErroForm(err instanceof ApiError ? err.message : 'Não consegui salvar a campanha')
    } finally {
      setSalvando(false)
    }
  }

  const remover = async (c: Campanha) => {
    try {
      setCampanhas((await api.removerCampanha(c.id)).campanhas)
      onToast('Campanha removida')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui remover a campanha')
    }
  }

  if (loading) return <Carregando texto="Carregando as campanhas…" />

  return (
    <>
      {error && <ErroBox mensagem={error} />}

      {!criando && !editando && (
        <div className="ger-bar">
          <div className="ger-bar-count">{campanhas.length} campanhas no cronograma</div>
          <button className="btn btn-primary" onClick={abrirNova}>+ Nova campanha</button>
        </div>
      )}

      {(criando || editando) && (
        <div className="ger-panel">
          <div className="ger-panel-title">
            {editando ? `Editando · ${editando.mes_nome}/${editando.ano}` : 'Nova campanha'}
          </div>
          <form className="ger-form" onSubmit={salvar}>
            <div className="ger-grid">
              <label className="fld">
                <span>Mês</span>
                <select value={draft.mes} onChange={(e) => setDraft((d) => ({ ...d, mes: e.target.value }))}>
                  {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </label>
              <label className="fld">
                <span>Ano</span>
                <input type="number" min={2000} max={2100} value={draft.ano}
                  onChange={(e) => setDraft((d) => ({ ...d, ano: e.target.value }))} />
              </label>
              <label className="fld fld-wide">
                <span>Tema da campanha</span>
                <input value={draft.tema} placeholder="Dia dos Pais"
                  onChange={(e) => setDraft((d) => ({ ...d, tema: e.target.value }))} />
              </label>
              <label className="fld fld-wide">
                <span>Descrição</span>
                <textarea rows={2} value={draft.descricao}
                  placeholder="O que o franqueado deve fazer nessa data."
                  onChange={(e) => setDraft((d) => ({ ...d, descricao: e.target.value }))} />
              </label>
            </div>

            <div className="fld fld-wide" style={{ marginTop: 14 }}>
              <span>Ações recomendadas ({draft.acao_ids.length})</span>
              {acoes.length === 0 ? (
                <div className="file-hint">Cadastre ações em Produtos para poder recomendá-las aqui.</div>
              ) : (
                <div className="pick-list">
                  {acoes.map((a) => {
                    const on = draft.acao_ids.includes(a.id)
                    return (
                      <button type="button" key={a.id} className={`pick ${on ? 'on' : ''}`}
                        onClick={() => alternaAcao(a.id)}>
                        <span className="pick-check">{on ? '✓' : ''}</span>
                        <span className="pick-emoji">{a.emoji}</span>
                        <span className="pick-nome">{a.nome}</span>
                        <span className="cat-pill" style={{ background: catMeta(a.categoria).color }}>
                          {catMeta(a.categoria).short}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="ger-hint">
              Um mês por ano-calendário. A campanha do <b>mês corrente</b> aparece destacada no
              Cronograma; ação desativada some da recomendação sozinha.
            </div>

            {erroForm && <div className="co-warn" style={{ margin: '10px 0 0' }}>{erroForm}</div>}

            <div className="ger-form-foot">
              <button type="button" className="btn btn-ghost" onClick={fechar}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Criar campanha'}
              </button>
            </div>
          </form>
        </div>
      )}

      {campanhas.length === 0 && !criando && (
        <EstadoVazio icone="🗓️" titulo="Nenhuma campanha ainda"
          texto="Monte o calendário do ano e escolha quais ações entram em cada data." />
      )}

      {campanhas.length > 0 && (
        <div className="ger-table-wrap">
          <table className="ger-table">
            <thead>
              <tr><th>Quando</th><th>Tema</th><th>Descrição</th><th>Ações</th><th /></tr>
            </thead>
            <tbody>
              {campanhas.map((c) => (
                <tr key={c.id} className={c.ativo ? '' : 'row-off'}>
                  <td><b>{c.mes_nome}</b> {c.ano}<div className="td-sub">{c.trimestre}º trimestre</div></td>
                  <td><span className="mc-theme">{c.tema}</span></td>
                  <td className="td-sub">{c.descricao || '—'}</td>
                  <td>
                    {c.acoes.length === 0
                      ? <span className="td-sub">nenhuma</span>
                      : <div className="fo-stores">
                          {c.acoes.map((a) => (
                            <span className="fo-store-tag" key={a.id}>{a.emoji} {a.nome}</span>
                          ))}
                        </div>}
                  </td>
                  <td className="acoes-col">
                    <button className="link-btn" onClick={() => abrirEdicao(c)}>Editar</button>
                    <button className="link-btn danger" onClick={() => remover(c)}>Remover</button>
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
