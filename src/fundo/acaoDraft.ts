import { REGIOES, type Region } from '../lib/region'
import type { Acao, AcaoPayload, Categoria, Modo } from './types'

/** Uma linha do quadro de regiões: vende ali? por quanto? */
export interface PrecoDraft {
  ativo: boolean
  preco: string
}

/** Campos editáveis de uma ação — os mesmos que o catálogo tem.
 *  Strings nos numéricos porque é o que o <input> devolve; a conversão (e a
 *  validação de verdade) acontece na borda da API. */
export interface AcaoDraft {
  nome: string
  descricao: string
  categoria: Categoria
  /** A mesma ação vende em MG · GO · ES, cada uma com o seu preço. */
  precos: Record<Region, PrecoDraft>
  emoji: string
  modo: Modo
  prazo_dias: string
}

/** Ação existente: o quadro que o backend mandou (região desligada mantém o
 *  último preço). Ação nova: só a região do toggle vem marcada. */
const precosDe = (a: Acao | undefined, regiao: Region): Record<Region, PrecoDraft> =>
  Object.fromEntries(REGIOES.map((r) => {
    const atual = a?.precos?.[r]
    return [r, {
      ativo: atual ? atual.ativo : !a && r === regiao,
      preco: atual ? String(atual.preco) : '',
    }]
  })) as Record<Region, PrecoDraft>

export const draftDe = (a: Acao | undefined, regiao: Region): AcaoDraft => ({
  nome: a?.nome ?? '',
  descricao: a?.descricao ?? '',
  categoria: a?.categoria ?? 'tracao',
  precos: precosDe(a, regiao),
  emoji: a?.emoji ?? '📦',
  modo: a?.modo ?? 'Entrega',
  prazo_dias: a ? String(a.prazo_dias) : '5',
})

const numero = (v: string) => Number(String(v).replace(',', '.')) || 0

export const draftParaApi = (d: AcaoDraft): AcaoPayload => ({
  nome: d.nome,
  descricao: d.descricao,
  categoria: d.categoria,
  // Só as regiões marcadas: a que ficou de fora sai de venda no backend.
  precos: Object.fromEntries(
    REGIOES.filter((r) => d.precos[r].ativo).map((r) => [r, numero(d.precos[r].preco)]),
  ),
  emoji: d.emoji,
  modo: d.modo,
  prazo_dias: Number(d.prazo_dias) || 0,
})
