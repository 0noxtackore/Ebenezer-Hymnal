import { useEffect, useState } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { Eye, EyeOff, Plus, Pencil, Trash2, Text, Search } from 'lucide-react'
import { auth } from '../firebase.js'
import { useData } from '../context/DataContext.jsx'
import { useFavorites } from '../context/FavoritesContext.jsx'
import LazyImage from '../components/LazyImage.jsx'

function blank() {
  return { id: '', number: '', title: '', category: 'Himnos Clásicos', lyrics: '', audioUrl: '', imageUrl: '' }
}

export default function Admin() {
  const { hymns, categories, addHymn, updateHymn, deleteHymn } = useData()
  const { ids } = useFavorites()

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
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (msg) {
      setToastVisible(true)
      const t = setTimeout(() => {
        setMsg('')
        setToastVisible(false)
      }, 3500)
      return () => clearTimeout(t)
    } else {
      setToastVisible(false)
    }
  }, [msg])

  function parseLyricsToBlocks(lyrics) {
    if (!lyrics || !lyrics.trim()) return { verses: [''], coro: '' }
    const parts = lyrics.split(/\n\nCORO\n/)
    if (parts.length < 2) return { verses: lyrics.split('\n\n').filter((v) => v.trim()), coro: '' }
    const firstVerse = parts[0].trim()
    const afterParts = parts[1].split('\n\n').filter((p) => p.trim())
    const coroText = afterParts[0] || ''
    const remaining = afterParts.slice(1)
    return { verses: [firstVerse, ...remaining], coro: coroText }
  }

  function buildLyrics(versesList, coroText) {
    let lyrics = (versesList[0] || '').trim()
    if (coroText.trim()) {
      lyrics += '\n\nCORO\n' + coroText.trim()
    }
    if (versesList.length > 1) {
      lyrics += '\n\n' + versesList.slice(1).map((v) => v.trim()).filter((v) => v).join('\n\n')
    }
    return lyrics
  }

  function addVerse() {
    setVerses([...verses, ''])
  }

  function removeVerse(i) {
    if (verses.length <= 1) return
    setVerses(verses.filter((_, idx) => idx !== i))
  }

  function updateVerse(i, text) {
    const next = [...verses]
    next[i] = text
    setVerses(next)
  }

  function updateCoro(text) {
    setCoro(text)
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

  async function logout() {
    await signOut(auth)
    setMsg('')
  }

  function startNew() {
    setForm(blank())
    setVerses([''])
    setCoro('')
    setShowModal(true)
  }

  function startEdit(h) {
    setForm({ ...h })
    const { verses: v, coro: c } = parseLyricsToBlocks(h.lyrics || '')
    setVerses(v.length ? v : [''])
    setCoro(c)
    setShowModal(true)
  }

  function submit() {
    if (!form.number || !form.title) {
      setMsg('Número y título son obligatorios')
      return
    }
    const num = Number(form.number)
    const dupNum = hymns.find((h) => h.number === num && h.id !== form.id)
    if (dupNum) {
      setMsg(`Ya existe el himno número ${num} ("${dupNum.title}")`)
      return
    }
    const dupTitle = hymns.find(
      (h) => h.title.toLowerCase() === form.title.trim().toLowerCase() && h.id !== form.id
    )
    if (dupTitle) {
      setMsg(`Ya existe un himno con el título "${dupTitle.title}"`)
      return
    }
    const lyrics = buildLyrics(verses, coro)
    const payload = { ...form, id: form.id || 'h' + Date.now(), number: num, lyrics }
    if (form.id) {
      if (!updateHymn(payload)) {
        setMsg(`Ya existe el himno número ${num} en otro himno`)
        return
      }
    } else {
      if (!addHymn(payload)) {
        setMsg(`Ya existe el himno número ${num}`)
        return
      }
    }
    setShowModal(false)
    setMsg('Guardado correctamente')
  }

  function remove(h) {
    if (confirm('¿Eliminar el himno ' + h.number + '?')) deleteHymn(h.id)
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
          src="/images/logo.png"
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

  const lastNum = hymns.reduce((max, h) => Math.max(max, h.number || 0), 0)
  const nextNum = lastNum + 1
  const numTaken =
    Number(form.number) > 0 &&
    hymns.some((h) => h.number === Number(form.number) && h.id !== form.id)

  const filtered = hymns.filter((h) => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return h.title.toLowerCase().includes(q) || String(h.number).includes(q)
  })

  return (
    <div>
      {msg && toastVisible && (
        <div className="toast">
          <LazyImage src="/images/logo.png" alt="logo" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
          <span>{msg}</span>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat">
          <b>{hymns.length}</b>
          <span>Himnos</span>
        </div>
        <div className="stat">
          <b>{ids.length}</b>
          <span>Favoritos</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, maxWidth: 400, marginBottom: 12 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--gold)', flexShrink: 0 }}>
            <Search size={18} />
          </span>
          <input
            placeholder="Buscar himno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn" style={{ padding: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={startNew}>
          <Plus size={18} />
        </button>
      </div>

      <ul className="hymn-list" style={{ marginTop: 0 }}>
        {filtered.map((h) => (
          <li key={h.id} className="hymn-row">
            <div className="hymn-num">{h.number}</div>
            <div className="hymn-meta">
              <div className="hymn-name">{h.title}</div>
            </div>
            <button className="btn ghost" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => startEdit(h)}>
              <Pencil size={18} />
            </button>
            <button className="btn ghost" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => remove(h)}>
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>

      <button className="btn ghost" style={{ marginTop: 12 }} onClick={logout}>
        Cerrar sesión
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Cerrar">
              ✕
            </button>
            <h2>{form.id ? 'Editar himno' : 'Nuevo himno'}</h2>
            <div className="form-grid">
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
                    El número {form.number} ya lo usa otro himno
                  </small>
                )}
              </div>
              <div className="field">
                <label>Título</label>
                <input
                  placeholder="Nombre del himno"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Estrofas</label>
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
              </div>
              <div className="field">
                <label>CORO</label>
                <textarea
                  placeholder="Texto del coro..."
                  value={coro}
                  onChange={(e) => updateCoro(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="btn" onClick={submit}>
                Guardar
              </button>
              <button className="btn ghost" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
