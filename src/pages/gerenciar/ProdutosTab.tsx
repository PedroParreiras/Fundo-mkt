import { useCallback, useEffect, useState } from 'react'
import { draftParaApi, type AcaoDraft } from '../../fundo/acaoDraft'
import { AcaoForm } from '../../fundo/components/AcaoForm'
import { brl } from '../../fundo/format'
import { catMeta } from '../../fundo/meta'
import type { Acao } from '../../fundo/types'
import { api, ApiError } from '../../lib/api'
import { Carregando, ErroBox, EstadoVazio } from '../shared'

/** Catálogo de ações: criar, editar, reativar e dar baixa.
 *  Lista com `todas=1` porque o gestor precisa ver as desativadas. */
export function ProdutosTab({ onChanged }: { onChanged: () => void }) {
  const [acoes, setAcoes] = useState<Acao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editando, setEditando] = useState<Acao | null>(null)
  const [criando, setCriando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setAcoes((await api.acoes(true)).acoes)
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui carregar o catálogo')
    } finally {
      setLoading(false)
    }
  }, [])

  // Ver a nota em fundo/usePedidos.ts sobre esta regra.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  const fechar = () => { setCriando(false); setEditando(null); setErroForm(null) }

  const salvar = async (d: AcaoDraft) => {
    setSalvando(true)
    setErroForm(null)
    try {
      if (editando) await api.editarAcao(editando.id, draftParaApi(d))
      else await api.criarAcao(draftParaApi(d))
      fechar()
      await load()
      onChanged()
    } catch (e) {
      setErroForm(e instanceof ApiError ? e.message : 'Não consegui salvar a ação')
    } finally {
      setSalvando(false)
    }
  }

  const alternarAtivo = async (a: Acao) => {
    try {
      // Baixa é lógica: reativar é só voltar o mesmo campo.
      if (a.ativo) await api.desativarAcao(a.id)
      else await api.editarAcao(a.id, { ativo: true })
      await load()
      onChanged()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui mudar a ação')
    }
  }

  if (loading) return <Carregando texto="Carregando o catálogo…" />

  return (
    <>
      {error && <ErroBox mensagem={error} />}

      {!criando && !editando && (
        <div className="ger-bar">
          <div className="ger-bar-count">{acoes.length} ações no catálogo</div>
          <button className="btn btn-primary" onClick={() => { setErroForm(null); setCriando(true) }}>
            + Nova ação
          </button>
        </div>
      )}

      {(criando || editando) && (
        <div className="ger-panel">
          <div className="ger-panel-title">{editando ? `Editando · ${editando.nome}` : 'Nova ação'}</div>
          <AcaoForm inicial={editando ?? undefined} salvando={salvando} erro={erroForm}
            onCancel={fechar} onSubmit={salvar} />
        </div>
      )}

      {acoes.length === 0 && !criando && (
        <EstadoVazio icone="🗂️" titulo="Catálogo vazio"
          texto="Crie a primeira ação para o franqueado poder resgatar." />
      )}

      {acoes.length > 0 && (
        <div className="ger-table-wrap">
          <table className="ger-table">
            <thead>
              <tr>
                <th>Ação</th><th>Categoria</th><th>Preço</th><th>Modo</th>
                <th>Prazo</th><th>Status</th><th />
              </tr>
            </thead>
            <tbody>
              {acoes.map((a) => (
                <tr key={a.id} className={a.ativo ? '' : 'row-off'}>
                  <td>
                    <div className="td-acao">
                      <span className="td-emoji">{a.emoji}</span>
                      <div>
                        <div className="td-nome">{a.nome}</div>
                        <div className="td-sub">{a.descricao || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="cat-pill" style={{ background: catMeta(a.categoria).color }}>
                      {catMeta(a.categoria).name}
                    </span>
                  </td>
                  <td className="num">{brl(a.preco)}</td>
                  <td>{a.modo}</td>
                  <td className="num">{a.prazo_dias}d</td>
                  <td>
                    <span className={`fo-status ${a.ativo ? 'st-disponivel' : 'st-off'}`}>
                      {a.ativo ? 'Ativa' : 'Desativada'}
                    </span>
                  </td>
                  <td className="acoes-col">
                    <button className="link-btn" onClick={() => { setErroForm(null); setCriando(false); setEditando(a) }}>
                      Editar
                    </button>
                    <button className="link-btn danger" onClick={() => alternarAtivo(a)}>
                      {a.ativo ? 'Desativar' : 'Reativar'}
                    </button>
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
