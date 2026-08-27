import type { FundItem } from './types'

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const dateBR = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

export const todayBR = () => dateBR(new Date())

export function addDaysBR(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return dateBR(d)
}

/** Rótulo de prazo — muda conforme o modo de entrega da ação. */
export function etaLabel(it: FundItem): string {
  if (it.mode === 'Ativação') return `No ar em até ${addDaysBR(it.lead)}`
  if (it.mode === 'Evento') return `Planejamento em até ${addDaysBR(it.lead)} · data conforme o evento`
  return `Entrega prevista até ${addDaysBR(it.lead)}`
}

/** Palavra usada no aviso de prazo do checkout. */
export const modeLabel = (it: FundItem) =>
  it.mode === 'Ativação' ? 'Ativação' : it.mode === 'Evento' ? 'Planejamento' : 'Entrega'
