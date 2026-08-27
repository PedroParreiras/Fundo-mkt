/** Contratos da aba "Fundo de Marketing" (portada do protótipo do Hub). */

/** Como a ação é entregue — define o rótulo de prazo no checkout. */
export type FundMode = 'Entrega' | 'Ativação' | 'Evento'

export interface FundCategory {
  id: string
  name: string
  /** Sigla de 2 letras exibida no "logo" do grupo. */
  short: string
  color: string
  tag: string
}

export interface FundItem {
  id: string
  cat: string
  name: string
  desc: string
  /** Preço por unidade, em reais. */
  price: number
  emoji: string
  mode: FundMode
  /** Prazo em dias corridos usado para calcular a previsão. */
  lead: number
}

export interface FundStore {
  id: string
  name: string
  city: string
}

export interface FundHistoryEntry {
  /** `in` = contribuição · `out` = resgate. */
  t: 'in' | 'out'
  desc: string
  date: string
  val: number
}

export type FundOrderStatus = 'prep' | 'trans' | 'done'

export interface FundOrderStore {
  name: string
  qty: number
}

export interface FundOrder {
  id: string
  emoji: string
  name: string
  date: string
  stores: FundOrderStore[]
  units: number
  total: number
  status: FundOrderStatus
  eta: string
}

export interface ScheduleMonth {
  m: string
  /** Mês 1-12, usado para destacar o mês atual. */
  n: number
  theme: string
  desc: string
  /** Ids de FUND_ITEMS recomendados para a campanha. */
  items: string[]
}

export interface ScheduleQuarter {
  q: string
  months: ScheduleMonth[]
}

/** Sub-abas internas da tela do fundo. */
export type FundView = 'store' | 'schedule' | 'orders'
