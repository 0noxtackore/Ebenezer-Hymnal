import { useSettings, COLORS } from '../context/SettingsContext.jsx'

const FONTS = [
  { key: 'system', label: 'System' },
  { key: 'serif', label: 'Serif' },
  { key: 'rounded', label: 'Rounded' },
  { key: 'mono', label: 'Mono' }
]

export default function Settings() {
  const { night, setNight, fontKey, setFontKey, fontSize, setFontSize, accent, setAccent } = useSettings()

  return (
    <div>
      <div className="card">
        <div className="field" style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ margin: 0 }}>
            <i className="bi bi-moon-stars" /> Modo nocturno
          </label>
          <label className="switch-ui">
            <input type="checkbox" checked={night} onChange={(e) => setNight(e.target.checked)} />
            <span className="slider" />
          </label>
        </div>
      </div>

      <div className="card">
        <div className="field">
          <label>Tipografía</label>
          <div className="seg">
            {FONTS.map((f) => (
              <button
                key={f.key}
                className={fontKey === f.key ? 'active' : ''}
                onClick={() => setFontKey(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Tamaño de letra: {fontSize}px</label>
          <input type="range" min="12" max="28" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
          <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => setFontSize(16)}>
            Por defecto
          </button>
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label>Color de acento</label>
          <div className="swatch-row">
            {COLORS.map((c) => (
              <div
                key={c.value}
                className={'swatch' + (accent === c.value ? ' active' : '')}
                style={{ background: c.value }}
                title={c.name}
                onClick={() => setAccent(c.value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
