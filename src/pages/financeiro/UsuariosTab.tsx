import { useCallback, useEffect, useMemo, useState } from 'react'
import { brl, mesCurto } from '../../fundo/format'
import type { FinanceiroUsuariosResposta, FranqueadoFinanceiro, StatusRecebimento } from '../../fundo/types'
import { api, ApiError } from '../../lib/api'
import { Carregando, ErroBox, EstadoVazio } from '../shared'
import { ConectarModal } from './ConectarModal'

type Filtro = 'todos' | 'conectados' | 'sem_conexao'

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'conectados', label: 'Conectados' },
  { id: 'sem_conexao', label: 'Não conectados' },
]

/** Reaproveita as pílulas de etapa do pedido — mesma régua de cor do app. */
const STATUS_CLASSE: Record<StatusRecebimento, string> = {
  Adimplente: 'st-disponivel',
  Inadimplente: 'st-recusado',
  Cobrado: 'st-conferencia',
  'No prazo': 'st-solicitacao',
}

function StatusPill({ status }: { status: StatusRecebimento | null }) {
  const classe = status ? STATUS_CLASSE[status] : 'st-off'
  const icone = status === 'Adimplente' ? '✓' : status === 'Inadimplente' ? '!' : '•'
  return <span className={`fin-status ${classe}`}>{icone} {status ?? 'Sem status'}</span>
}

function SituacaoCredito({ f }: { f: FranqueadoFinanceiro }) {
  if (!f.adimplente) return <span className="td-sub">—</span>
  if (!f.usuario) return <span className="fin-alerta">Aguardando conexão</span>
  return f.creditado
    ? <span className="fin-ok">Na carteira</span>
    : <span className="td-sub">Sincronizar</span>
}

interface AcoesLinha {
  onConectar: (f: FranqueadoFinanceiro) => void
  onDesconectar: (f: FranqueadoFinanceiro) => void
}

function UsuarioConectado({ f, onDesconectar }: { f: FranqueadoFinanceiro } & Pick<AcoesLinha, 'onDesconectar'>) {
  const u = f.usuario!
  const como = f.vinculo_manual ? 'conectado manualmente' : 'conectado pelo e-mail'
  return (
    <>
      <div className="td-nome">{u.nome}</div>
      <div className="td-sub">{u.acesso_app ? como : `${como} · sem acesso ao app`}</div>
      {f.vinculo_manual && (
        <button type="button" className="link-btn danger fin-link" onClick={() => onDesconectar(f)}>
          Desconectar
        </button>
      )}
    </>
  )
}

function LinhaFranqueado({ f, onConectar, onDesconectar }: { f: FranqueadoFinanceiro } & AcoesLinha) {
  return (
    <tr className={f.usuario ? '' : 'row-sem-conexao'}>
      <td>
        <div className="td-nome">{f.franqueado}</div>
        <div className="td-sub">{f.email ?? 'sem e-mail no financeiro'}</div>
      </td>
      <td data-label="Usuário do HRM">
        {f.usuario ? <UsuarioConectado f={f} onDesconectar={onDesconectar} /> : (
          <div className="fin-conectar-cel">
            <span className="fin-sem-conexao">✕ Não conectado</span>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onConectar(f)}>
              Conectar e-mail
            </button>
          </div>
        )}
      </td>
      <td data-label="Status"><StatusPill status={f.status} /></td>
      <td className="num" data-label="Boleto">{f.boleto ? brl(f.boleto) : '—'}</td>
      <td className="num" data-label="Crédito (85%)"><b>{f.credito ? brl(f.credito) : '—'}</b></td>
      <td data-label="Carteira"><SituacaoCredito f={f} /></td>
    </tr>
  )
}

function filtrar(lista: FranqueadoFinanceiro[], filtro: Filtro, busca: string) {
  const q = busca.trim().toLowerCase()
  return lista.filter((f) =>
    (filtro === 'todos' || (filtro === 'conectados') === !!f.usuario) &&
    (!q || `${f.franqueado} ${f.email ?? ''} ${f.usuario?.nome ?? ''}`.toLowerCase().includes(q)))
}

/**
 * Franqueados da cobrança do fundo × usuários do HRM. Conecta quando o e-mail
 * do cadastro do Financeiro é o de login no HRM; o status é do Financeiro e
 * aqui é só leitura. Adimplente = 85% do boleto na carteira.
 */
