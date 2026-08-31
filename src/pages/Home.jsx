import { useNavigate } from 'react-router-dom'
import { Church, Music, Music2 } from 'lucide-react'

const CATEGORIES = [
  { label: 'Iglesia', icon: Church },
  { label: 'Alabanza', icon: Music },
  { label: 'Música', icon: Music2 }
]

export default function Home() {
  const nav = useNavigate()

  return (
    <div className="home-screen">
      <section className="hero">
        <div className="hero-book">
          <img src="/images/logo.png" alt="Logo Himnario Ebenezer" />
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