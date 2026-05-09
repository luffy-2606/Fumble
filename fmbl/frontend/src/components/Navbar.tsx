import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, LogOut, Menu, X, LayoutDashboard, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/matches', label: 'Matches' },
  { to: '/players', label: 'Players' },
  { to: '/teams', label: 'Teams' },
  { to: '/courts', label: 'Courts' },
  { to: '/resources', label: 'Resources' },
  { to: '/issuance', label: 'Issuance' },
]

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  function isActive(path: string) {
    return location.pathname === path ? 'nav-link active' : 'nav-link'
  }

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <Trophy size={22} strokeWidth={2.2} />
          <span className="brand-text">Fumble</span>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <nav className="navbar-links">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} className={isActive(l.to)}>{l.label}</Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/users" className={isActive('/users')}>Users</Link>
            )}
          </nav>
        )}

        {/* Desktop auth actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <span className="navbar-user">
                <LayoutDashboard size={13} />
                {`${user?.first_name} ${user?.last_name}`.split(' ')[0]}
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <LogOut size={14} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                <LogIn size={14} />
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                <UserPlus size={14} />
                Sign up
              </Link>
            </>
          )}
          {/* Mobile hamburger */}
          {isAuthenticated && (
            <button className="btn-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {isAuthenticated && menuOpen && (
        <div className="navbar-drawer">
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} className={isActive(l.to)} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/users" className={isActive('/users')} onClick={() => setMenuOpen(false)}>Users</Link>
          )}
          <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', marginTop: 8 }} onClick={handleLogout}>
            <LogOut size={14} /> Log out
          </button>
        </div>
      )}
    </header>
  )
}
