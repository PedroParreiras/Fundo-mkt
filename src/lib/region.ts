// Região = a OPERAÇÃO de quem está usando o fundo (MG · GO · ES).
//
// Espelho de `marketplace/src/lib/region.ts` e de `auth/services/regioes.py`:
// as três camadas leem as MESMAS flags (`can_access_marketplace_<uf>` em
// auth.users), com a MESMA precedência ES > GO > MG — o flag MG foi ligado em
// massa na migration original, então a UF nova é que manda. Editou a régua
// aqui? Sincronize as outras duas cópias.
//
// O que é regional no fundo: catálogo, resgates e a lista de carteiras. O
// CRONOGRAMA é global — só as ações recomendadas de cada campanha é que são
// filtradas.
import { isGestor, readUser, type SessionUser } from './session'

export type Region = 'MG' | 'GO' | 'ES'

/** Ordem de EXIBIÇÃO no toggle (MG primeiro, a operação legado). */
export const REGIOES: readonly Region[] = ['MG', 'GO', 'ES']

export const REGIAO_PADRAO: Region = 'MG'

export const REGIAO_NOME: Record<Region, string> = {
  MG: 'Minas Gerais',
  GO: 'Goiás',
  ES: 'Espírito Santo',
}

const CHAVE = 'fundo_region'

export function isRegion(v: string | null | undefined): v is Region {
  return !!v && (REGIOES as readonly string[]).includes(v)
}

/** A região do próprio usuário, pelas flags da sessão. */
export function regiaoDoUsuario(u: SessionUser | null = readUser()): Region {
  if (u?.can_access_marketplace_es) return 'ES'
  if (u?.can_access_marketplace_go) return 'GO'
  return REGIAO_PADRAO
}

/** A região que vai em `?region=` nas chamadas.
 *
 *  Gestor escolhe no toggle da navbar (guardado no localStorage); franqueado
 *  fica na dele. O gate real é o backend: ele IGNORA o parâmetro de quem não é
 *  gestor e resolve pelas flags — isto aqui só escolhe o que pedir. */
export function regiaoAtiva(): Region {
  if (!isGestor()) return regiaoDoUsuario()
  try {
    const guardada = localStorage.getItem(CHAVE)
    if (isRegion(guardada)) return guardada
  } catch {
    /* storage bloqueado: cai no default */
  }
  return REGIAO_PADRAO
}

export function gravarRegiao(r: Region): void {
  try {
    localStorage.setItem(CHAVE, r)
  } catch {
    /* sem storage a escolha vale só nesta sessão de tela */
  }
}
