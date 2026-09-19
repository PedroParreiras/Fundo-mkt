// Cliente HTTP do Fundo MKT. Reaproveita a sessão do HRM (localStorage, mesma
// origem behonest.com.br); 401/403 volta pro login do HRM, igual às outras
// ferramentas /system/. Nenhuma tela faz `fetch` solto — tudo passa por aqui.

import type {
  Acao, Campanha, Carteira, Contribuicao, LojaOpcao, Pedido, PedidosResposta,
  TipoDocumento, UsuarioCarteira,
} from '../fundo/types'
import { regiaoAtiva, type Region } from './region'

const TOKEN_KEY = 'auth_token'
const BASE = '/api/fundo-mkt'

function bounceToLogin(): void {
  const next = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.replace(`/system/login?next=${next}`)
}

/** Erro com a mensagem PT-BR que o backend devolve em `{error}`. */
export class ApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/** Toda chamada JSON do fundo carrega a REGIÃO ativa: catálogo, resgates e
 *  carteiras são por operação (MG · GO · ES). Fica aqui, e não em cada método,
 *  pra não existir chamada "sem região" por esquecimento — o backend ignora o
 *  parâmetro de quem não é gestor e resolve pelas flags do usuário. */
function comRegiao(path: string): string {
  if (!path.startsWith(BASE) || /[?&]region=/.test(path)) return path
  return `${path}${path.includes('?') ? '&' : '?'}region=${regiaoAtiva()}`
}

/** Monta a query ignorando o que veio vazio. As LEITURAS de tela passam
 *  `region` explícito — é o que faz o React refazer a busca quando o gestor
 *  troca de operação (dependência de verdade, não um localStorage escondido).
 *  Quem não passa cai na região ativa, em `comRegiao`. */
function query(params: Record<string, string | number | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&')
  return q ? `?${q}` : ''
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(comRegiao(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  })
  if (res.status === 401) {
    bounceToLogin()
    throw new ApiError('Sessão expirada', res.status)
  }
  if (!res.ok) {
    // 400/403 do backend vêm com mensagem pronta para o usuário.
    const body = await res.json().catch(() => null)
    throw new ApiError(body?.error || `${res.status} ${res.statusText}`, res.status)
  }
  return (await res.json()) as T
}

const get = <T>(path: string) => request<T>(path)
const send = <T>(method: string, path: string, body?: unknown) =>
  request<T>(path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })

export const api = {
  // catálogo
  acoes: (todas = false, region?: Region) =>
    get<{ acoes: Acao[] }>(`${BASE}/acoes${query({ todas: todas ? 1 : undefined, region })}`),
  criarAcao: (body: Partial<Acao>) => send<Acao>('POST', `${BASE}/acoes`, body),
  editarAcao: (id: number, body: Partial<Acao>) => send<Acao>('PUT', `${BASE}/acoes/${id}`, body),
  desativarAcao: (id: number) => send<Acao>('DELETE', `${BASE}/acoes/${id}`),

  // carteira + lojas
  carteira: () => get<Carteira>(`${BASE}/carteira`),
  lojas: () => get<{ lojas: LojaOpcao[] }>(`${BASE}/lojas`),

  /** URL da imagem da ação p/ <img src>. `v` invalida o cache do navegador
   *  quando o gestor troca a foto. Rota pública de propósito — <img> não manda
   *  header (o documento do pedido, que é sensível, tem rota autenticada). */
  imagemAcaoUrl: (a: { id: number; imagem_v: number }) =>
    `${BASE}/acoes/${a.id}/imagem?v=${a.imagem_v}`,
  salvarImagemAcao: (id: number, dataUrl: string) =>
    send<Acao>('POST', `${BASE}/acoes/${id}/imagem`, { data: dataUrl }),
  removerImagemAcao: (id: number) => send<Acao>('DELETE', `${BASE}/acoes/${id}/imagem`),

  // campanhas do cronograma
  campanhas: (todas = false, region?: Region) =>
    get<{ campanhas: Campanha[] }>(`${BASE}/campanhas${query({ todas: todas ? 1 : undefined, region })}`),
  criarCampanha: (body: Partial<Campanha> & { acao_ids?: number[] }) =>
    send<{ campanhas: Campanha[] }>('POST', `${BASE}/campanhas`, body),
  editarCampanha: (id: number, body: Partial<Campanha> & { acao_ids?: number[] }) =>
    send<{ campanhas: Campanha[] }>('PUT', `${BASE}/campanhas/${id}`, body),
  removerCampanha: (id: number) =>
    send<{ campanhas: Campanha[] }>('DELETE', `${BASE}/campanhas/${id}`),

  // carteiras (gestor)
  usuarios: (region?: Region) =>
    get<{ usuarios: UsuarioCarteira[] }>(`${BASE}/usuarios${query({ region })}`),
  contribuicoes: (usuarioId?: number, region?: Region) =>
    get<{ contribuicoes: Contribuicao[] }>(
      `${BASE}/contribuicoes${query({ usuario_id: usuarioId, region })}`),
  lancarContribuicao: (body: { usuario_id: number; competencia: string; valor: number; descricao?: string }) =>
    send<{ contribuicoes: Contribuicao[] }>('POST', `${BASE}/contribuicoes`, body),
  removerContribuicao: (id: number) =>
    send<{ contribuicoes: Contribuicao[] }>('DELETE', `${BASE}/contribuicoes/${id}`),

  // pedidos
  pedidos: (todos = false, region?: Region) =>
    get<PedidosResposta>(`${BASE}/pedidos${query({ todos: todos ? 1 : undefined, region })}`),
  resgatar: (body: {
    acao_id: number
    lojas: { nome: string; store_unique_id?: string; quantidade: number }[]
    /** Só na categoria documento: valor do boleto/NF, tipo e o arquivo. */
    valor?: number
    documento_tipo?: TipoDocumento
    documento?: string
  }) => send<Pedido>('POST', `${BASE}/pedidos`, body),

  /** Documento do pedido. Vem por fetch autenticado (não dá pra usar <a href>:
   *  é documento fiscal e a rota exige o header) e vira um blob local. */
  documentoUrl: async (pedidoId: number): Promise<string> => {
    const token = localStorage.getItem(TOKEN_KEY)
    const res = await fetch(`${BASE}/pedidos/${pedidoId}/documento`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new ApiError('Não consegui abrir o documento', res.status)
    return URL.createObjectURL(await res.blob())
  },
  mudarStatus: (id: number, status: string, nota?: string) =>
    send<Pedido>('PATCH', `${BASE}/pedidos/${id}/status`, { status, nota }),
}
