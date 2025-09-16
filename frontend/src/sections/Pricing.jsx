export default function Pricing() {
  return (
    <section className="section pricing" id="pricing">
      <div className="container">
        <h2>Гибко и выгодно</h2>
        <p className="lead">Начни с бесплатного тарифа, а дальше выбирай: поштучно или безлимит — в любой момент.</p>
        <div className="price-grid">
          <div className="card price">
            <div className="title">Один документ</div>
            <div className="val">99 ₽</div>
          </div>
          <div className="card price">
            <div className="title">Без ограничений</div>
            <div className="val">199 ₽/мес</div>
          </div>
          <div className="card price">
            <div className="title">Без ограничений PRO</div>
            <div className="val">1999 ₽/год</div>
          </div>
        </div>
      </div>
    </section>
  )
}