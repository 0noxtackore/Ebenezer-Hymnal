import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'

export default function KeyList() {
  const { key } = useParams()
  const nav = useNavigate()
  const { hymns } = useData()

  const decoded = decodeURIComponent(key || '')
  const parts = decoded.split(' ')
  const musicKey = parts[0] || ''
  const scale = parts.slice(1).join(' ') || ''

  const results = useMemo(() => {
    return hymns.filter((h) => {
      const matchKey = (h.musicKey || '').trim() === musicKey
      const matchScale = !scale || (h.scale || '').trim() === scale
      return matchKey && matchScale
    })
  }, [hymns, musicKey, scale])

  return (
    <div>
      <button className="btn ghost sm" style={{ marginBottom: 14 }} onClick={() => nav(-1)}>
        <ArrowLeft size={16} /> Volver
      </button>

      <h2 style={{ margin: '0 0 4px' }}>{decoded || 'Sin tono'}</h2>
      <div className="count-pill">{results.length} alabanza(s)</div>

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
        {results.length === 0 && <div className="empty">Sin alabanzas en esta tonalidad.</div>}
      </ul>
    </div>
  )
}
