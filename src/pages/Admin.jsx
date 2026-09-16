import { useEffect, useState, useRef } from 'react'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { Eye, EyeOff, Plus, Pencil, Trash2, Text, Search, ChevronUp, ChevronDown } from 'lucide-react'
import { auth } from '../firebase.js'
import { useData } from '../context/DataContext.jsx'
import { getIcon } from '../utils/icons.js'
import LazyImage from '../components/LazyImage.jsx'

const CHORUS_CATS = ['coros lentos', 'coros rapidos', 'gospel']
const AUTO_NUMBER_CATS = ['gospel', 'especiales']

function isChorusCategory(cat) {
  return CHORUS_CATS.includes(strip(cat))
}

function isAutoNumberCategory(cat) {
  return AUTO_NUMBER_CATS.includes(strip(cat))
}

const strip = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const TONE_ORDER = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si']
function toneOrder(label) {
  const key = strip(label.split(' ')[0])
  const idx = TONE_ORDER.indexOf(key)
  return idx === -1 ? 99 : idx
}

function getDeleteLabel(category) {
  const c = strip(category)
  if (c === 'himnos clasicos') return 'himno'
  if (c === 'coros lentos') return 'coro lento'
  if (c === 'coros rapidos') return 'coro rápido'
  if (c === 'gospel') return 'gospel'
  if (c === 'especiales') return 'especial'
  return 'alabanza'
}

function blank() {
  return { id: '', number: '', title: '', category: 'Himnos Clásicos', musicKey: '', scale: '', nomenclature: '', lyrics: '', audioUrl: '', imageUrl: '' }
}

