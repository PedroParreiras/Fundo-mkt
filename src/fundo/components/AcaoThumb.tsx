import { api } from '../../lib/api'
import { tileGradient } from '../tile'
import type { Acao } from '../types'

/** Thumb da ação: imagem se o gestor subiu uma, senão o emoji sobre o
 *  gradiente. Fonte única — a vitrine, o resgate e o Gerenciar usam este. */
export function AcaoThumb({ acao, className = 'thumb', children }: {
  acao: Acao
  className?: string
  children?: React.ReactNode
}) {
  if (acao.tem_imagem) {
    return (
      <div className={`${className} thumb-img`}>
        <img src={api.imagemAcaoUrl(acao)} alt={acao.nome} loading="lazy" />
        {children}
      </div>
    )
  }
  return (
    <div className={className} style={{ background: tileGradient(acao.slug) }}>
      {children}
      {acao.emoji}
    </div>
  )
}
