import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Music, Star, Share2 } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useData } from '../context/DataContext.jsx'
import { useFavorites } from '../context/FavoritesContext.jsx'
import logoBase64 from '../../assets/logo_base64.txt?raw'

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
      const doc = new jsPDF({ unit: 'mm', format: 'letter' })
      const pw = doc.internal.pageSize.getWidth()
      const ph = doc.internal.pageSize.getHeight()
      const ml = 18
      const mr = 18
      const cw = pw - ml - mr

      const gold = [201, 162, 39]
      const darkGold = [138, 109, 20]
      const brown = [22, 19, 12]
      const lightBorder = [224, 216, 196]
      const muted = [122, 116, 104]

      let y = 15

      const checkPage = (needed) => {
        if (y + needed > ph - 18) {
          doc.addPage()
          y = 18
          drawPageBorder()
        }
      }

      const drawPageBorder = () => {
        doc.setDrawColor(...gold)
        doc.setLineWidth(0.8)
        doc.roundedRect(12, 10, pw - 24, ph - 20, 3, 3)
        doc.setLineWidth(0.3)
        doc.roundedRect(14, 12, pw - 28, ph - 24, 2, 2)
      }

      drawPageBorder()

      const logoDataUrl = 'data:image/png;base64,' + logoBase64
      try {
        doc.addImage(logoDataUrl, 'PNG', pw / 2 - 14, y, 28, 28)
      } catch {}
      y += 32

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...darkGold)
      const catLabel = decodedCat.toUpperCase()
      doc.text(catLabel, pw / 2, y, { align: 'center' })
      y += 8

      doc.setFontSize(22)
      doc.setTextColor(...brown)
      doc.text(decodedKey, pw / 2, y, { align: 'center' })
      y += 7

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...muted)
      doc.text(`${coros.length} coro${coros.length !== 1 ? 's' : ''}`, pw / 2, y, { align: 'center' })
      y += 6

      doc.setDrawColor(...gold)
      doc.setLineWidth(0.5)
      doc.line(ml + 30, y, pw - mr - 30, y)
      y += 10

      coros.forEach((h, idx) => {
        checkPage(35)

        const numLabel = h.nomenclature || String(h.number)

        doc.setFillColor(250, 248, 243)
        doc.roundedRect(ml, y - 4, cw, 7, 1, 1, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...darkGold)
        doc.text(`${numLabel} — ${h.title}`, pw / 2, y, { align: 'center' })
        y += 8

        doc.setTextColor(...brown)
        const verses = parseLyrics(h.lyrics)
        verses.forEach((v) => {
          if (v.label) {
            checkPage(10)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(...darkGold)
            doc.text(v.label, pw / 2, y, { align: 'center' })
            y += 5
          }

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(...brown)
          v.lines.forEach((line) => {
            checkPage(6)
            const split = doc.splitTextToSize(line, cw - 4)
            split.forEach((sl) => {
              checkPage(5)
              doc.text(sl, pw / 2, y, { align: 'center' })
              y += 4.5
            })
          })
          y += 3
        })

        if (idx < coros.length - 1) {
          checkPage(12)
          y += 1
          doc.setDrawColor(...lightBorder)
          doc.setLineWidth(0.3)
          doc.line(ml + 10, y, pw - mr - 10, y)
          y += 7
        }
      })

      y += 6
      doc.setDrawColor(...gold)
      doc.setLineWidth(0.4)
      doc.line(ml + 30, y, pw - mr - 30, y)
      y += 6

      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(...muted)
      doc.text('Instrumento de Adoración', pw / 2, y, { align: 'center' })
      y += 4
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...darkGold)
      doc.text('Himnario Ebenezer', pw / 2, y, { align: 'center' })

      const slug = `${decodedCat}-${decodedKey}`.toLowerCase().replace(/\s+/g, '-')
      const fileName = `${slug}-coros.pdf`
      const blob = doc.output('blob')
      const file = new File([blob], fileName, { type: 'application/pdf' })

      if (navigator.share) {
        await navigator.share({ files: [file], title: `${decodedKey} - ${decodedCat}` })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 3000)
        setToast('PDF descargado')
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setToast('Error al generar PDF')
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

      {toast && (
        <div className="toast">
          <img src="/images/logo.webp" alt="logo" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
