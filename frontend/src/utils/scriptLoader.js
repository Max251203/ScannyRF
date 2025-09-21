const loaded = new Map();

export function ensureScripts(urls = []) {
  const promises = urls.map(src => {
    if (loaded.get(src)) return loaded.get(src);
    const p = new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      tag.src = src;
      tag.async = true;
      tag.defer = true;
      tag.onload = () => resolve(src);
      tag.onerror = () => reject(new Error(`Не удалось загрузить ${src}`));
      document.body.appendChild(tag);
    });
    loaded.set(src, p);
    return p;
  });
  return Promise.all(promises);
}