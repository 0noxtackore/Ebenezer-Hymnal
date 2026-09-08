import { useMemo, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Music, Star, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useData } from '../context/DataContext.jsx'
import { useFavorites } from '../context/FavoritesContext.jsx'

const strip = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const ROMANS = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
  'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX'
]

function parseLyrics(lyrics) {
  if (!lyrics) return []
  const blocks = lyrics
    .split(/\n\s*\n/)
    .map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean))
    .filter((b) => b.length > 0)

  const out = []
  let verse = 0
  let coroFound = false
  for (const block of blocks) {
    let lines = [...block]
    let label = null

    const firstNorm = lines[0].replace(/[^\p{L}]/gu, '').toUpperCase()
    if (firstNorm === 'CORO') {
      if (coroFound) continue
      coroFound = true
      label = 'CORO'
      lines = lines.slice(1)
    } else if (firstNorm === 'PUENTE') {
      label = 'PUENTE'
      lines = lines.slice(1)
    } else {
      const m = lines[0].match(/^(\d{1,3})[.\-–]\s*(.*)$/)
      if (m) lines = [m[2] || lines[0], ...lines.slice(1)]
      verse += 1
      label = ROMANS[verse - 1] || String(verse)
    }
    if (lines.length > 0) out.push({ label, lines })
  }
  return out
}

export default function ChorusCompilation() {
  const { category, key } = useParams()
  const nav = useNavigate()
  const { hymns } = useData()
  const { isFavorite, toggle } = useFavorites()
  const [sharing, setSharing] = useState(false)
  const [toast, setToast] = useState('')
  const shareCardRef = useRef(null)

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

  const compilationId = strip(decodedCat) + '#' + decodedKey
  const fav = isFavorite(compilationId)

  const share = async () => {
    setSharing(true)
    try {
      const card = shareCardRef.current
      if (card && typeof html2canvas === 'function') {
        const canvas = await html2canvas(card, { scale: 1, backgroundColor: '#faf8f3', useCORS: true, logging: false })
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.7))
        if (blob) {
          const slug = `${decodedCat}-${decodedKey}`.toLowerCase().replace(/\s+/g, '-')
          const fileName = `${slug}-coros.jpg`
          const file = new File([blob], fileName, { type: 'image/jpeg' })

          if (navigator.share) {
            await navigator.share({ files: [file], title: `${decodedKey} - ${decodedCat}` })
            return
          }

          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          a.remove()
          setTimeout(() => URL.revokeObjectURL(url), 3000)
          setToast('Imagen descargada — compartela desde tu galeria')
          return
        }
      }
      setToast('No se pudo generar la imagen')
    } catch (e) {
      if (e.name !== 'AbortError') {
        setToast('Error al compartir')
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <div>
      <button className="btn ghost sm" style={{ marginBottom: 14 }} onClick={() => nav(-1)}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="compilation-header">
        <span className="compilation-icon">
          <Music size={24} />
        </span>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{decodedKey}</h2>
          <div className="compilation-sub">
            {coros.length} coro{coros.length !== 1 ? 's' : ''} · {decodedCat}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="compilation-action" onClick={() => toggle(compilationId)} title="Favorito">
            <Star size={20} fill={fav ? '#fff' : 'none'} />
          </button>
          <button className="compilation-action" onClick={share} title="Compartir" disabled={sharing}>
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {coros.map((h, idx) => (
        <div key={h.id} className="compilation-coros">
          <div className="compilation-coros-header">
            {h.nomenclature && <span className="compilation-coros-num">{h.nomenclature}</span>}
            {!h.nomenclature && <span className="compilation-coros-num">{h.number}</span>}
            <span className="compilation-coros-title">{h.title}</span>
          </div>
          <div className="lyrics">
            {parseLyrics(h.lyrics).map((v, i) => (
              <div className="verse" key={i}>
                {v.label && v.label !== 'CORO' && <div className="verse-label">{v.label}</div>}
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

      <div ref={shareCardRef} className="share-card" aria-hidden="true">
        <div className="share-card-logo">
          <img src="/images/logo.webp" alt="logo" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="share-card-app">{decodedCat} · {decodedKey}</div>
        <h3 className="share-card-title">{coros.length} Coro{coros.length !== 1 ? 's' : ''}</h3>
        <div className="share-card-lyrics">
          {coros.map((h, idx) => (
            <div key={h.id} style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#8a6d14', marginBottom: 4 }}>
                {h.nomenclature || h.number} — {h.title}
              </div>
              {parseLyrics(h.lyrics).map((v, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  {v.label && <div className="share-card-verse-label">{v.label}</div>}
                  <div className="share-card-verse-dir">
                    {v.lines.map((line, j) => (
                      <span key={j}>{line}</span>
                    ))}
                  </div>
                </div>
              ))}
              {idx < coros.length - 1 && <div style={{ borderTop: '1px solid #e0d8c4', margin: '12px 0' }} />}
            </div>
          ))}
        </div>
        <div className="share-card-foot">Instrumento de Adoración · Himnario Ebenezer</div>
      </div>

      {toast && (
        <div className="toast">
          <img src="/images/logo.webp" alt="logo" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
