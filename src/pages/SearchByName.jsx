import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { getIcon } from '../utils/icons.js'

export default function SearchByName() {
  const location = useLocation()
  const initialCat = location.state?.category || ''
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(initialCat)
  const { hymns, categories } = useData()
  const nav = useNavigate()

  const results = useMemo(() => {
    const strip = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const t = strip(q.trim())
    const catNorm = strip(cat)
    return hymns.filter((h) => {
      const matchesText = !t || strip(h.title + ' ' + h.number + ' ' + (h.category || '')).includes(t)
      const matchesCat = !catNorm || strip(h.category || '') === catNorm
      return matchesText && matchesCat
    })
  }, [q, cat, hymns])

  return (
    <div>
      <div className="search-pill">
        <i className="bi bi-search"></i>
        <input
          autoFocus
          placeholder="Buscar alabanza por nombre o número..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {categories.length > 0 && (
        <div className="chips">
          <button className={'chip' + (!cat ? ' active' : '')} onClick={() => setCat('')}>
            Todos
          </button>
          {categories.map((c) => {
            const Icon = getIcon(c.icon)
            return (
              <button
                key={c.id}
                className={'chip' + (cat === c.name ? ' active' : '')}
                onClick={() => setCat(c.name)}
              >
                <Icon size={14} /> {c.name}
              </button>
            )
          })}
        </div>
      )}

      <div className="count-pill">{results.length} alabanza(s) encontrada(s)</div>

      <ul className="hymn-list">
        {results.map((h) => (
          <li key={h.id} className="hymn-row" onClick={() => nav('/himno/' + h.id)}>
            <div className="hymn-num">{h.number}</div>
            <div className="hymn-meta">
              <div className="hymn-name">{h.title}</div>
              <div className="hymn-cat">{h.category || ''}</div>
            </div>
          </li>
        ))}
        {results.length === 0 && <div className="empty">Sin resultados.</div>}
      </ul>
    </div>
  )
}
