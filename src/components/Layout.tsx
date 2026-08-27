import { useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { isGestor, readUser } from '../lib/session'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

/* Top navbar — mirrors the HRM main-app navbar exactly (same DOM + classes,
   styled by the HRM design system in index.css): a fixed logo "toggle arrow"
   that slides the navbar down, brand, item links, and user + Sair on the right. */

const ITEMS = [
  { label: 'Loja do Fundo', to: '/fundo' },
  { label: 'Cronograma', to: '/cronograma' },
  { label: 'Pedidos', to: '/pedidos' },
]

// Só admin/manager. Fora de ITEMS porque o link não pode aparecer para o
// franqueado — o backend recusa as chamadas, mas a aba nem deve existir.
const GESTOR_ITEMS = [{ label: 'Gerenciar', to: '/gerenciar' }]

export function Layout() {
  const [isOpen, setIsOpen] = useState(false)
  const { pathname } = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const user = readUser()
  const itens = isGestor(user) ? [...ITEMS, ...GESTOR_ITEMS] : ITEMS

  // Close the navbar whenever the route changes (same as HRM). Ajuste de
  // estado durante o render — evita o efeito em cascata do setState no effect.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setIsOpen(false)
  }

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`)

  const logout = () => {
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    } catch {
      /* storage cleared anyway */
    }
    window.location.href = '/system/login'
  }

  return (
    <>
      <button
        className={`navbar-toggle-arrow ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Toggle Menu"
        aria-expanded={isOpen}
      >
        <img src={`${import.meta.env.BASE_URL}behonest-logo.svg`} alt="Be Honest Logo" className="toggle-logo" />
      </button>

      <nav className={`navbar ${isOpen ? 'open' : ''}`}>
        <div className="navbar-brand">
          <a href="/system" className="navbar-brand-btn" aria-label="Ir para Honesty System">
            <span>H</span>onest<span className="logo-suffix">RM</span>
          </a>
        </div>

        <div className="navbar-menu" ref={menuRef}>
          {itens.map((item) => (
            <Link key={item.label} to={item.to} className={`navbar-item ${isActive(item.to) ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="navbar-end">
          {user?.role === 'admin' && (
            <a href="/system/admin" className="navbar-item" title="Administrar">
              🛡️
            </a>
          )}
          <NotificationBell />
          <ThemeToggle />
          <div className="navbar-user-info">
            <span className="navbar-user">{user?.name || user?.email || ''}</span>
            <button className="btn-logout-text" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  )
}
