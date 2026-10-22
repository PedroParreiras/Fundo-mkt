import { useCallback, useEffect, useState } from 'react'
import { REGIAO_NOME, REGIOES, type Region } from '../../lib/region'
import { useRegiao } from '../../fundo/regiaoStore'
import { draftParaApi, type AcaoDraft } from '../../fundo/acaoDraft'
import { AcaoForm } from '../../fundo/components/AcaoForm'
import { AcaoThumb } from '../../fundo/components/AcaoThumb'
import { brl } from '../../fundo/format'
import { CATEGORIA_DOCUMENTO, catMeta } from '../../fundo/meta'
import type { Acao } from '../../fundo/types'
import { api, ApiError } from '../../lib/api'
import { Carregando, ErroBox, EstadoVazio } from '../shared'

/** "GO R$ 210,00 · ES R$ 199,00" — o preço da ação nas OUTRAS regiões em que
 *  está à venda, para o gestor comparar sem trocar o toggle. */
function outrasRegioes(a: Acao, regiao: Region): string {
  return REGIOES
    .filter((r) => r !== regiao && a.precos?.[r]?.ativo)
    .map((r) => (a.categoria === CATEGORIA_DOCUMENTO ? r : `${r} ${brl(a.precos![r]!.preco)}`))
    .join(' · ')
}

/** Catálogo de ações: criar, editar, reativar e dar baixa.
 *  Lista com `todas=1` porque o gestor precisa ver as desativadas. A lista é
 *  a da região do toggle; a ação em si é uma só e vende em várias regiões,
 *  cada uma com o seu preço (o formulário edita o quadro inteiro). */
export function ProdutosTab({ onChanged }: { onChanged: () => void }) {
  // Catálogo é por operação: o toggle da navbar troca a região listada.
  const { regiao } = useRegiao()
  const [acoes, setAcoes] = useState<Acao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editando, setEditando] = useState<Acao | null>(null)
  const [criando, setCriando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setAcoes((await api.acoes(true, regiao)).acoes)
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui carregar o catálogo')
    } finally {
      setLoading(false)
    }
  }, [regiao])

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

  /** `dataUrl` nulo = voltar ao emoji. Recarrega para o preview refletir. */
  const mudarImagem = async (id: number, dataUrl: string | null) => {
    setErroForm(null)
    try {
      const nova = dataUrl ? await api.salvarImagemAcao(id, dataUrl) : await api.removerImagemAcao(id)
      setEditando(nova)
      await load()
      onChanged()
    } catch (e) {
      setErroForm(e instanceof ApiError ? e.message : 'Não consegui salvar a imagem')
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
          <div className="ger-bar-count">{acoes.length} ações em {REGIAO_NOME[regiao]}</div>
          <button className="btn btn-primary" onClick={() => { setErroForm(null); setCriando(true) }}>
            + Nova ação
          </button>
        </div>
      )}

      {(criando || editando) && (
        <div className="ger-panel">
          <div className="ger-panel-title">{editando ? `Editando · ${editando.nome}` : 'Nova ação'}</div>
          <AcaoForm key={editando?.id ?? 'nova'} inicial={editando ?? undefined} regiao={regiao}
            salvando={salvando} erro={erroForm}
            onCancel={fechar} onSubmit={salvar}
            onImagem={editando ? (d) => void mudarImagem(editando.id, d) : undefined}
            onRemoverImagem={editando ? () => void mudarImagem(editando.id, null) : undefined} />
        </div>
      )}

      {acoes.length === 0 && !criando && (
        <EstadoVazio icone="🗂️" titulo="Catálogo vazio"
          texto="Crie a primeira ação para o franqueado poder resgatar." />
      )}

      {acoes.length > 0 && (
        <div className="ger-table-wrap">
          <table className="ger-table ger-table--cards">
            <thead>
              <tr>
                <th>Ação</th><th>Categoria</th><th>Preço {regiao}</th><th>Modo</th>
                <th>Prazo</th><th>Status</th><th />
              </tr>
            </thead>
            <tbody>
              {acoes.map((a) => (
                <tr key={a.id} className={a.ativo ? '' : 'row-off'}>
                  <td>
                    <div className="td-acao">
                      <AcaoThumb acao={a} className="td-emoji" />
                      <div>
                        <div className="td-nome">{a.nome}</div>
                        <div className="td-sub">{a.descricao || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Categoria">
                    <span className="cat-pill" style={{ background: catMeta(a.categoria).color }}>
                      {catMeta(a.categoria).name}
                    </span>
                  </td>
                  <td className="num" data-label={`Preço ${regiao}`}>
                    {a.categoria === CATEGORIA_DOCUMENTO ? '—' : brl(a.preco)}
                    {outrasRegioes(a, regiao) && (
                      <div className="td-sub td-regioes">também {outrasRegioes(a, regiao)}</div>
                    )}
                  </td>
                  <td data-label="Modo">{a.modo}</td>
                  <td className="num" data-label="Prazo">{a.prazo_dias}d</td>
                  <td data-label="Status">
                    <span className={`fo-status ${a.ativo ? 'st-disponivel' : 'st-off'}`}>
                      {a.ativo ? 'Ativa' : 'Desativada'}
                    </span>
                  </td>
                  <td className="acoes-col">
                    <button className="link-btn" onClick={() => { setErroForm(null); setCriando(false); setEditando(a) }}>
                      Editar
                    </button>
                    <button className="link-btn danger" onClick={() => alternarAtivo(a)}
                      title={`Só em ${REGIAO_NOME[regiao]} — as outras regiões não mudam`}>
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
