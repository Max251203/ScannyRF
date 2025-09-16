import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/images/logo-round.png'

export default function Header() {
  const nav = useNavigate()
  const loc = useLocation()

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goToSection = (id) => (e) => {
    e.preventDefault()
    if (loc.pathname !== '/') {
      nav('/', { state: { scrollTo: id } })
    } else {
      scrollTo(id)
    }
  }

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <a className="logo-wrap" href="/#/" onClick={(e) => { e.preventDefault(); nav('/') }}>
          <img src={logo} alt="Сканни.рф" />
          <span>СКАННИ.РФ</span>
        </a>

        <nav className="nav">
          <a href="#how-it-works" onClick={goToSection('how-it-works')}>Простой процесс</a>
          <a href="#examples" onClick={goToSection('examples')}>Какой результат</a>
          <a href="#pricing" onClick={goToSection('pricing')}>Цены</a>
          <Link to="/calculators">Калькуляторы</Link>
          <Link to="/help">Помощь</Link>
        </nav>

        <div className="actions">
          <Link to="/profile">Вход</Link>
          <Link to="/editor" className="btn">Добавить документ</Link>
        </div>
      </div>
    </header>
  )
}