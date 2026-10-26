export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const dateBR = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

/** Prazo de uma ação AINDA não resgatada (o pedido já vem com `previsao`
 *  calculada pelo servidor — não recalcule lá). */
export function previsaoLabel(modo: string, prazoDias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + (prazoDias || 0))
  const alvo = dateBR(d)
  if (modo === 'Ativação') return `No ar em até ${alvo}`
  if (modo === 'Evento') return `Planejamento em até ${alvo} · data conforme o evento`
  return `Entrega prevista até ${alvo}`
}

/** Palavra usada no aviso de prazo do resgate. */
export const modoLabel = (modo: string) =>
  modo === 'Ativação' ? 'Ativação' : modo === 'Evento' ? 'Planejamento' : 'Entrega'

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** 'AAAA-MM' → 'set/26' (eixo e seletor de competência). */
export function mesCurto(aaaamm: string): string {
  const [ano, mes] = aaaamm.split('-')
  return `${MESES_CURTOS[Number(mes) - 1] ?? mes}/${ano.slice(2)}`
}

/** Valor compacto p/ eixo e rótulo de coluna: R$ 950 · R$ 12,4 mil · R$ 1,2 mi. */
export function brlCompacto(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 1e6) return `R$ ${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
  if (abs >= 1e3) return `R$ ${(v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
  return `R$ ${Math.round(v).toLocaleString('pt-BR')}`
}