export default function Admin() {
  const { hymns, categories, addHymn, updateHymn, deleteHymn, reorderHymn } = useData()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [authing, setAuthing] = useState(true)
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank())
  const [catName, setCatName] = useState('')
  const [msg, setMsg] = useState('')
  const [verse, setVerse] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [verses, setVerses] = useState([''])
  const [coro, setCoro] = useState('')
  const [puente, setPuente] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [page, setPage] = useState(1)
  const [collapsed, setCollapsed] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [initialSnapshot, setInitialSnapshot] = useState(null)
  const PER_PAGE = 10
  const verseRefs = useRef({})
  const coroRef = useRef(null)
  const puenteRef = useRef(null)
  const [verseKey, setVerseKey] = useState(0)
  const [hasVerses, setHasVerses] = useState(true)
  const [hasCoro, setHasCoro] = useState(true)
  const [coroBlocks, setCoroBlocks] = useState([''])

  function toggleVerses(val) {
    if (!val && !hasCoro) return
    setHasVerses(val)
  }

  function toggleCoro(val) {
    if (!val && !hasVerses) return
    setHasCoro(val)
  }

  useEffect(() => {
    if (msg) {
      setToastVisible(true)
      if (!showModal) {
        const t = setTimeout(() => {
          setMsg('')
          setToastVisible(false)
        }, 3500)
        return () => clearTimeout(t)
      }
    } else {
      setToastVisible(false)
    }
  }, [msg, showModal])

  function parseLyricsToBlocks(lyrics) {
    if (!lyrics || !lyrics.trim()) return { verses: [''], coro: '', puente: '', blocks: [''] }
    const isChorus = isChorusCategory(form.category)
    if (isChorus) {
      const blocks = lyrics.split(/\n\n/).filter((b) => b.trim())
      return { verses: [''], coro: '', puente: '', blocks: blocks.length ? blocks : [''] }
    }
    const hasCoro = /\n\nCORO\n/.test(lyrics)
    if (!hasCoro) {
      return { verses: lyrics.split('\n\n').filter((v) => v.trim()), coro: '', puente: '', blocks: [''] }
    }
    const coroParts = lyrics.split(/\n\nCORO\n/)
    const firstVerse = coroParts[0].trim()
    const afterCoro = coroParts[1]
    const hasPuente = /\n\nPUENTE\n/.test(afterCoro)
    if (!hasPuente) {
      return { verses: firstVerse ? [firstVerse] : [''], coro: afterCoro.trim(), puente: '', blocks: [''] }
    }
    const puenteParts = afterCoro.split(/\n\nPUENTE\n/)
    const coroText = puenteParts[0].trim()
    if (puenteParts.length < 2) {
      return { verses: firstVerse ? [firstVerse] : [''], coro: coroText, puente: '', blocks: [''] }
    }
    const afterPuenteRaw = puenteParts[1]
    const puenteSplit = afterPuenteRaw.split(/\n\n/)
    const puenteText = puenteSplit[0].trim()
    const extraVerses = puenteSplit.slice(1).filter((v) => v.trim())
    const allVerses = [firstVerse, ...extraVerses].filter((v) => v.trim())
    return { verses: allVerses.length ? allVerses : [''], coro: coroText, puente: puenteText, blocks: [''] }
  }

  function buildLyrics(versesList, coroText, puenteText) {
    const isChorus = isChorusCategory(form.category)
    if (isChorus) {
      return coroBlocks.filter((b) => b.trim()).join('\n\n').toUpperCase()
    }
    const hasContent = versesList.some((v) => v.trim())
    let lyrics = hasContent ? (versesList[0] || '').trim() : ''
    if (coroText.trim()) {
      lyrics += (lyrics ? '\n\n' : '') + 'CORO\n' + coroText.trim()
    }
    if (puenteText.trim()) {
      lyrics += '\n\nPUENTE\n' + puenteText.trim()
    }
    if (versesList.length > 1) {
      lyrics += '\n\n' + versesList.slice(1).map((v) => v.trim()).filter((v) => v).join('\n\n')
    }
    return lyrics.toUpperCase()
  }

  function autoFormatVerse(text) {
    if (!text) return text
    return text.replace(/\n{3,}/g, '\n\n')
  }

  function addCoroBlock() {
    setCoroBlocks((prev) => [...prev, ''])
  }

  function removeCoroBlock(i) {
    if (coroBlocks.length <= 1) return
    setCoroBlocks((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateCoroBlock(i, val) {
    setCoroBlocks((prev) => prev.map((b, idx) => (idx === i ? val : b)))
  }

  function moveCoroBlock(i, dir) {
    setCoroBlocks((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  function addVerse() {
    const currentValues = readVerses()
    setVerses([...currentValues, ''])
    setVerseKey((k) => k + 1)
  }

  function removeVerse(i) {
    if (verses.length <= 1) return
    const currentValues = readVerses()
    setVerses(currentValues.filter((_, idx) => idx !== i))
    setVerseKey((k) => k + 1)
  }

  function updateVerse(i, val) {
    setVerses((prev) => prev.map((v, idx) => (idx === i ? val : v)))
  }

  function formatOnBlur(val) {
    if (!val) return val
    return val.toUpperCase()
  }

  function readVerses() {
    return verses
  }

  function readCoro() {
    return coro
  }

  function readPuente() {
    return puente
  }

  useEffect(() => {
    let alive = true
    fetch('/verses.json')
      .then((res) => res.json())
      .then((data) => {
        const list = data.verses || []
        if (alive && list.length) setVerse(list[Math.floor(Math.random() * list.length)])
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthing(false)
    })
    return unsub
  }, [])

  async function login(e) {
    e.preventDefault()
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      setError(loginError(err.code))
    }
  }

  function loginError(code) {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Correo o contraseña incorrectos'
      case 'auth/invalid-email':
        return 'Correo electrónico inválido'
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde.'
      default:
        return 'No se pudo iniciar sesión'
    }
  }

  function startNew() {
    setForm(blank())
    setVerses([''])
    setCoro('')
    setPuente('')
    setCoroBlocks([''])
    setMsg('')
    setHasVerses(true)
    setHasCoro(true)
    setShowModal(true)
    setInitialSnapshot(JSON.stringify({ form: blank(), verses: [''], coro: '', puente: '', coroBlocks: [''], hasVerses: true, hasCoro: true }))
  }

  function getSnapshot() {
    return JSON.stringify({ form, verses, coro, puente, coroBlocks, hasVerses, hasCoro })
  }

  function hasUnsavedContent() {
    if (!initialSnapshot) return false
    return getSnapshot() !== initialSnapshot
  }

  function handleCloseModal() {
    if (hasUnsavedContent()) {
      setShowExitConfirm(true)
    } else {
      setShowModal(false)
      setInitialSnapshot(null)
    }
  }

  function startEdit(h) {
    setForm({ ...h })
    const { verses: v, coro: c, puente: p, blocks: bl } = parseLyricsToBlocks(h.lyrics || '')
    setVerses(v.length ? v : [''])
    setCoro(c)
    setPuente(p)
    setCoroBlocks(bl.length ? bl : [''])
    const vHasVerses = v.some((v) => v.trim())
    const vHasCoro = !!c.trim()
    setHasVerses(vHasVerses || !vHasCoro)
    setHasCoro(vHasCoro || !vHasVerses)
    setShowModal(true)
    const snap = { form: { ...h }, verses: v.length ? v : [''], coro: c, puente: p, coroBlocks: bl.length ? bl : [''], hasVerses: vHasVerses || !vHasCoro, hasCoro: vHasCoro || !vHasVerses }
    setInitialSnapshot(JSON.stringify(snap))
  }

  async function submit() {
    const errors = []
    const isChorus = isChorusCategory(form.category)
    const isGospelCat = strip(form.category) === 'gospel'
    if (!isChorus && !form.number) {
      errors.push('Número')
    }
    if (!form.title.trim()) {
      errors.push('Título')
    }
    if (isChorus && !form.musicKey) {
      errors.push('Tonalidad')
    }
    if (isChorus && !form.scale) {
      errors.push('Escala')
    }
    if (isGospelCat && !form.id && !form.nomenclature.trim()) {
      setForm((prev) => ({ ...prev, nomenclature: nextGS }))
    }
    if (isGospelCat && form.nomenclature.trim() && !/^GS\d+$/i.test(form.nomenclature.trim())) {
      errors.push('Nomenclatura debe empezar con GS (ej: GS001)')
    }
    const currentVerses = hasVerses ? readVerses() : []
    const currentCoro = hasCoro ? readCoro() : ''
    const currentPuente = readPuente()
    if (isChorus) {
      const hasAnyBlock = coroBlocks.some((b) => b.trim())
      if (!hasAnyBlock) {
        errors.push('Al menos un bloque de letra')
      }
    } else {
      if (hasVerses) {
        for (let i = 0; i < currentVerses.length; i++) {
          if (!currentVerses[i].trim()) {
            errors.push(`Estrofa ${i + 1}`)
          }
        }
      }
      if (hasCoro && !currentCoro.trim()) {
        errors.push('Coro')
      }
    }
    if (errors.length > 0) {
      setMsg(`Completa: ${errors.join(', ')}`)
      return
    }
    const num = isChorus ? (form.id ? form.number : nextNum) : Number(form.number)
    if (!isChorus) {
      const dupNum = catHymns.find((h) => h.number === num && h.id !== form.id)
      if (dupNum) {
        setMsg(`Ya existe la alabanza número ${num} en esta categoría ("${dupNum.title}")`)
        return
      }
    }
    const dupTitle = hymns.find(
      (h) => h.title.toLowerCase() === form.title.trim().toLowerCase() && h.id !== form.id
    )
    if (dupTitle) {
      setMsg(`Ya existe una alabanza con el título "${dupTitle.title}"`)
      return
    }
    const lyrics = buildLyrics(currentVerses, currentCoro, currentPuente)
    const payload = { ...form, id: form.id || 'h' + Date.now(), number: num, lyrics }
    try {
      if (form.id) {
        if (!await updateHymn(payload)) {
          setMsg(`Ya existe la alabanza número ${num} en otra categoría`)
          return
        }
      } else {
        if (!await addHymn(payload)) {
          setMsg(`Ya existe la alabanza número ${num}`)
          return
        }
      }
      setShowModal(false)
      setMsg('Guardado correctamente')
    } catch (e) {
      setMsg('Error al guardar: sin conexión a internet')
    }
  }

  function remove(h) {
    setDeleteTarget(h)
  }

  async function confirmDelete() {
    if (deleteTarget) {
      try {
        await deleteHymn(deleteTarget.id)
        setDeleteTarget(null)
        setMsg('Eliminado correctamente')
      } catch (e) {
        setMsg('Error al eliminar: sin conexión a internet')
      }
    }
  }

  function addCat() {
    if (!catName.trim()) return
    addCategory({ id: 'c' + Date.now(), name: catName.trim(), colorHex: '#0B3D91' })
    setCatName('')
    setMsg('Categoría añadida')
  }

  if (authing) {
    return (
      <div className="card center">
        <p className="muted">Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="card center" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <LazyImage
          src="/images/logo.webp"
          alt="logo"
          style={{ width: 84, height: 84, borderRadius: '50%', margin: '0 auto 10px' }}
        />
        <h2>Acceso Administrador</h2>
        <p className="muted">Inicia sesión con tu cuenta de correo.</p>
        <form onSubmit={login} style={{ width: '100%', maxWidth: 320, margin: '0 auto' }}>
          <div className="field">
            <label>Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.dev"
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <div className="pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && <p style={{ color: '#dd2222', fontSize: 14 }}>{error}</p>}
          <button className="btn" style={{ width: '100%', marginTop: 6 }} type="submit">
            Entrar
          </button>
        </form>
        {verse && (
          <div className="login-verse">
            <Text size={18} />
            <p>{verse.text}</p>
            <span>{verse.reference}</span>
          </div>
        )}
      </div>
    )
  }

  const catHymns = hymns.filter((h) => h.category === form.category)
  const isChorusMode = isChorusCategory(form.category)
  const isGospel = strip(form.category) === 'gospel'
  const keyScaleHymns = isChorusMode
    ? catHymns.filter((h) => (h.musicKey || '').trim() === (form.musicKey || '').trim() && (h.scale || '').trim() === (form.scale || '').trim())
    : catHymns
  const lastNum = keyScaleHymns.reduce((max, h) => Math.max(max, h.number || 0), 0)
  const nextNum = lastNum + 1
  const nextGS = (() => {
    const gsNums = hymns
      .filter((h) => h.nomenclature && /^GS\d+$/i.test(h.nomenclature))
      .map((h) => parseInt(h.nomenclature.match(/\d+/)[0]))
    const maxGS = gsNums.length ? Math.max(...gsNums) : 0
    return 'GS' + String(maxGS + 1).padStart(3, '0')
  })()
  const numTaken =
    !isChorusMode &&
    Number(form.number) > 0 &&
    catHymns.some((h) => h.number === Number(form.number) && h.id !== form.id)

  const catFilterNorm = strip(catFilter)
  const filtered = hymns
    .filter((h) => {
      const q = searchQuery.trim().toLowerCase()
      const matchesText = !q || strip(h.title + ' ' + h.number + ' ' + (h.nomenclature || '') + ' ' + (h.category || '')).includes(strip(q))
      const matchesCat = !catFilterNorm || strip(h.category || '') === catFilterNorm
      return matchesText && matchesCat
    })
    .sort((a, b) => (a.number || 0) - (b.number || 0))

  const canGroup = strip(catFilter) === 'coros lentos' || strip(catFilter) === 'coros rapidos' || strip(catFilter) === 'gospel'
  const showGrouped = canGroup

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const groupedData = (() => {
    const groups = {}
    filtered.forEach((h) => {
      const k = (h.musicKey || '').trim() || 'Sin tono'
      const s = (h.scale || '').trim()
      const keyLabel = s ? k + ' ' + s : k
      if (!groups[keyLabel]) groups[keyLabel] = {}
      const cat = h.category || 'Sin categoría'
      if (!groups[keyLabel][cat]) groups[keyLabel][cat] = []
      groups[keyLabel][cat].push(h)
    })
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Sin tono') return 1
      if (b === 'Sin tono') return -1
      return toneOrder(a) - toneOrder(b)
    })
  })()

  function toggleFolder(label) {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <div>
      {msg && toastVisible && !showModal && (
        <div className="toast">
          <LazyImage src="/images/logo.webp" alt="logo" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
          <span>{msg}</span>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat">
          <b>{hymns.length}</b>
          <span>Alabanzas</span>
        </div>
        {categories.map((c) => (
          <div className="stat" key={c.name}>
            <b>{hymns.filter((h) => h.category === c.name).length}</b>
            <span>{c.name}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, maxWidth: 400, marginBottom: 12 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--gold)', flexShrink: 0 }}>
            <Search size={18} />
          </span>
          <input
            placeholder="Buscar alabanza..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
          />
        </div>
        <button className="btn" style={{ padding: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={startNew}>
          <Plus size={18} />
        </button>
      </div>

      {categories.length > 0 && (
        <div className="chips" style={{ marginBottom: 12 }}>
          <button className={'chip' + (!catFilter ? ' active' : '')} onClick={() => { setCatFilter(''); setPage(1) }}>
            Todos
          </button>
          {categories.map((c) => {
            const Icon = getIcon(c.icon)
            return (
              <button
                key={c.name}
                className={'chip' + (catFilter === c.name ? ' active' : '')}
                onClick={() => { setCatFilter(c.name); setPage(1) }}
              >
                <Icon size={14} /> {c.name}
              </button>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 10 }}>
        <span className="count-pill">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {showGrouped ? (
        <div className="admin-folders">
          {groupedData.map(([keyLabel, cats]) => {
            const isCollapsed = collapsed[keyLabel]
            const totalInKey = Object.values(cats).reduce((s, arr) => s + arr.length, 0)
            return (
              <div key={keyLabel} className="folder-group">
                <div className="folder-header" onClick={() => toggleFolder(keyLabel)}>
                  <span className="folder-arrow">{isCollapsed ? '\u25B6' : '\u25BC'}</span>
                  <span className="folder-name">{keyLabel}</span>
                  <span className="folder-count">{totalInKey}</span>
                </div>
                {!isCollapsed && (
                  <div className="folder-body">
                    {Object.entries(cats).sort(([a], [b]) => a.localeCompare(b, 'es')).map(([cat, items]) => (
                      <div key={cat} className="folder-sub">
                        <div className="folder-sub-label">{cat}</div>
                        <ul className="hymn-list">
                          {items.map((h, i) => (
                            <li key={h.id} className="hymn-row">
                              <div className="hymn-num">{h.number}</div>
                              <div className="hymn-meta">
                                <div className="hymn-name">{h.title}</div>
                              </div>
                              {isAutoNumberCategory(h.category) && (
                                <div className="hymn-reorder">
                                  <button className="btn ghost" style={{ width: 'auto', padding: '4px 6px' }} onClick={() => reorderHymn(h.id, -1)} disabled={i === 0}>
                                    <ChevronUp size={16} />
                                  </button>
                                  <button className="btn ghost" style={{ width: 'auto', padding: '4px 6px' }} onClick={() => reorderHymn(h.id, 1)} disabled={i === items.length - 1}>
                                    <ChevronDown size={16} />
                                  </button>
                                </div>
                              )}
                              <button className="btn ghost" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => startEdit(h)}>
                                <Pencil size={18} />
                              </button>
                              <button className="btn ghost" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => remove(h)}>
                                <Trash2 size={18} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {groupedData.length === 0 && <div className="empty">Sin resultados.</div>}
        </div>
      ) : (
        <>
          <ul className="hymn-list" style={{ marginTop: 0 }}>
            {paginated.map((h) => {
              const sameGroup = filtered.filter(
                (x) => strip(x.category) === strip(h.category) &&
                  (x.musicKey || '').trim() === (h.musicKey || '').trim() &&
                  (x.scale || '').trim() === (h.scale || '').trim()
              )
              const posInGroup = sameGroup.findIndex((x) => x.id === h.id)
              return (
              <li key={h.id} className="hymn-row">
                <div className="hymn-num">{h.number}</div>
                <div className="hymn-meta">
                  <div className="hymn-name">{h.title}</div>
                </div>
                {isAutoNumberCategory(h.category) && catFilter && (
                  <div className="hymn-reorder">
                    <button className="btn ghost" style={{ width: 'auto', padding: '4px 6px' }} onClick={() => reorderHymn(h.id, -1)} disabled={posInGroup === 0}>
                      <ChevronUp size={16} />
                    </button>
                    <button className="btn ghost" style={{ width: 'auto', padding: '4px 6px' }} onClick={() => reorderHymn(h.id, 1)} disabled={posInGroup === sameGroup.length - 1}>
                      <ChevronDown size={16} />
                    </button>
                  </div>
                )}
                <button className="btn ghost" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => startEdit(h)}>
                  <Pencil size={18} />
                </button>
                <button className="btn ghost" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => remove(h)}>
                  <Trash2 size={18} />
                </button>
              </li>
              )
            })}
          </ul>

          {totalPages > 1 && (
            <div className="pagination">
              {page > 1 && <button className="btn ghost" onClick={() => setPage(page - 1)}>Anterior</button>}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={'btn' + (p === page ? ' gold' : ' ghost')}
                  onClick={() => setPage(p)}
                >{p}</button>
              ))}
              {page < totalPages && <button className="btn ghost" onClick={() => setPage(page + 1)}>Siguiente</button>}
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={handleCloseModal} aria-label="Cerrar">
              ✕
            </button>
            <h2>{form.id ? 'Editar alabanza' : 'Nueva alabanza'}</h2>
            <div className="form-grid">
              {!isAutoNumberCategory(form.category) && (
                <div className="field">
                  <label>Número</label>
                  <input
                    placeholder={form.id ? String(form.number) : String(nextNum)}
                    inputMode="numeric"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value.replace(/\D/g, '') })}
                  />
                  {numTaken && (
                    <small className="muted" style={{ color: '#c62828' }}>
                      El número {form.number} ya lo usa otra alabanza
                    </small>
                  )}
                </div>
              )}
              {isAutoNumberCategory(form.category) && (
                <div className="field">
                  <label>Número</label>
                  <input
                    placeholder={form.id ? String(form.number) : String(nextNum)}
                    inputMode="numeric"
                    value={form.number}
                    readOnly
                  />
                  <small className="muted">Se asigna automáticamente por posición</small>
                </div>
              )}
              <div className="field">
                <label>Título</label>
                <input
                  placeholder="Nombre de la alabanza"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="field">
                <label>Categoría</label>
                <div className="cat-select">
                  {categories.map((c) => {
                    const Icon = getIcon(c.icon)
                    return (
                      <button
                        key={c.name}
                        type="button"
                        className={'cat-option' + (form.category === c.name ? ' active' : '')}
                        onClick={() => {
                          const isGos = strip(c.name) === 'gospel'
                          setForm({
                            ...form,
                            category: c.name,
                            nomenclature: (!form.id && isGos) ? nextGS : (isGos ? form.nomenclature : '')
                          })
                        }}
                      >
                        <Icon size={16} /> {c.name}
                      </button>
                    )
                  })}
                </div>
              </div>
              {(strip(form.category) === 'coros lentos' || strip(form.category) === 'coros rapidos' || strip(form.category) === 'gospel') && (
                <>
                <div className="field-row">
                  <div className="field">
                    <label>Tonalidad</label>
                    <div className="cat-select">
                      {['Do','Re','Mi','Fa','Sol','La','Si'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          className={'cat-option' + (form.musicKey === k ? ' active' : '')}
                          onClick={() => setForm({ ...form, musicKey: k })}
                        >{k}</button>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label>Escala</label>
                    <div className="cat-select">
                      {['Mayor','Menor'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={'cat-option' + (form.scale === s ? ' active' : '')}
                          onClick={() => setForm({ ...form, scale: s })}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label>Nomenclatura{isGospel ? ' *' : ''}</label>
                  <input
                    placeholder={isGospel ? nextGS : 'Ej: C001, GR005, ER012'}
                    value={form.nomenclature}
                    onChange={(e) => setForm({ ...form, nomenclature: e.target.value.toUpperCase() })}
                  />
                  <small className="muted">{isGospel ? 'Código del gospel (ej: GS001)' : 'Código del coro (ej: C001 = Do Lento #1)'}</small>
                </div>
                </>
              )}
              {isChorusMode ? (
                <div className="field">
                  <label>Versos de coro</label>
                  {coroBlocks.map((block, i) => (
                    <div key={i} className="verse-field">
                      <div className="verse-field-header">
                        <span>Bloque {i + 1}</span>
                        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                          {i > 0 && (
                            <button type="button" className="btn ghost" onClick={() => moveCoroBlock(i, -1)}>
                              <ChevronUp size={16} />
                            </button>
                          )}
                          {i < coroBlocks.length - 1 && (
                            <button type="button" className="btn ghost" onClick={() => moveCoroBlock(i, 1)}>
                              <ChevronDown size={16} />
                            </button>
                          )}
                          {coroBlocks.length > 1 && (
                            <button type="button" className="btn ghost" onClick={() => removeCoroBlock(i)}>
                              Quitar
                            </button>
                          )}
                        </div>
                      </div>
                      <textarea
                        placeholder={`Bloque ${i + 1}...`}
                        value={block}
                        onChange={(e) => updateCoroBlock(i, e.target.value)}
                      />
                    </div>
                  ))}
                  <button type="button" className="btn ghost" onClick={addCoroBlock}>
                    + Agregar bloque
                  </button>
                </div>
              ) : (
                <>
              <div className="field">
                <div className="field-header">
                  <label>Estrofas</label>
                  <label className={'switch' + (!hasCoro ? ' switch-disabled' : '')}>
                    <input type="checkbox" checked={hasVerses} onChange={(e) => toggleVerses(e.target.checked)} disabled={!hasCoro} />
                    <span className="switch-slider"></span>
                  </label>
                </div>
                {hasVerses && (
                  <>
                    {verses.map((v, i) => (
                      <div key={i} className="verse-field">
                        <div className="verse-field-header">
                          <span>Estrofa {i + 1}</span>
                          {verses.length > 1 && (
                            <button type="button" className="btn ghost" onClick={() => removeVerse(i)}>
                              Quitar
                            </button>
                          )}
                        </div>
                        <textarea
                          placeholder={i === 0 ? 'Primera estrofa...' : `Estrofa ${i + 1}...`}
                          value={v}
                          onChange={(e) => updateVerse(i, e.target.value)}
                        />
                      </div>
                    ))}
                    <button type="button" className="btn ghost" onClick={addVerse}>
                      + Agregar estrofa
                    </button>
                  </>
                )}
              </div>
              <div className="field">
                <div className="field-header">
                  <label>CORO</label>
                  <label className={'switch' + (!hasVerses ? ' switch-disabled' : '')}>
                    <input type="checkbox" checked={hasCoro} onChange={(e) => toggleCoro(e.target.checked)} disabled={!hasVerses} />
                    <span className="switch-slider"></span>
                  </label>
                </div>
                {hasCoro && (
                  <textarea
                    placeholder="Texto del coro..."
                    value={coro}
                    onChange={(e) => setCoro(e.target.value)}
                  />
                )}
              </div>
              {strip(form.category) === 'especiales' && (
                <div className="field">
                <label>Puente</label>
                <textarea
                  placeholder="Texto del puente (opcional)..."
                  value={puente}
                  onChange={(e) => setPuente(e.target.value)}
                />
                </div>
              )}
                </>
              )}
            </div>
            {msg && <div className="modal-msg">{msg}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="btn" onClick={submit}>
                Guardar
              </button>
              <button className="btn ghost" onClick={handleCloseModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="modal-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 12px' }}>Salir sin guardar?</h3>
            <p style={{ margin: '0 0 18px', color: 'var(--muted)' }}>Los cambios no se guardaran.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn ghost" onClick={() => setShowExitConfirm(false)}>
                Cancelar
              </button>
              <button className="btn" onClick={() => { setShowExitConfirm(false); setShowModal(false); setInitialSnapshot(null) }}>
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDeleteTarget(null)}>&times;</button>
            <div className="delete-modal-logo">
              <img src="/images/logo.webp" alt="logo" />
            </div>
            <h3>Eliminar {getDeleteLabel(deleteTarget.category)}</h3>
            <p className="delete-modal-text">
              ¿Estás seguro de eliminar <strong>N° {deleteTarget.number} — {deleteTarget.title}</strong>?
            </p>
            <p className="delete-modal-warn">Esta acción no se puede deshacer.</p>
            <div className="delete-modal-actions">
              <button className="btn ghost" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="btn delete-btn" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
