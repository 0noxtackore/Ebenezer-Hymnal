import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext.jsx'
import { useData } from '../context/DataContext.jsx'
import LazyImage from '../components/LazyImage.jsx'
import { getIcon } from '../utils/icons.js'

export default function Home() {
  const nav = useNavigate()
  const { night } = useSettings()
  const { categories } = useData()

  return (
    <div className="home-screen">
      <section className="hero">
        <div className="hero-book">
          <LazyImage src={night ? '/images/logo_dark.png' : '/images/logo.png'} alt="Logo Himnario Ebenezer" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
        </div>
        <h1 className="hero-title">Himnario Ebenezer</h1>
        <div className="hero-tag">
          <span className="hero-dot" />
          Instrumento de Adoración
        </div>
      </section>

      {categories.length > 0 && (
        <div className="cat-row">
          {categories.map((c) => {
            const Icon = getIcon(c.icon)
            return (
              <div
                key={c.id}
                className="cat-circle"
                style={{ cursor: 'pointer' }}
                onClick={() => nav('/buscar-nombre', { state: { category: c.name } })}
              >
                <span className="cat-icon">
                  <Icon size={30} />
                </span>
                <span className="cat-label">{c.name}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="home-actions" style={{ marginTop: 14 }}>
        <button className="btn" onClick={() => nav('/buscar-numero')}>
          Buscar por número
        </button>
        <button className="btn gold" onClick={() => nav('/buscar-nombre')}>
          Buscar por nombre
        </button>
      </div>
    </div>
  )
}
