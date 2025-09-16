export default function Examples() {
  return (
    <section className="section examples" id="examples">
      <div className="container">
        <div className="circle-wrap">
          <div className="circle-cta">
            <h3>Просто подпиши документ на Сканни.рф</h3>
            <p>Документы из сервиса выглядят как настоящие сканы с печатью и подписью. Загляни в примеры и убедись сам.</p>
            <a className="btn" href="/#/editor" onClick={(e)=>e.preventDefault()||(location.hash='#/editor')}>Добавить документ</a>
          </div>
          <div className="marquee">
            <div className="doc">Счёт</div>
            <div className="doc">Акт</div>
            <div className="doc">Договор</div>
            <div className="doc">Накладная</div>
            <div className="doc">Счёт</div>
            <div className="doc">Акт</div>
            <div className="doc">Договор</div>
            <div className="doc">Накладная</div>
          </div>
        </div>
      </div>
    </section>
  )
}