export function UsuariosTab({ onToast }: { onToast: (m: string) => void }) {
  const [dados, setDados] = useState<FinanceiroUsuariosResposta | null>(null)
  const [competencia, setCompetencia] = useState<string | undefined>()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busca, setBusca] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sincronizando, setSincronizando] = useState(false)
  const [conectando, setConectando] = useState<FranqueadoFinanceiro | null>(null)

  const load = useCallback(async () => {
    try {
      setDados(await api.financeiroUsuarios(competencia))
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui carregar os usuários do financeiro')
    }
  }, [competencia])

  // Ver a nota em fundo/usePedidos.ts sobre esta regra.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  const visiveis = useMemo(() => filtrar(dados?.usuarios ?? [], filtro, busca), [dados, filtro, busca])

  const sincronizar = async () => {
    setSincronizando(true)
    try {
      const r = await api.sincronizarCreditos()
      await load()
      onToast(`Créditos em dia · ${r.criados} novos · ${r.atualizados} corrigidos · ${r.removidos} removidos`)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui sincronizar os créditos')
    } finally {
      setSincronizando(false)
    }
  }

  const conectado = async (mensagem: string) => {
    setConectando(null)
    await load()
    onToast(mensagem)
  }

  const desconectar = async (f: FranqueadoFinanceiro) => {
    if (!window.confirm(`Desconectar ${f.franqueado} de ${f.usuario?.nome}? ` +
      'Ele volta a casar só pelo e-mail do financeiro, e o crédito sai da carteira desse usuário.')) return
    try {
      await api.desconectarFranqueado(f.franqueado_norm)
      await load()
      onToast(`${f.franqueado} desconectado`)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não consegui desconectar')
    }
  }

  if (!dados && !error) return <Carregando texto="Carregando os franqueados do financeiro…" />
  const r = dados?.resumo

  return (
    <>
      {error && <ErroBox mensagem={error} />}

      <div className="ger-bar">
        <label className="fin-select">
          <span>Competência</span>
          <select value={dados?.competencia ?? ''} onChange={(e) => setCompetencia(e.target.value)}>
            {(dados?.competencias ?? []).map((c) => <option key={c} value={c}>{mesCurto(c)}</option>)}
          </select>
        </label>
        <div className="chips" role="group" aria-label="Filtrar por conexão">
          {FILTROS.map((f) => (
            <button key={f.id} type="button" className={`chip ${filtro === f.id ? 'active' : ''}`}
              onClick={() => setFiltro(f.id)}>{f.label}</button>
          ))}
        </div>
        <input className="co-search fin-busca" placeholder="Buscar franqueado ou e-mail…"
          value={busca} onChange={(e) => setBusca(e.target.value)} />
        <button type="button" className="btn btn-primary btn-sm" onClick={sincronizar} disabled={sincronizando}>
          {sincronizando ? 'Sincronizando…' : '↻ Sincronizar créditos'}
        </button>
      </div>

      {r && (
        <div className="fin-resumo">
          <span><b>{r.franqueados}</b> franqueados</span>
          <span><b>{r.conectados}</b> conectados</span>
          <span className={r.sem_conexao ? 'fin-sem-conexao' : ''}><b>{r.sem_conexao}</b> não conectados</span>
          <span><b>{r.adimplentes}</b> adimplentes</span>
          <span><b>{brl(r.credito)}</b> em crédito</span>
        </div>
      )}

      {visiveis.length === 0 ? (
        <EstadoVazio icone="🧾" titulo="Nenhum franqueado aqui"
          texto="Troque a competência ou o filtro. A lista vem do fechamento do Fundo de Marketing no Financeiro." />
      ) : (
        <div className="ger-table-wrap">
          <table className="ger-table ger-table--cards">
            <thead>
              <tr><th>Franqueado (financeiro)</th><th>Usuário do HRM</th><th>Status</th>
                <th>Boleto</th><th>Crédito (85%)</th><th>Carteira</th></tr>
            </thead>
            <tbody>
              {visiveis.map((f) => (
                <LinhaFranqueado key={f.franqueado_norm} f={f} onConectar={setConectando} onDesconectar={desconectar} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="ger-hint">
        Conecta quando o <b>e-mail do franqueado no Financeiro</b> (Fundos › Fundo de MKT ›
        Disparo, contato do franqueado) é o mesmo do <b>login no HRM</b>. O status de recebimento é editado só no
        Financeiro. Com <b>Adimplente</b>, 85% do boleto entra na carteira e 15% fica como taxa
        de administração; se o status mudar, o crédito sai. Sem e-mail igual, use <b>Conectar
        e-mail</b> para escolher o usuário — essa conexão vale acima do e-mail.
      </div>

      <ConectarModal key={conectando?.franqueado_norm ?? 'fechado'} franqueado={conectando}
        onClose={() => setConectando(null)} onConectado={conectado} />
    </>
  )
}
