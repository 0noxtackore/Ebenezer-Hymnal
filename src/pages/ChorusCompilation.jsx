import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Music } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'

const strip = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function parseLyrics(lyrics) {
  if (!lyrics) return []
  const blocks = lyrics
    .split(/\n\s*\n/)
    .map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean))
    .filter((b) => b.length > 0)

  const out = []
  let verse = 0
  for (const block of blocks) {
    let lines = [...block]
    let label = null

    const firstNorm = lines[0].replace(/[^\p{L}]/gu, '').toUpperCase()
    if (firstNorm === 'CORO') {
      label = 'CORO'
      lines = lines.slice(1)
    } else if (firstNorm === 'PUENTE') {
      label = 'PUENTE'
      lines = lines.slice(1)
    } else {
      const m = lines[0].match(/^(\d{1,3})[.\-–]\s*(.*)$/)
      if (m) lines = [m[2] || lines[0], ...lines.slice(1)]
      verse += 1
      label = String(verse)
    }
    if (lines.length > 0) out.push({ label, lines })
  }
  return out
}

export default function ChorusCompilation() {
  const { category, key } = useParams()
  const nav = useNavigate()
  const { hymns } = useData()

  const decodedCat = decodeURIComponent(category || '')
  const decodedKey = decodeURIComponent(key || '')

  const coros = useMemo(() => {
    return hymns
      .filter((h) => {
        const matchCat = strip(h.category) === strip(decodedCat)
        const k = (h.musicKey || '').trim() || 'Sin tono'
        const s = (h.scale || '').trim()
        const label = s ? k + ' ' + s : k
        return matchCat && label === decodedKey
      })
      .sort((a, b) => (a.number || 0) - (b.number || 0))
  }, [hymns, decodedCat, decodedKey])

  return (
    <div>
      <button className="btn ghost sm" style={{ marginBottom: 14 }} onClick={() => nav(-1)}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="compilation-header">
        <span className="compilation-icon">
          <Music size={24} />
        </span>
        <div>
          <h2 style={{ margin: 0 }}>{decodedKey}</h2>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            {coros.length} coro{coros.length !== 1 ? 's' : ''} · {decodedCat}
          </div>
        </div>
      </div>

      {coros.map((h, idx) => (
        <div key={h.id} className="compilation-coros">
          <div className="compilation-coros-header">
            <span className="compilation-coros-num">#{h.number}</span>
            <span className="compilation-coros-title">{h.title}</span>
          </div>
          <div className="lyrics">
            {parseLyrics(h.lyrics).map((v, i) => (
              <div className="verse" key={i}>
                {v.label && <div className="verse-label">{v.label}</div>}
                {v.lines.map((line, j) => (
                  <div className="verse-line" key={j}>{line}</div>
                ))}
              </div>
            ))}
            {!h.lyrics && <div className="muted">Sin letra disponible.</div>}
          </div>
          {idx < coros.length - 1 && <div className="compilation-divider" />}
        </div>
      ))}

      {coros.length === 0 && <div className="empty">No hay coros en esta tonalidad.</div>}
    </div>
  )
}
