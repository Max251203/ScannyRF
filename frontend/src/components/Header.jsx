import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/images/logo-round.png'
import { useEffect, useState } from 'react'
import AuthModal from './AuthModal.jsx'
import { AuthAPI } from '../api'
import logoutIcon from '../assets/icons/logout.png'
import avatarDefault from '../assets/images/avatar-default.png'

export default function Header() {
  const nav=useNavigate(), loc=useLocation()
  const [authOpen,setAuthOpen]=useState(false)
  const [user,setUser]=useState(()=>{ const u=localStorage.getItem('user'); return u?JSON.parse(u):null })

  useEffect(()=>{ const t=localStorage.getItem('access'); if(t && !user) AuthAPI.me().then(u=>setUser(u)).catch(()=>{}) },[])
  useEffect(()=>{ const h=(e)=>{ setUser(e.detail); }; window.addEventListener('user:update',h); return ()=>window.removeEventListener('user:update',h)},[])

  const scrollTo=(id)=>{ const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}) }
  const goToSection=(id)=>(e)=>{ e.preventDefault(); if(loc.pathname!=='/') nav('/',{state:{scrollTo:id}}); else scrollTo(id) }
  const logout=()=>{ AuthAPI.logout(); setUser(null); if(loc.pathname.startsWith('/profile')) nav('/') }

  const label=user?.username||user?.email||'Профиль'
  const avatarSrc=user?.avatar_url||avatarDefault

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <a className="logo-wrap" href="/#/" onClick={(e)=>{e.preventDefault(); nav('/')}}>
          <img src={logo} alt="Сканни.рф"/><span>СКАННИ.РФ</span>
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
            <button className="link-btn" onClick={()=>setAuthOpen(true)}>Вход</button>
          ) : (
            <div className="user-box">
              <button className="user-chip accent" onClick={()=>nav('/profile')} title="Личный кабинет">
                <div className="chip-avatar"><img alt="" src={avatarSrc}/></div>
                <div className="chip-label accent">{label}</div>
              </button>
              <button className="icon-btn" onClick={logout} title="Выход">
                <img src={logoutIcon} alt="Выход"/>
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthModal open={authOpen} onClose={()=>setAuthOpen(false)} onSuccess={(u)=>setUser(u)} />
    </header>
  )
}