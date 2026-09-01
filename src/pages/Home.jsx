import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext.jsx'
import LazyImage from '../components/LazyImage.jsx'
import { Church, Music, Music2 } from 'lucide-react'

const CATEGORIES = [
  { label: 'Iglesia', icon: Church },
  { label: 'Alabanza', icon: Music },
  { label: 'Música', icon: Music2 }
]

export default function Home() {
  const nav = useNavigate()
  const { night } = useSettings()

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

      <div className="cat-row">
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="cat-circle">
              <span className="cat-icon">
                <Icon size={30} />
              </span>
              <span className="cat-label">{c.label}</span>
            </div>
          )
        })}
      </div>

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
