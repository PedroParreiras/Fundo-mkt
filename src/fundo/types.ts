/** Contratos do Fundo de Marketing — espelham o JSON de /api/fundo-mkt/*. */
import type { Region } from '../lib/region'

export type { Region }

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

/** A oferta da ação numa região: preço e se está à venda ali. */
export interface PrecoRegiao {
  preco: number
  ativo: boolean
}

/** Quadro de ofertas por região. Região ausente = a ação nunca foi vendida ali. */
export type PrecosPorRegiao = Partial<Record<Region, PrecoRegiao>>

export interface Acao {
  id: number
  /** Chave estável usada pelo cronograma de campanhas (o id serial não serve). */
  slug: string
  nome: string
  descricao: string
  categoria: Categoria
  /** Preço NA REGIÃO consultada (cada operação tem o seu). */
  preco: number
  emoji: string
  modo: Modo
  prazo_dias: number
  /** À venda NA REGIÃO consultada — desativar em GO não tira de MG. */
  ativo: boolean
  ordem: number
  /** Imagem substitui o emoji na vitrine quando presente. */
  tem_imagem: boolean
  /** Carimbo da imagem — entra na URL p/ o navegador não servir a antiga. */
  imagem_v: number
  /** Região a que `preco` e `ativo` se referem; null = sem oferta nela. */
  region: Region | null
  /** Só na resposta do gestor: o quadro de todas as regiões, p/ o formulário. */
  precos?: PrecosPorRegiao
}

/** Corpo de criar/editar ação. `precos` é o conjunto COMPLETO de regiões à
 *  venda — região fora do mapa sai de venda (o preço fica guardado). */
export type AcaoPayload = Partial<Pick<Acao,
  'nome' | 'descricao' | 'categoria' | 'emoji' | 'modo' | 'prazo_dias' | 'ativo' | 'ordem'>> & {
  precos?: Partial<Record<Region, number>>
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
  /** Região em que o resgate foi feito — snapshot, não segue a ação. */
  region: Region
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
  /** Operação do usuário (gestor aparece em todas as regiões). */
  region: Region
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

// ---------------------------------------------------------------- financeiro
/** Status de recebimento que o Financeiro grava na cobrança do fundo. */
export type StatusRecebimento = 'No prazo' | 'Cobrado' | 'Adimplente' | 'Inadimplente'

/** Usuário do HRM ligado ao franqueado pelo e-mail do cadastro do financeiro. */
export interface UsuarioConectado {
  id: number
  nome: string
  email: string
  /** false = conectado, mas sem a flag do app: o saldo existe e ele não entra. */
  acesso_app: boolean
}

/** Um franqueado da cobrança do fundo numa competência. */
export interface FranqueadoFinanceiro {
  competencia: string
  franqueado_norm: string
  franqueado: string
  /** E-mail do cadastro de contatos do financeiro (null = sem cadastro). */
  email: string | null
  usuario: UsuarioConectado | null
  status: StatusRecebimento | null
  adimplente: boolean
  /** Soma das OS faturadas (boletos) da competência. */
  boleto: number
  /** 85% do boleto quando adimplente; 0 no resto. */
  credito: number
  /** O lançamento automático já está na carteira. */
  creditado: boolean
  /** Conectado pelo "Conectar e-mail" (vale acima do e-mail); pode desconectar. */
  vinculo_manual: boolean
}

/** Usuário do HRM ainda sem franqueado — a lista do "Conectar e-mail". */
export interface UsuarioLivre {
  id: number
  nome: string
  email: string
}

export interface FinanceiroUsuariosResposta {
  competencias: string[]
  competencia: string | null
  usuarios: FranqueadoFinanceiro[]
  resumo: { franqueados: number; conectados: number; sem_conexao: number; adimplentes: number; credito: number }
}

export interface FluxoMes {
  /** AAAA-MM. Boleto/crédito = mês da competência; utilizado = mês do resgate. */
  mes: string
  boletos: number
  adimplente: number
  nao_adimplente: number
  credito: number
  /** Pagou e não está conectado: crédito devido que ainda não tem dono. */
  credito_a_liberar: number
  taxa_adm: number
  utilizado: number
}

export interface FluxoCarteira {
  usuario_id: number
  nome: string
  email: string
  franqueado: string
  creditos: number
  creditos_fundo: number
  utilizado: number
  saldo: number
}

export interface FluxoResposta {
  meses: FluxoMes[]
  totais: Omit<FluxoMes, 'mes'>
  carteiras: FluxoCarteira[]
  pct_credito: number
  pct_taxa_adm: number
}

export interface SincronizacaoCreditos {
  criados: number
  atualizados: number
  removidos: number
  creditos: number
  valor_total: number
}
