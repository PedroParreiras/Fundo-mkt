import { useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { isGestor, readUser } from '../lib/session'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'
import NavbarSpacer from './NavbarSpacer'
import MenuToggle from './MenuToggle'
import { gravarNavbarAberta, lerNavbarAberta } from '../navbarState'
import '../navbar.css'

/* Top navbar — mirrors the HRM main-app navbar exactly (same DOM + classes,
   styled by the HRM design system in index.css): a fixed logo "toggle arrow"
   that slides the navbar down, brand, item links, and user + Sair on the right. */

const ITEMS = [
  { label: 'Loja do Fundo', icon: '🏪', to: '/fundo' },
  { label: 'Cronograma', icon: '🗓️', to: '/cronograma' },
  { label: 'Pedidos', icon: '📋', to: '/pedidos' },
]

// Só admin/manager. Fora de ITEMS porque o link não pode aparecer para o
// franqueado — o backend recusa as chamadas, mas a aba nem deve existir.
const GESTOR_ITEMS = [{ label: 'Gerenciar', icon: '🧭', to: '/gerenciar' }]

export function Layout() {
  /* Navbar aberta por padrão; o botão fecha. */
  const [isOpen, setIsOpenEstado] = useState(lerNavbarAberta)
  const setIsOpen = (v: boolean) => {
    setIsOpenEstado(v)
    gravarNavbarAberta(v)
  }
  /* Medido pelo NavbarSpacer, que empurra o topo da página. */
  const navRef = useRef<HTMLElement | null>(null)
  const { pathname } = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const user = readUser()
  const itens = isGestor(user) ? [...ITEMS, ...GESTOR_ITEMS] : ITEMS

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
      <nav ref={navRef} className={`navbar ${isOpen ? 'open' : ''}`}>
        <div className="navbar-brand">
          <a href="/system" className="navbar-brand-btn" aria-label="Ir para Honesty System">
            <span>H</span>onest<span className="logo-suffix">RM</span>
          </a>
        </div>

        <div className="navbar-menu" ref={menuRef}>
          {itens.map((item) => (
            <Link key={item.label} to={item.to} className={`navbar-item ${isActive(item.to) ? 'active' : ''}`}>
              <span className="navbar-item__icon" aria-hidden="true">{item.icon}</span>
              <span className="navbar-item__label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-end">
          {/* Mesma caixa para os três controles de ícone — cada um vinha com o
              padding do seu componente e a fileira saía desencontrada. */}
          <div className="navbar-icons">
            {user?.role === 'admin' && (
              <a href="/system/admin" className="navbar-icon-btn" title="Administrar" aria-label="Administrar">
                🛡️
              </a>
            )}
            <NotificationBell />
            <ThemeToggle />
          </div>
          <div className="navbar-user-info">
            <span className="navbar-user">{user?.name || user?.email || ''}</span>
            <button className="btn-logout-text" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </nav>

      <MenuToggle aberta={isOpen} onAlternar={() => setIsOpen(!isOpen)} />

      {/* Reserva, em fluxo, o espaço que a navbar-overlay ocupa. */}
      <NavbarSpacer navRef={navRef} open={isOpen} />

      <Outlet />
    </>
  )
}
