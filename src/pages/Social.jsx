const OFFICIAL_URL = 'https://www.tabernaculoebenezer.com/'

const PHOTOS = [
  { src: '/images/oficial_home_1_00.png', alt: 'Tabernáculo Ebenezer' },
  { src: '/images/oficial_home_1_01.png', alt: 'Radio Ebenezer Online' }
]

export default function Social() {
  return (
    <div className="card center">
      <h2>Visita nuestra página oficial</h2>
      <p className="muted">
        <strong>Tabernáculo Ebenezer</strong> es una iglesia cristiana ubicada en{' '}
        <strong>Barquisimeto, Venezuela</strong>. En su página oficial encontrarás su historia,
        mensajes y actividades, además de audio, video, <strong>Radio Ebenezer</strong> y{' '}
        <strong>culto en vivo</strong> para estar en contacto con la congregación dondequiera que estés.
      </p>

      <div className="gallery">
        {PHOTOS.map((p) => (
          <a className="gallery-item" href={OFFICIAL_URL} target="_blank" rel="noreferrer" key={p.src}>
            <img src={p.src} alt={p.alt} loading="lazy" />
            <span>{p.alt}</span>
          </a>
        ))}
      </div>

      <a className="btn" href={OFFICIAL_URL} target="_blank" rel="noreferrer">
        Ir a la página oficial
      </a>
    </div>
  )
}
