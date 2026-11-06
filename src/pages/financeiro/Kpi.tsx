import { brl } from '../../fundo/format'

/** Cartão de número da aba Financeiro (Valores e Controle financeiro). */
export function Kpi({ label, valor, sub, destaque }: {
  label: string; valor: number; sub?: string; destaque?: boolean
}) {
  return (
    <div className={`fin-kpi${destaque ? ' fin-kpi--destaque' : ''}`}>
      <div className="fin-kpi-label">{label}</div>
      <div className="fin-kpi-valor">{brl(valor)}</div>
      {sub && <div className="fin-kpi-sub">{sub}</div>}
    </div>
  )
}
