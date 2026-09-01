import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { getIcon } from '../utils/icons.js'

const KEY_CATEGORIES = ['coros lentos', 'coros rapidos', 'gospel']

const strip = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function SearchByName() {
  const location = useLocation()
  const initialCat = location.state?.category || ''
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(initialCat)
  const { hymns, categories } = useData()
  const nav = useNavigate()

  const isChorusMode = KEY_CATEGORIES.includes(strip(cat))

  const itemLabel = (() => {
    const n = strip(cat)
    if (n === 'himnos clasicos') return { noun: 'himno', adj: 'encontrado' }
    if (n === 'coros lentos' || n === 'coros rapidos' || n === 'gospel') return { noun: 'coro', adj: 'encontrado' }
    if (n === 'especiales') return { noun: 'alabanza', adj: 'encontrada' }
    return { noun: 'alabanza', adj: 'encontrada' }
  })()

  const chorusGroups = useMemo(() => {
    if (!isChorusMode) return null
    const catNorm = strip(cat)
    const groups = {}
    hymns.forEach((h) => {
      if (strip(h.category) !== catNorm) return
      const k = (h.musicKey || '').trim() || 'Sin tono'
      const s = (h.scale || '').trim()
      const label = s ? k + ' ' + s : k
      if (!groups[label]) groups[label] = { label, key: k, scale: s, items: [] }
      groups[label].items.push(h)
    })
    return Object.values(groups)
      .filter((g) => g.items.length > 0)
      .sort((a, b) => {
        if (a.label === 'Sin tono') return 1
        if (b.label === 'Sin tono') return -1
        return a.label.localeCompare(b.label, 'es')
      })
  }, [isChorusMode, cat, hymns])

  const results = useMemo(() => {
    const t = strip(q.trim())
    const catNorm = strip(cat)
    return hymns
      .filter((h) => {
        const matchesText = !t || strip(h.title + ' ' + h.number + ' ' + (h.category || '') + ' ' + (h.musicKey || '') + ' ' + (h.scale || '')).includes(t)
        const matchesCat = !catNorm || strip(h.category || '') === catNorm
        return matchesText && matchesCat
      })
      .sort((a, b) => (a.number || 0) - (b.number || 0))
  }, [q, cat, hymns])

  const filteredGroups = useMemo(() => {
    if (!chorusGroups) return null
    const t = strip(q.trim())
    if (!t) return chorusGroups
    return chorusGroups.filter((g) => strip(g.label).includes(t))
  }, [chorusGroups, q])

  return (
    <div>
      <div className="search-pill">
        <i className="bi bi-search"></i>
        <input
          autoFocus
          placeholder="Buscar por nombre o número..."
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

      {isChorusMode ? (
        <>
          <div className="count-pill">{filteredGroups ? filteredGroups.reduce((s, g) => s + g.items.length, 0) : 0} {itemLabel.noun}(s) en {filteredGroups ? filteredGroups.length : 0} tono(s)</div>
          <ul className="hymn-list">
            {filteredGroups && filteredGroups.map((g) => (
              <li
                key={g.label}
                className="hymn-row"
                onClick={() => nav('/coros/' + encodeURIComponent(strip(cat)) + '/' + encodeURIComponent(g.label))}
              >
                <div className="hymn-num" style={{ background: 'var(--gold)', color: '#fff', borderRadius: 10, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                  {g.items.length}
                </div>
                <div className="hymn-meta">
                  <div className="hymn-name">{g.label}</div>
                  <div className="hymn-cat">{cat}</div>
                </div>
              </li>
            ))}
          </ul>
          {filteredGroups && filteredGroups.length === 0 && <div className="empty">Sin resultados.</div>}
        </>
      ) : (
        <>
          <div className="count-pill">{results.length} {itemLabel.noun}(s) {itemLabel.adj}(s)</div>
          <ul className="hymn-list">
            {results.map((h) => (
              <li key={h.id} className="hymn-row" onClick={() => nav('/himno/' + h.id)}>
                <div className="hymn-num">{h.number}</div>
                <div className="hymn-meta">
                  <div className="hymn-name">{h.title}</div>
                  <div className="hymn-cat">{h.musicKey || ''}{h.musicKey && h.category ? ' · ' : ''}{h.category || ''}</div>
                </div>
              </li>
            ))}
          </ul>
          {results.length === 0 && <div className="empty">Sin resultados.</div>}
        </>
      )}
    </div>
  )
}
