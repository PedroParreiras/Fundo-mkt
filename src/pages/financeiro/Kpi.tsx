import { brl } from '../../fundo/format'

/** Cartão de número da aba Financeiro (Valores e Controle financeiro). */
export function Kpi({ label, valor, sub, destaque, tom }: {
  label: string; valor: number; sub?: string; destaque?: boolean
  /** Pinta o número: entrada = verde, saída = vermelho. */
  tom?: 'entrada' | 'saida'
}) {
  return (
    <div className={`fin-kpi${destaque ? ' fin-kpi--destaque' : ''}`}>
      <div className="fin-kpi-label">{label}</div>
      <div className={`fin-kpi-valor${tom ? ` fin-${tom}` : ''}`}>{brl(valor)}</div>
      {sub && <div className="fin-kpi-sub">{sub}</div>}
    </div>
  )
}
