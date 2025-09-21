import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/images/logo-round.png'
import { useEffect, useState } from 'react'
import AuthModal from './AuthModal.jsx'
import { AuthAPI } from '../api'

export default function Header() {
  const nav = useNavigate()
  const loc = useLocation()

  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null
  })

  useEffect(() => {
    const t = localStorage.getItem('access')
    if (t && !user) AuthAPI.me().then(u => setUser(u)).catch(() => {})
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const goToSection = (id) => (e) => {
    e.preventDefault()
    if (loc.pathname !== '/') nav('/', { state: { scrollTo: id } }); else scrollTo(id)
  }

  const logout = () => { AuthAPI.logout(); setUser(null); if (loc.pathname.startsWith('/profile')) nav('/') }
  const label = user?.username || user?.email || 'Профиль'

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <a className="logo-wrap" href="/#/" onClick={(e) => { e.preventDefault(); nav('/') }}>
          <img src={logo} alt="Сканни.рф" /><span>СКАННИ.РФ</span>
        </a>

        <nav className="nav">
          <a href="#how-it-works" onClick={goToSection('how-it-works')}>Простой процесс</a>
          <a href="#examples" onClick={goToSection('examples')}>Какой результат</a>
          <a href="#pricing" onClick={goToSection('pricing')}>Цены</a>
          <Link to="/calculators">Калькуляторы</Link>
          <Link to="/help">Помощь</Link>
        </nav>

        <div className="actions">
          {!user ? (
            <button className="link-btn" onClick={() => setAuthOpen(true)}>Вход</button>
          ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="user-chip" onClick={() => nav('/profile')}>
                <div className="chip-avatar">
                  {user?.avatar_url ? <img alt="" src={user.avatar_url} /> : <span>{(label[0] || 'U').toUpperCase()}</span>}
                </div>
                <div className="chip-label">{label}</div>
              </button>
              <button className="link-btn" onClick={logout}>Выход</button>
            </div>
          )}
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={(u) => setUser(u)} />
    </header>
  )
}