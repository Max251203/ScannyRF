import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthAPI } from '../api'

import eyeOpen from '../assets/icons/eye-open.png'
import eyeClosed from '../assets/icons/eye-closed.png'
import camIcon from '../assets/icons/cam.png'
import iconG from '../assets/icons/social-google.png'
import iconF from '../assets/icons/social-facebook.png'
import iconVK from '../assets/icons/social-vk.png'

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function PasswordField({ value, onChange, placeholder, id }) {
  const [show, setShow] = useState(false)
  return (
    <div className="input-wrap pw-wrap">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        className="pw-toggle"
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
        title={show ? 'Скрыть пароль' : 'Показать пароль'}
      >
        <img src={show ? eyeOpen : eyeClosed} alt="" />
      </button>
    </div>
  )
}

export default function AuthModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState('login')
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [idn, setIdn] = useState('')
  const [pwd, setPwd] = useState('')

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [rpwd, setRpwd] = useState('')
  const [avatar, setAvatar] = useState(null)

  useEffect(() => { if (!open) reset() }, [open])
  const reset = () => { setMode('login'); setOk(false); setLoading(false); setError(''); setIdn(''); setPwd(''); setEmail(''); setUsername(''); setRpwd(''); setAvatar(null) }

  // Google GSI (рисуем, если есть client id)
  const googleBtnRef = useRef(null)
  useEffect(() => {
    if (!open) return
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return
    const init = () => {
      if (window.google?.accounts && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (resp) => {
            try { setLoading(true); setError(''); const u = await AuthAPI.google(resp.credential); onSuccess?.(u); onClose?.() }
            catch (e) { setError(e.message) } finally { setLoading(false) }
          }
        })
        window.google.accounts.id.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', width: 320 })
      }
    }
    const id = 'google-client-script'
    if (!document.getElementById(id)) {
      const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'
      s.id = id; s.async = true; s.defer = true; s.onload = init; document.body.appendChild(s)
    } else init()
  }, [open, onClose, onSuccess])

  const canLogin = ok && idn.trim().length > 0 && pwd.trim().length >= 1 && !loading
  const canRegister = ok && emailRx.test(email.trim()) && rpwd.trim().length >= 6 && !loading

  const submitLogin = async () => {
    if (!canLogin) return
    try { setLoading(true); setError(''); const u = await AuthAPI.login(idn.trim(), pwd); onSuccess?.(u); onClose?.() }
    catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const submitRegister = async () => {
    if (!canRegister) {
      if (!ok) setError('Подтвердите условия соглашения')
      else if (!emailRx.test(email.trim())) setError('Введите корректный e‑mail')
      else if (rpwd.trim().length < 6) setError('Пароль должен быть не менее 6 символов')
      return
    }
    try {
      setLoading(true); setError('')
      const u = await AuthAPI.register(email.trim(), username.trim(), rpwd)
      if (avatar) { const fd = new FormData(); fd.append('avatar', avatar); await AuthAPI.updateProfile(fd) }
      onSuccess?.(u); onClose?.()
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal auth-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>×</button>
        <h3 className="modal-title">{mode === 'login' ? 'Вход' : 'Регистрация'}</h3>

        {mode === 'login' ? (
          <>
            <div className="form-row"><input placeholder="Логин или e‑mail" value={idn} onChange={e => setIdn(e.target.value)} /></div>
            <div className="form-row"><PasswordField id="login-password" placeholder="Пароль" value={pwd} onChange={e => setPwd(e.target.value)} /></div>

            <div className="form-row agree">
              <label className="agree-line">
                <input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)} />
                <span className="agree-text">Принимаю условия <Link to="/terms" onClick={onClose}>Пользовательского соглашения</Link> и <Link to="/privacy" onClick={onClose}>Политики конфиденциальности</Link></span>
              </label>
            </div>

            {error && <div className="form-row form-error">{error}</div>}

            <div className="form-row two">
              <button className={`btn ${loading ? 'loading' : ''}`} disabled={!canLogin} onClick={submitLogin}>
                <span className="spinner" aria-hidden="true" /> <span className="label">Войти</span>
              </button>
              <button className="link-btn" onClick={() => { setMode('register'); setError('') }}>Нет аккаунта? → Регистрация</button>
            </div>
          </>
        ) : (
          <>
            <div className="avatar-uploader hint" onClick={() => document.getElementById('reg-avatar').click()}>
              {avatar
                ? <img src={URL.createObjectURL(avatar)} alt="" />
                : <div className="avatar-placeholder">
                    <img src={camIcon} alt="" className="cam-img" />
                    <span>Добавить фото</span>
                  </div>}
              <input id="reg-avatar" type="file" accept="image/*" hidden onChange={e => setAvatar(e.target.files?.[0] || null)} />
            </div>

            <div className="form-row"><input placeholder="E‑mail" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="form-row"><input placeholder="Логин (необязательно)" value={username} onChange={e => setUsername(e.target.value)} /></div>
            <div className="form-row"><PasswordField id="reg-password" placeholder="Пароль (мин. 6 символов)" value={rpwd} onChange={e => setRpwd(e.target.value)} /></div>

            <div className="form-row agree">
              <label className="agree-line">
                <input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)} />
                <span className="agree-text">Принимаю условия <Link to="/terms" onClick={onClose}>Пользовательского соглашения</Link> и <Link to="/privacy" onClick={onClose}>Политики конфиденциальности</Link></span>
              </label>
            </div>

            {error && <div className="form-row form-error">{error}</div>}

            <div className="form-row two">
              <button className={`btn ${loading ? 'loading' : ''}`} disabled={!canRegister} onClick={submitRegister}>
                <span className="spinner" aria-hidden="true" /> <span className="label">Зарегистрироваться</span>
              </button>
              <button className="link-btn" onClick={() => { setMode('login'); setError('') }}>Есть аккаунт? → Вход</button>
            </div>
          </>
        )}

        <div className="divider"><span>или</span></div>

        <div className="social-row socials-fixed">
          {/* Крупные заглушки (иконка внутри тянется на 100%) */}
          <button className="soc soc-lg" type="button" title="Google" onClick={() => alert('Скоро')}>
            <img src={iconG} alt="" />
          </button>
          <button className="soc soc-lg" type="button" title="Facebook" onClick={() => alert('Скоро')}>
            <img src={iconF} alt="" />
          </button>
          <button className="soc soc-lg" type="button" title="VK" onClick={() => alert('Скоро')}>
            <img src={iconVK} alt="" />
          </button>

          {/* Живая кнопка GSI (рисуется только если указан VITE_GOOGLE_CLIENT_ID) */}
          <div ref={googleBtnRef} className="soc-google-btn" />
        </div>
      </div>
    </div>
  )
}