import type { Acao, Categoria, Modo } from './types'

/** Campos editáveis de uma ação — os mesmos que o catálogo tem.
 *  Strings nos numéricos porque é o que o <input> devolve; a conversão (e a
 *  validação de verdade) acontece na borda da API. */
export interface AcaoDraft {
  nome: string
  descricao: string
  categoria: Categoria
  preco: string
  emoji: string
  modo: Modo
  prazo_dias: string
}

export const draftDe = (a?: Acao): AcaoDraft => ({
  nome: a?.nome ?? '',
  descricao: a?.descricao ?? '',
  categoria: a?.categoria ?? 'tracao',
  preco: a ? String(a.preco) : '',
  emoji: a?.emoji ?? '📦',
  modo: a?.modo ?? 'Entrega',
  prazo_dias: a ? String(a.prazo_dias) : '5',
})

export const draftParaApi = (d: AcaoDraft) => ({
  nome: d.nome,
  descricao: d.descricao,
  categoria: d.categoria,
  preco: Number(String(d.preco).replace(',', '.')) || 0,
  emoji: d.emoji,
  modo: d.modo,
  prazo_dias: Number(d.prazo_dias) || 0,
})
