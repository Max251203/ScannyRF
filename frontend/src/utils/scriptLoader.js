// Загрузка внешних скриптов с кэшем и ожиданием готовности

const cache = new Map();

function loadScript(src) {
  if (cache.get(src)) return cache.get(src);
  const p = new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = src;
    tag.async = true;
    tag.onload = () => resolve(src);
    tag.onerror = () => {
      cache.delete(src);
      reject(new Error(`Не удалось загрузить ${src}`));
    };
    document.body.appendChild(tag);
  });
  cache.set(src, p);
  return p;
}

export function ensureScripts(urls = []) {
  return Promise.all(urls.map(loadScript));
}

async function waitFor(check, timeoutMs = 8000, stepMs = 50) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try { if (check()) return true; } catch {}
    await new Promise(r => setTimeout(r, stepMs));
  }
  return false;
}

// CKEditor 4.22.1 (standard) через CDN. Без локальных файлов.
export async function ensureCKE422() {
  if (window.CKEDITOR && window.CKEDITOR.status === 'loaded') return;

  // На случай "полудогруженного" глобала — уберём
  if (window.CKEDITOR && window.CKEDITOR.status !== 'loaded') {
    try { delete window.CKEDITOR; } catch {}
  }

  window.CKEDITOR_BASEPATH = 'https://cdn.ckeditor.com/4.22.1/standard/';
  await loadScript('https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js');

  // ждём событие загрузки лоадера/плагинов
  if (!window.CKEDITOR || window.CKEDITOR.status !== 'loaded') {
    let loadedFired = false;
    try { window.CKEDITOR.on('loaded', () => { loadedFired = true; }); } catch {}
    await waitFor(() => loadedFired || (window.CKEDITOR && window.CKEDITOR.status === 'loaded'), 8000, 50);
  }
}

// Mammoth с CDN
export async function ensureMammothCDN() {
  if (window.mammoth) return;
  const cdns = [
    'https://unpkg.com/mammoth@1.7.1/mammoth.browser.min.js',
    'https://cdn.jsdelivr.net/npm/mammoth@1.7.1/mammoth.browser.min.js',
  ];
  let lastErr = null;
  for (const url of cdns) {
    try {
      await loadScript(url);
      const ok = await waitFor(() => !!window.mammoth, 4000, 50);
      if (ok) return;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Не удалось загрузить mammoth с CDN');
}