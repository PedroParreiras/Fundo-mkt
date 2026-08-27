import type { Categoria, CategoriaMeta, Etapa, Modo, Status, TipoDocumento } from './types'

/** Metadados de apresentação das categorias. O catálogo em si vem da API;
 *  cor/sigla/subtítulo são identidade visual e vivem no front. */
export const CATEGORIAS: CategoriaMeta[] = [
  { id: 'tracao', name: 'Tração', short: 'TR', color: '#2563EB', tag: 'Materiais e mídia no seu PDV' },
  { id: 'recorrencia', name: 'Recorrência', short: 'RC', color: '#137A45', tag: 'Trazer o cliente de volta à loja' },
  { id: 'branding', name: 'Branding Local', short: 'BL', color: '#A86A12', tag: 'Marca forte na sua região' },
  { id: 'documento', name: 'Boleto ou Nota Fiscal', short: 'NF', color: '#5B21B6', tag: 'Você envia o documento e o time aprova' },
]

/** Nesta categoria o valor é do documento, não do catálogo: o formulário do
 *  gestor esconde o preço e o resgate pede valor + arquivo. */
export const CATEGORIA_DOCUMENTO: Categoria = 'documento'

export const TIPOS_DOCUMENTO: { id: TipoDocumento; label: string }[] = [
  { id: 'boleto', label: 'Boleto' },
  { id: 'nota_fiscal', label: 'Nota fiscal' },
]

export const catMeta = (id: Categoria) => CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0]

export const MODOS: Modo[] = ['Entrega', 'Ativação', 'Evento']

/** Esteira do pedido, na ordem. Espelha fundo_mkt_service.ETAPAS — o backend
 *  manda a lista junto com os pedidos; isto é o fallback e a fonte dos rótulos
 *  em telas que ainda não carregaram nada. */
export const ETAPAS: Etapa[] = ['solicitacao', 'conferencia', 'solicitado', 'disponivel']

/** Terminal e fora da esteira: alcançável de qualquer etapa, devolve o valor
 *  pra carteira e exige motivo. */
export const STATUS_RECUSADO = 'recusado' as const

export const ETAPA_LABEL: Record<Status, string> = {
  solicitacao: 'Solicitação',
  conferencia: 'Conferência',
  solicitado: 'Solicitado',
  disponivel: 'Disponível',
  recusado: 'Recusado',
}

/** Classe de cor do badge de status (definida em styles/fundo.css). */
export const ETAPA_CLASSE: Record<Status, string> = {
  solicitacao: 'st-solicitacao',
  conferencia: 'st-conferencia',
  solicitado: 'st-solicitado',
  disponivel: 'st-disponivel',
  recusado: 'st-recusado',
}

/** Nomes dos meses — usados no seletor de campanha e no cronograma. */
export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
