import { useEffect } from 'react'
export default function OAuthCatch() {
  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1)
      const p = new URLSearchParams(hash)
      const token = p.get('access_token')
      const state = p.get('state')
      const email = p.get('email')
      if (window.opener && token && state) window.opener.postMessage({ provider: state, access_token: token, email }, '*')
    } catch {}
    setTimeout(() => window.close(), 200)
  }, [])
  return <div style={{ padding: 20 }}>Закрываем окно…</div>
}