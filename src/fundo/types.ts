/** Contratos do Fundo de Marketing — espelham o JSON de /api/fundo-mkt/*. */

/** `documento` é a categoria em que o franqueado informa o valor e anexa
 *  boleto ou nota fiscal — não tem preço de tabela nem quantidade. */
export type Categoria = 'tracao' | 'recorrencia' | 'branding' | 'documento'

export type TipoDocumento = 'boleto' | 'nota_fiscal'

/** Como a ação é entregue — define o rótulo de prazo no resgate. */
export type Modo = 'Entrega' | 'Ativação' | 'Evento'

/** Esteira do pedido, na ordem em que o stepper mostra. */
export type Etapa = 'solicitacao' | 'conferencia' | 'solicitado' | 'disponivel'

/** `recusado` é terminal e fica FORA da esteira (etapa = -1). */
export type Status = Etapa | 'recusado'

export interface Acao {
  id: number
  /** Chave estável usada pelo cronograma de campanhas (o id serial não serve). */
  slug: string
  nome: string
  descricao: string
  categoria: Categoria
  preco: number
  emoji: string
  modo: Modo
  prazo_dias: number
  ativo: boolean
  ordem: number
  /** Imagem substitui o emoji na vitrine quando presente. */
  tem_imagem: boolean
  /** Carimbo da imagem — entra na URL p/ o navegador não servir a antiga. */
  imagem_v: number
}

export interface CategoriaMeta {
  id: Categoria
  name: string
  /** Sigla de 2 letras exibida no "logo" do grupo. */
  short: string
  color: string
  tag: string
}

export interface LojaOpcao {
  id: string
  nome: string
  cidade: string
}

export interface HistoricoEntrada {
  /** `in` = contribuição · `out` = resgate. */
  t: 'in' | 'out'
  desc: string
  date: string
  val: number
}

export interface Carteira {
  contribuido: number
  resgatado: number
  saldo: number
  historico: HistoricoEntrada[]
}

export interface PedidoLoja {
  name: string
  qty: number
}

export interface PedidoEvento {
  status: Status
  label: string
  date: string
  nota: string | null
}

export interface Pedido {
  id: number
  codigo: string
  acao_id: number | null
  nome: string
  emoji: string
  modo: Modo
  preco_unit: number
  unidades: number
  total: number
  status: Status
  status_label: string
  /** Índice da etapa atual em ETAPAS (0..3) — alimenta o stepper. */
  etapa: number
  previsao: string
  observacao: string | null
  date: string
  usuario_id: number
  usuario_nome: string
  categoria: Categoria
  documento_tipo: TipoDocumento | null
  motivo_recusa: string | null
  tem_documento: boolean
  documento_nome: string | null
  lojas: PedidoLoja[]
  eventos: PedidoEvento[]
}

export interface Campanha {
  id: number
  ano: number
  mes: number
  mes_nome: string
  trimestre: number
  tema: string
  descricao: string
  ativo: boolean
  /** Ações recomendadas, já resolvidas (só as ativas). */
  acoes: Acao[]
}

export interface PedidosResposta {
  pedidos: Pedido[]
  etapas: Etapa[]
  labels: Record<Status, string>
}


export interface UsuarioCarteira {
  id: number
  nome: string
  email: string
  role: string
  contribuido: number
  resgatado: number
  saldo: number
}

export interface Contribuicao {
  id: number
  usuario_id: number
  usuario_nome: string
  /** AAAA-MM — o formato que o <input type="month"> usa. */
  competencia: string
  competencia_br: string
  valor: number
  descricao: string
  origem: 'manual' | 'faturamento'
}
