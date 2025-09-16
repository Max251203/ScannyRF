import { useEffect, useMemo, useRef, useState } from 'react'
import d1 from '../assets/images/doc-1.png'
import d2 from '../assets/images/doc-2.png'
import d3 from '../assets/images/doc-3.png'
import d4 from '../assets/images/doc-4.png'
import d5 from '../assets/images/doc-5.png'
import d6 from '../assets/images/doc-6.png'

const DOCS = [
  { id: 0, title: 'Счёт', img: d1 },
  { id: 1, title: 'Акт', img: d2 },
  { id: 2, title: 'Договор', img: d3 },
  { id: 3, title: 'Накладная', img: d4 },
  { id: 4, title: 'Справка', img: d5 },
  { id: 5, title: 'Счёт‑фактура', img: d6 },
]

/* Скорости */
const AUTO_SPEED_DEG_PER_SEC = 18      // Автовращение (вне просмотра)
const TURN_SPEED = 90                  // Обычный доворот (стрелки/переключения) deg/s
const TURN_SPEED_FAST = 160            // Быстрый доворот (по клику на карточку) deg/s

/* Геометрия карусели */
const RADIUS = 300
const CARD_W = 240
const CARD_H = 160

// нормализация угла в диапазон (-180, 180] — возвращает «кратчайшую» разницу
function shortestDelta(fromDeg, toDeg) {
  const delta = ((((toDeg - fromDeg) % 360) + 540) % 360) - 180
  return delta // < 0 — назад ближе, > 0 — вперёд ближе
}

export default function Examples() {
  const [spin, setSpin] = useState(0)            // текущий угол сцены
  const [auto, setAuto] = useState(true)         // режим бесконечного вращения
  const [viewer, setViewer] = useState(null)     // индекс открытого документа
  const [viewerKey, setViewerKey] = useState(0)  // чтобы перезапустить анимацию «поп-ин»

  const autoRef = useRef(auto)
  const spinRef = useRef(spin)
  const rafRef = useRef(0)
  const lastRef = useRef(0)

  useEffect(() => { autoRef.current = auto }, [auto])
  useEffect(() => { spinRef.current = spin }, [spin])

  // Автовращение — только когда просмотр закрыт
  useEffect(() => {
    const tick = (t) => {
      if (!lastRef.current) lastRef.current = t
      const dt = (t - lastRef.current) / 1000
      lastRef.current = t
      if (autoRef.current && viewer === null) {
        setSpin((s) => s + AUTO_SPEED_DEG_PER_SEC * dt)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [viewer])

  const step = useMemo(() => 360 / DOCS.length, [])

  const pause = () => { autoRef.current = false; setAuto(false) }

  // Плавная анимация к целевому углу target
  const animateTo = (target, onDone, fast = false) => {
    const startAngle = spinRef.current
    const distAbs = Math.abs(target - startAngle)
    const speed = fast ? TURN_SPEED_FAST : TURN_SPEED     // используем отдельные скорости доворотов
    const ease = (p) => 1 - Math.pow(1 - p, 2.6)          

    let start = 0
    const frame = (t) => {
      if (!start) start = t
      const p = Math.min(1, (t - start) / (distAbs / speed * 1000 || 1))
      const ang = startAngle + (target - startAngle) * ease(p)
      setSpin(ang)
      if (p < 1) requestAnimationFrame(frame)
      else { setSpin(target); onDone && onDone() }
    }
    requestAnimationFrame(frame)
  }

  // Доворот к индексу i по кратчайшему пути
  const rotateToIndexNearest = (i, cb, fast = false) => {
    pause()
    const cur = spinRef.current
    const nominal = -i * step
    const d = shortestDelta(cur, nominal)
    const target = cur + d
    animateTo(target, cb, fast)
  }

  // Клик по карточке — быстрый доворот по кратчайшему пути и открытие просмотра
  const openViewer = (i) => {
    rotateToIndexNearest(i, () => {
      setViewer(i)
      setViewerKey((k) => k + 1)
    }, true)
  }

  // Закрытие просмотра — снова включаем бесконечное вращение
  const closeViewer = () => {
    setViewer(null)
    autoRef.current = true
    setAuto(true)
  }

  // Навигация в просмотре — остаёмся в «паузе», докручиваем фон по кратчайшему пути
  const prev = () => {
    setViewer((i) => {
      const n = (i - 1 + DOCS.length) % DOCS.length
      rotateToIndexNearest(n, () => {
        setViewer(n)
        setViewerKey((k) => k + 1)
      }, true)
      return i
    })
  }
  const next = () => {
    setViewer((i) => {
      const n = (i + 1) % DOCS.length
      rotateToIndexNearest(n, () => {
        setViewer(n)
        setViewerKey((k) => k + 1)
      }, true)
      return i
    })
  }

  return (
    <section className="section examples" id="examples">
      <div className="container">
        <div className="ellipse">
          <div className="ellipse-inner">
            <h3 className="ellipse-title">Просто подпиши документ на Сканни.рф</h3>
            <p className="ellipse-sub">
              Документы из сервиса выглядят как настоящие сканы с печатью и подписью. Загляни в примеры и убедись сам.
            </p>

            <div className="carousel3d">
              <div className="stage" style={{ width: CARD_W, height: CARD_H }}>
                {DOCS.map((d, i) => {
                  const angle = i * step + spin
                  return (
                    <button
                      key={d.id}
                      className="card3d"
                      style={{
                        width: CARD_W,
                        height: CARD_H,
                        transform: `rotateY(${angle}deg) translateZ(${RADIUS}px) rotateY(${-angle}deg)`
                      }}
                      onClick={() => openViewer(i)}
                      title={d.title}
                    >
                      <div className="doc-mini">
                        <div className="doc-title">{d.title}</div>
                        <img className="doc-img" src={d.img} alt="" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewer !== null && (
        <div className="viewer" role="dialog" aria-modal="true">
          <button className="viewer-close" onClick={closeViewer} aria-label="Закрыть">×</button>
          <button className="viewer-nav prev" onClick={prev} aria-label="Предыдущий">‹</button>
          <div key={viewerKey} className="viewer-card pop-in">
            <div className="doc-full">
              <div className="doc-title">{DOCS[viewer].title}</div>
              <img className="doc-img" src={DOCS[viewer].img} alt="" />
            </div>
          </div>
          <button className="viewer-nav next" onClick={next} aria-label="Следующий">›</button>
        </div>
      )}
    </section>
  )
}