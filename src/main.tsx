import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './fundo-mkt-fx.css'
import App from './App.tsx'
import { initTheme } from './utils/theme'

// Apply the persisted platform theme (localStorage 'hrm_theme') before first
// render and follow live changes made in other tabs / other /system apps.
initTheme()

// Base vem do Vite: '/' no dev (localhost) e '/system/fundo-mkt/' no build.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
