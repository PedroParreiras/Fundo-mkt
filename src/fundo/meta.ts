import type { Categoria, CategoriaMeta, Modo, Status } from './types'

/** Metadados de apresentação das categorias. O catálogo em si vem da API;
 *  cor/sigla/subtítulo são identidade visual e vivem no front. */
export const CATEGORIAS: CategoriaMeta[] = [
  { id: 'tracao', name: 'Tração', short: 'TR', color: '#2563EB', tag: 'Materiais e mídia no seu PDV' },
  { id: 'recorrencia', name: 'Recorrência', short: 'RC', color: '#137A45', tag: 'Trazer o cliente de volta à loja' },
  { id: 'branding', name: 'Branding Local', short: 'BL', color: '#A86A12', tag: 'Marca forte na sua região' },
]

export const catMeta = (id: Categoria) => CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0]

export const MODOS: Modo[] = ['Entrega', 'Ativação', 'Evento']

/** Esteira do pedido, na ordem. Espelha fundo_mkt_service.ETAPAS — o backend
 *  manda a lista junto com os pedidos; isto é o fallback e a fonte dos rótulos
 *  em telas que ainda não carregaram nada. */
export const ETAPAS: Status[] = ['solicitacao', 'conferencia', 'solicitado', 'disponivel']

export const ETAPA_LABEL: Record<Status, string> = {
  solicitacao: 'Solicitação',
  conferencia: 'Conferência',
  solicitado: 'Solicitado',
  disponivel: 'Disponível',
}

/** Classe de cor do badge de status (definida em styles/fundo.css). */
export const ETAPA_CLASSE: Record<Status, string> = {
  solicitacao: 'st-solicitacao',
  conferencia: 'st-conferencia',
  solicitado: 'st-solicitado',
  disponivel: 'st-disponivel',
}
