import { CATEGORIAS } from '../meta'

interface CategoriaChipsProps {
  /** Id da categoria ativa, ou 'all'. */
  ativa: string
  onChange: (id: string) => void
}

export function CategoriaChips({ ativa, onChange }: CategoriaChipsProps) {
  return (
    <div className="toolbar">
      <div className="chips">
        <div className={`chip ${ativa === 'all' ? 'active' : ''}`} onClick={() => onChange('all')}>
          Todas as categorias
        </div>
        {CATEGORIAS.map((c) => (
          <div key={c.id} className={`chip ${ativa === c.id ? 'active' : ''}`} onClick={() => onChange(c.id)}>
            <span className="dot" style={{ background: c.color }} />
            {c.name}
          </div>
        ))}
      </div>
    </div>
  )
}
