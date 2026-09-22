import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './fundo-mkt-fx.css'
/* Guarda de telefone genérica — cópia replicada do hub (honesty/src/styles/mobile-guard.css). */
import './styles/mobile-guard.css'
import App from './App.tsx'
import { initTheme } from './utils/theme'
import { initUsageTracker } from './lib/usageTracker'

// Apply the persisted platform theme (localStorage 'hrm_theme') before first
// render and follow live changes made in other tabs / other /system apps.
initTheme()

// Telemetria de uso (/api/usage/track): páginas, tempo, cliques e
// digitação deste sub-app — é o que alimenta Administração ▸ Usage.
initUsageTracker()

// Base vem do Vite: '/' no dev (localhost) e '/system/fundo-mkt/' no build.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
