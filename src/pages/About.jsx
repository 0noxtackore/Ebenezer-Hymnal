import { useSettings } from '../context/SettingsContext.jsx'

export default function About() {
  const { night } = useSettings()
  const dev = {
    name: '0noxtackore',
    avatar: 'https://github.com/0noxtackore.png',
    url: 'https://github.com/0noxtackore'
  }

  return (
    <div className="card center">
      <img
        src={night ? '/images/logo_dark.png' : '/images/logo_app.png'}
        alt="logo"
        draggable="false"
        style={{ width: 84, height: 84, borderRadius: '50%', marginBottom: 10 }}
      />
      <h2>Conócenos</h2>
      <p className="muted">
        Himnario Ebenezer — <i>Instrumento de Adoración</i>. Una app construida para llevar alabanzas al
        pueblo de Dios.
      </p>
      <h3 style={{ marginTop: 18 }}>Desarrollador</h3>
      <a className="dev-card" href={dev.url} target="_blank" rel="noreferrer">
        <img className="dev-avatar" src={dev.avatar} alt={dev.name} draggable="false" />
        <span className="dev-info">
          <strong>{dev.name}</strong>
          <span className="muted">Ver perfil en GitHub</span>
        </span>
      </a>
      <p className="muted dev-bio">
        <strong>0noxtackore</strong> es un <strong>arquitecto de software</strong> venezolano obsesionado con construir sistemas
        escalables y de ingeniería limpia. Pero el <strong>Himnario Ebenezer</strong> es mucho más que
        código: es su <strong>proyecto más querido y apasionado</strong> — una manera de entregar
        alabanzas al pueblo de Dios, combinar su fe con su oficio y dejar un legado de adoración hecho con
        el corazón.
      </p>
    </div>
  )
}
