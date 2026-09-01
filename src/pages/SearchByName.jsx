import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { getIcon } from '../utils/icons.js'

const KEY_CATEGORIES = ['coros lentos', 'coros rapidos', 'gospel']
const MUSIC_KEYS = [
  'Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si',
  'Do bemol', 'Re bemol', 'Mi bemol', 'Sol bemol', 'La bemol', 'Si bemol',
  'Do menor', 'Re menor', 'Mi menor', 'Fa menor', 'Sol menor', 'La menor', 'Si menor'
]

const strip = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function SearchByName() {
  const location = useLocation()
  const initialCat = location.state?.category || ''
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(initialCat)
  const [musicKey, setMusicKey] = useState('')
  const { hymns, categories } = useData()
  const nav = useNavigate()

  const showKeyFilter = KEY_CATEGORIES.includes(strip(cat))

  const availableKeys = useMemo(() => {
    if (!showKeyFilter) return []
    const catNorm = strip(cat)
    const counts = {}
    hymns.forEach((h) => {
      if (strip(h.category) === catNorm && h.musicKey) {
        const k = h.musicKey.trim()
        if (k) counts[k] = (counts[k] || 0) + 1
      }
    })
    return MUSIC_KEYS.filter((k) => counts[k]).sort((a, b) => (counts[a] || 0) - (counts[b] || 0))
  }, [showKeyFilter, cat, hymns])

  const results = useMemo(() => {
    const t = strip(q.trim())
    const catNorm = strip(cat)
    return hymns.filter((h) => {
      const matchesText = !t || strip(h.title + ' ' + h.number + ' ' + (h.category || '') + ' ' + (h.musicKey || '')).includes(t)
      const matchesCat = !catNorm || strip(h.category || '') === catNorm
      const matchesKey = !musicKey || (h.musicKey || '').trim() === musicKey
      return matchesText && matchesCat && matchesKey
    })
  }, [q, cat, musicKey, hymns])

  const groupedResults = useMemo(() => {
    if (!showKeyFilter || musicKey) return null
    const groups = {}
    results.forEach((h) => {
      const k = h.musicKey || 'Sin tono'
      if (!groups[k]) groups[k] = []
      groups[k].push(h)
    })
    return groups
  }, [results, showKeyFilter, musicKey])

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
          <button className={'chip' + (!cat ? ' active' : '')} onClick={() => { setCat(''); setMusicKey('') }}>
            Todos
          </button>
          {categories.map((c) => {
            const Icon = getIcon(c.icon)
            return (
              <button
                key={c.id}
                className={'chip' + (cat === c.name ? ' active' : '')}
                onClick={() => { setCat(c.name); setMusicKey('') }}
              >
                <Icon size={14} /> {c.name}
              </button>
            )
          })}
        </div>
      )}

      {showKeyFilter && availableKeys.length > 0 && (
        <div className="chips" style={{ marginTop: 6 }}>
          <button className={'chip' + (!musicKey ? ' active' : '')} onClick={() => setMusicKey('')}>
            Todos los tonos
          </button>
          {availableKeys.map((k) => (
            <button
              key={k}
              className={'chip' + (musicKey === k ? ' active' : '')}
              onClick={() => setMusicKey(k)}
            >
              {k}
            </button>
          ))}
        </div>
      )}

      <div className="count-pill">{results.length} alabanza(s) encontrada(s)</div>

      {groupedResults ? (
        Object.entries(groupedResults).map(([key, items]) => (
          <div key={key}>
            <div className="group-header">{key} ({items.length})</div>
            <ul className="hymn-list">
              {items.map((h) => (
                <li key={h.id} className="hymn-row" onClick={() => nav('/himno/' + h.id)}>
                  <div className="hymn-num">{h.number}</div>
                  <div className="hymn-meta">
                    <div className="hymn-name">{h.title}</div>
                    <div className="hymn-cat">{h.musicKey || ''}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
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
      )}

      {results.length === 0 && <div className="empty">Sin resultados.</div>}
    </div>
  )
}
