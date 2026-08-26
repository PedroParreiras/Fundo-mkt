import type { CSSProperties } from 'react'

const page: CSSProperties = { maxWidth: 1320, margin: '0 auto', padding: 32 }

const STATS = [
  { label: 'Arrecadado', value: '—', hint: 'a integrar' },
  { label: 'Investido', value: '—', hint: 'a integrar' },
  { label: 'Saldo do fundo', value: '—', hint: 'a integrar' },
  { label: 'Lojas contribuintes', value: '—', hint: 'a integrar' },
]

export function Dashboard() {
  return (
    <div style={page} className="fm-page">
      <div className="page-header fm-head">
        <h1>Fundo MKT</h1>
        <div className="fm-title-rule" />
        <p className="subtitle">Fundo de marketing Be Honest — base do app.</p>
      </div>

      <div
        className="summary-grid fm-stagger"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginTop: 24 }}
      >
        {STATS.map((s) => (
          <div key={s.label} className="stat-card fm-card">
            <h3>{s.label}</h3>
            <div className="value">{s.value}</div>
            <span className="text-muted text-sm">{s.hint}</span>
          </div>
        ))}
      </div>

      <div className="glass-card fm-section" style={{ marginTop: 28, padding: 28 }}>
        <h2>Bem-vindo</h2>
        <p className="text-secondary" style={{ marginTop: 8 }}>
          Scaffold Vite + React + TS com o design system do HRM. As telas e
          integrações do fundo de marketing entram a partir daqui.
        </p>
      </div>
    </div>
  )
}
