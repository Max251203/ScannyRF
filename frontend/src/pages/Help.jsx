import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const DATA = [
  {
    title: 'Как получить закрывающие документы для бухгалтерии?',
    summary:
      'Момент оплаты сервиса банковской картой также является моментом подписания оферты. Мы не предоставляем акты или другие закрывающие документы…',
    body: [
      'Момент оплаты сервиса банковской картой также является моментом подписания оферты. Мы не предоставляем акты или другие закрывающие документы.',
      'При каждой оплате сервиса кассовый чек от платёжной системы приходит на e‑mail, указанный при регистрации. Этот чек можно использовать в качестве отчётного документа для подтверждения расхода в бухгалтерии.'
    ]
  },
  {
    title: 'Вопросы и ответы Сканни.рф',
    summary: 'Что это? Сборник часто задаваемых вопросов по сервису…',
    body: [
      'Это сборник самых частых вопросов, которые мы получаем от пользователей.',
      'Раздел регулярно пополняется: если не нашли ответ — напишите нам через форму обратной связи на странице помощи.'
    ]
  },
  {
    title: 'Как изменить или убрать фон в PDF‑файле?',
    summary:
      'Есть несколько способов: экспорт страницы как изображения и удаление фона, перегенерация PDF, замена страниц…',
    body: [
      'Способ 1. Экспортируйте нужную страницу PDF в изображение (PNG), удалите фон и верните страницу обратно в документ.',
      'Способ 2. Преобразуйте документ в PDF/A, затем верните в обычный PDF — иногда помогает избавиться от артефактов.',
      'В Сканни.рф фон подписи и печати удаляется автоматически при загрузке.'
    ]
  },
  {
    title: 'Как поставить подпись на документ через телефон?',
    summary:
      'Загрузите документ в Сканни.рф, добавьте фото подписи — сервис сам очистит фон и подгонит размер…',
    body: [
      'Откройте сайт в мобильном браузере, загрузите PDF или фото документа.',
      'Добавьте подпись: загрузите снимок подписи, сервис автоматически очистит фон и позволит задать размер и положение.',
      'Сохраните результат в PDF или JPG.'
    ]
  },
  {
    title: 'Как сделать подпись от руки в Word и PDF?',
    summary:
      'Подпись от руки можно получить, написав её на белом листе и отсканировав камерой, затем вставить в документ…',
    body: [
      'Напишите подпись на белом листе и сфотографируйте при хорошем освещении.',
      'Загрузите фото в Сканни.рф — фон очистится автоматически.',
      'Скачайте PNG и вставьте в Word или PDF, либо поставьте подпись прямо в нашем редакторе.'
    ]
  },
  {
    title: 'Как сделать подпись и печать без фона?',
    summary: 'Загрузите фото с телефона — фон удалится автоматически без потери качества…',
    body: [
      'В разделе добавления подписи/печати загрузите фото оттиска или подписи.',
      'Сервис удалит фон, сохранит оттенки и контур.',
      'Далее можно масштабировать и ставить на любой документ.'
    ]
  },
  {
    title: 'Как изменить PDF‑файл на телефоне?',
    summary: 'Можно отредактировать порядок страниц, удалить лишние, добавить новые и сохранить…',
    body: [
      'Загрузите PDF в Сканни.рф со смартфона.',
      'Переставьте, удалите или добавьте страницы — все операции выполняются в браузере.',
      'Сохраните результат одним файлом.'
    ]
  },
  {
    title: 'Право подписи документов за директора — как оформить?',
    summary: 'Оформите доверенность/приказ на подписание документов уполномоченным лицом…',
    body: [
      'Для права подписи оформляется доверенность или приказ по организации.',
      'В доверенности указываются перечень полномочий, срок, данные доверителя и представителя.',
      'Подтвердите документ печатью и подписью руководителя.'
    ]
  }
]

const slugify = (s) =>
  s.toLowerCase()
    .replace(/ё/g, 'e')
    .replace(/[^a-z0-9\u0400-\u04FF]+/gi, '-')
    .replace(/^-+|-+$/g, '')

const withSlugs = DATA.map((it) => ({ ...it, slug: slugify(it.title) }))

export default function Help() {
  const { slug } = useParams()
  return slug ? <HelpArticle slug={slug} /> : <HelpIndex />
}

/* ---- Список ---- */
function HelpIndex() {
  const [q, setQ] = useState('')
  const nav = useNavigate()

  const filtered = useMemo(() => {
    if (!q.trim()) return withSlugs
    const s = q.trim().toLowerCase()
    return withSlugs.filter(
      (it) =>
        it.title.toLowerCase().includes(s) ||
        (it.summary && it.summary.toLowerCase().includes(s))
    )
  }, [q])

  const open = (slug) => nav(`/help/${slug}`)

  return (
    <div className="help-page">
      <div className="container">
        {/* Поиск по центру, динамический */}
        <div className="help-head center">
          <div className="help-search only-input">
            <input
              type="search"
              placeholder="Поиск по вопросам…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <h1 className="help-title">Общие вопросы</h1>

        {/* Только этот блок скроллится */}
        <div className="help-grid" role="list">
          {filtered.map((it) => (
            <button
              key={it.slug}
              className="help-card"
              onClick={() => open(it.slug)}
              title={it.title}
              role="listitem"
            >
              <div className="help-card-title">{it.title}</div>
              {it.summary ? (
                <div className="help-card-text">{it.summary}</div>
              ) : null}
              <div className="help-card-go" aria-hidden="true">›</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="help-empty">Ничего не найдено по запросу «{q}»</div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---- Детальная ---- */
function HelpArticle({ slug }) {
  const nav = useNavigate()
  const item = withSlugs.find((x) => x.slug === slug)

  return (
    <div className="help-page">
      <div className="container">
        <div className="help-article-head">
          <button className="help-back" onClick={() => nav('/help')}>← Назад</button>
        </div>

        <h1 className="help-article-title">{item?.title || 'Вопрос'}</h1>

        <div className="help-article-body">
          {item?.body?.map((p, i) => <p key={i}>{p}</p>) || <p>Материал скоро появится.</p>}
        </div>
      </div>
    </div>
  )
}