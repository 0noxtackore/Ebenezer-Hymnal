import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import { Star, Share2, Play, Pause, ArrowLeft } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useFavorites } from '../context/FavoritesContext.jsx'
import LazyImage from '../components/LazyImage.jsx'

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
      label = ROMANS[verse - 1] || String(verse)
    }
    if (lines.length > 0) out.push({ label, lines })
  }
  return out
}

export default function HymnDetail() {
  const { id } = useParams()
  const { hymns } = useData()
  const { isFavorite, toggle } = useFavorites()
  const nav = useNavigate()

  const h = hymns.find((x) => String(x.id) === String(id))
  const fav = h ? isFavorite(h.id) : false

  const audioRef = useRef(null)
  const shareCardRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    setPlaying(false)
    setProgress(0)
  }, [id])

  if (!h) return <div className="empty">Himno no encontrado.</div>

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1200)
  }

  const share = async () => {
    setSharing(true)
    try {
      const card = shareCardRef.current
      if (!card) throw new Error('no-card')
      const canvas = await html2canvas(card, { scale: 2, backgroundColor: '#faf8f3', useCORS: true })
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
      if (!blob) throw new Error('no-blob')
      const catSlug = (h.category || 'himno').toLowerCase().replace(/\s+/g, '-')
      const file = new File([blob], `${catSlug}-${h.number}-${h.title.replace(/\s+/g, '-')}.png`, {
        type: 'image/png'
      })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${h.number}. ${h.title}`
        })
      } else {
        downloadBlob(blob, file.name)
      }
    } catch (e) {
      const url = window.location.href
      try {
        if (navigator.share) await navigator.share({ title: h.title, url })
        else {
          await navigator.clipboard.writeText(url)
          alert('No se pudo generar la captura; enlace copiado al portapapeles')
        }
      } catch {
        /* cancelado */
      }
    } finally {
      setSharing(false)
    }
  }

  const toggleAudio = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) {
      a.play()
      setPlaying(true)
    } else {
      a.pause()
      setPlaying(false)
    }
  }

  const onTime = () => {
    const a = audioRef.current
    if (a && a.duration) setProgress((a.currentTime / a.duration) * 100)
  }

  return (
    <div>
      <button className="btn ghost sm" style={{ marginBottom: 14 }} onClick={() => nav(-1)}>
        <ArrowLeft size={16} /> Volver
      </button>

      <motion.div
        className="hymn-header"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="hnum">{h.number}</div>
        <h2>{h.title}</h2>
        <div className="actions">
          <button className={fav ? 'on' : ''} onClick={() => toggle(h.id)} title="Favorito">
            <Star size={20} fill={fav ? 'currentColor' : 'none'} />
          </button>
          <button onClick={share} title="Compartir" disabled={sharing}>
            <Share2 size={20} />
          </button>
        </div>
      </motion.div>

      {h.audioUrl && (
        <div className="audio-bar">
          <button onClick={toggleAudio}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
          <div className="track">
            <div className="name">Audio del himno</div>
            <input type="range" min="0" max="100" value={progress} readOnly />
          </div>
          <audio
            ref={audioRef}
            src={h.audioUrl}
            onTimeUpdate={onTime}
            onEnded={() => setPlaying(false)}
          />
        </div>
      )}

      {h.imageUrl && <LazyImage src={h.imageUrl} alt="" style={{ width: '100%', borderRadius: 14, margin: '16px 0' }} />}

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

      <div ref={shareCardRef} className="share-card" aria-hidden="true">
        <div className="share-card-logo">
          <img src="/images/logo.png" alt="logo" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="share-card-app">{h.category || 'Himno'} {h.number} · Himnario Ebenezer</div>
        <h3 className="share-card-title">{h.title}</h3>
        <div className="share-card-lyrics">
          {parseLyrics(h.lyrics).map((v, i) => (
            <div className="share-card-verse" key={i}>
              {v.label && <div className="share-card-verse-label">{v.label}</div>}
              <div className="share-card-verse-dir">
                {v.lines.map((line, j) => (
                  <span key={j}>{line}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="share-card-foot">Instrumento de Adoración</div>
      </div>
    </div>
  )
}
