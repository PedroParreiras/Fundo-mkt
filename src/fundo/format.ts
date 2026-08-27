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
