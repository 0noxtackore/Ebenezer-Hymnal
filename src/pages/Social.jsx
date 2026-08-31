const OFFICIAL_URL = 'https://www.tabernaculoebenezer.com/'
const YOUTUBE_URL = 'https://www.youtube.com/@tabernaculoebenezer34'

const PHOTOS = [
  { src: '/images/oficial_home_1_00.png', alt: 'Tabernáculo Ebenezer' },
  { src: '/images/youtube-banner.jpg', alt: 'YouTube Tabernáculo Ebenezer' }
]

export default function Social() {
  return (
    <div className="card center">
      <h2>Visita nuestra página oficial</h2>
      <p className="muted">
        <strong>Tabernáculo Ebenezer</strong> es una iglesia cristiana ubicada en{' '}
        <strong>Barquisimeto, Venezuela</strong>. En su página oficial encontrarás su historia,
        mensajes y actividades, además de <strong>YouTube</strong> y{' '}
        <strong>culto en vivo</strong> para estar en contacto con la congregación dondequiera que estés.
      </p>

      <div className="gallery">
        {PHOTOS.map((p) => {
          const url = p.alt.includes('YouTube') ? YOUTUBE_URL : OFFICIAL_URL
          return (
            <a className="gallery-item" href={url} target="_blank" rel="noreferrer" key={p.src}>
              <img src={p.src} alt={p.alt} loading="lazy" />
              <span>{p.alt}</span>
            </a>
          )
        })}
      </div>

      <a className="btn" href={OFFICIAL_URL} target="_blank" rel="noreferrer">
        Ir a la página oficial
      </a>
    </div>
  )
}
