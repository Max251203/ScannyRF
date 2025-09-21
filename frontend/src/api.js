const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function authHeader() {
  const t = localStorage.getItem('access');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function buildError(text) {
  try {
    const data = text ? JSON.parse(text) : {};
    if (data.detail) return new Error(data.detail);
    if (typeof data === 'object' && data) {
      const parts = [];
      for (const k of Object.keys(data)) {
        const v = data[k];
        if (Array.isArray(v)) parts.push(v.join('\n'));
        else if (typeof v === 'string') parts.push(v);
      }
      if (parts.length) return new Error(parts.join('\n'));
    }
  } catch { /* ignore */ }
  return new Error('Ошибка запроса');
}

async function req(path, opts = {}) {
  const url = API + path;
  if (import.meta.env.DEV) console.debug('[API]', opts.method || 'GET', url);
  const res = await fetch(url, opts);
  const txt = await res.text();
  if (!res.ok) throw buildError(txt);
  return txt ? JSON.parse(txt) : {};
}

export const AuthAPI = {
  async login(identifier, password) {
    const data = await req('/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  },
  async register(email, username, password) {
    const data = await req('/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  },
  async google(id_token) {
    const data = await req('/auth/google/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token })
    });
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  },
  async facebook(access_token) {
    const data = await req('/auth/facebook/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token })
    });
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  },
  async vk(access_token, email) {
    const data = await req('/auth/vk/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token, email })
    });
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  },
  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  },
  me: () => req('/auth/me/', { headers: { ...authHeader() } }),
  updateProfile: async (formData) => {
    const res = await fetch(API + '/auth/profile/', { method: 'POST', headers: { ...authHeader() }, body: formData });
    const txt = await res.text();
    if (!res.ok) throw buildError(txt);
    const data = txt ? JSON.parse(txt) : {};
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  },
};