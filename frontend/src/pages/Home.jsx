import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import heroImg from '../assets/images/hero-mascot.png'
import HowItWorks from '../sections/HowItWorks.jsx'
import Examples from '../sections/Examples.jsx'
import Pricing from '../sections/Pricing.jsx'

export default function Home() {
  const loc = useLocation()
  const nav = useNavigate()

  // При переходе из шапки/футера прокручиваем к нужному блоку
  useEffect(() => {
    const id = loc.state && loc.state.scrollTo
    if (id) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // сброс state, чтобы повторные клики работали
        nav('.', { replace: true, state: null })
      }, 0)
    }
  }, [loc.state, nav])

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>Подпиши и поставь печать на любой документ мгновенно</h1>
            <p>Никаких принтеров, сложных программ и ожидания. Доступно бесплатно</p>
            <a className="btn" href="/#/editor" onClick={(e) => e.preventDefault() || (location.hash = '#/editor')}>Добавить документ</a>
          </div>
          <div className="art">
            <img src={heroImg} alt="Сканни маскот" />
          </div>
        </div>
      </section>

      {/* Три шага */}
      <section className="section" id="steps">
        <div className="container">
          <div className="step-grid">
            <div className="card">
              <h3>Загружай документ</h3>
              <p className="lead">PDF, Word, Excel, скан или фото — убери лишние страницы и добавь нужные за пару секунд.</p>
            </div>
            <div className="card">
              <h3>Поставь подпись и печать</h3>
              <p className="lead">Подойдёт даже снимок с камеры. Загрузи фото — сервис сам очистит фон и сохранит все детали и оттенки.</p>
            </div>
            <div className="card">
              <h3>Скачай PDF или JPG</h3>
              <p className="lead">Готово!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Как работает (видео) */}
      <HowItWorks />

      {/* Примеры документов: круг + бегущая строка */}
      <Examples />

      {/* Блок преимуществ «Проще простого» */}
      <section className="section features">
        <div className="container">
          <h2>Проще простого</h2>
          <div className="step-grid">
            <div className="card">
              <h3>Чистая подпись и печать</h3>
              <p className="lead">Загрузи снимок с телефона, а сервис аккуратно удалит фон без потери качества и оттенков.</p>
            </div>
            <div className="card">
              <h3>Пропорции под контролем</h3>
              <p className="lead">Печать автоматически принимает стандартный диаметр, подпись — регулируй и вращай в пару кликов.</p>
            </div>
            <div className="card">
              <h3>Собери всё в один файл</h3>
              <p className="lead">Подойдут DOCX, JPG/PNG и PDF. Переставляй, удаляй, добавляй — потом скачай одним PDF.</p>
            </div>
          </div>
        </div>
      </section>

      {/* «Все подписи и печати — всегда под рукой» */}
      <section className="section pocket">
        <div className="container pocket-grid">
          <div>
            <h2>Все подписи и печати — всегда под рукой</h2>
            <ul className="bullet">
              <li>
                <h4>Телефон, планшет, компьютер — без разницы</h4>
                <p>Открой в браузере и работай с документами: подписи и печати доступны отовсюду.</p>
              </li>
              <li>
                <h4>Надёжное хранилище печатей</h4>
                <p>Загрузите один раз — дальше всё хранится безопасно и открывается в любое время.</p>
              </li>
              <li>
                <h4>Не храним ваши документы</h4>
                <p>Для безопасности удаляем любой подписанный документ через 24 часа — без следов.</p>
              </li>
            </ul>
          </div>
          <div className="pocket-illu" aria-hidden="true">
            {/* место под иллюстрацию маскота */}
          </div>
        </div>
      </section>

      {/* Цены */}
      <Pricing />
    </>
  )
}