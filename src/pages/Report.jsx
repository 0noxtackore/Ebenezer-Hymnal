import { useState } from 'react'

const TO = 'angelloxon@gmail.com'

export default function Report() {
  const [email, setEmail] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const send = () => {
    if (!email.trim() || !text.trim()) {
      setError('Completa tu correo y el mensaje.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Escribe un correo válido.')
      return
    }
    setError('')
    const subject = 'Reporte - Himnario Ebenezer (Errores y sugerencias)'
    const body = `Correo del usuario: ${email.trim()}\n\n${text.trim()}`
    const url = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = url
    setText('')
    setSent(true)
    setTimeout(() => setSent(false), 2500)
  }

  return (
    <div className="card">
      <h2>Errores y sugerencias</h2>
      <p className="muted">Cuéntanos si encontraste un error o tienes una idea para mejorar.</p>
      <div className="form-grid">
        <div className="field">
          <label>Tu correo (para responderte)</label>
          <input
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Mensaje</label>
          <textarea
            placeholder="Describe el error o tu sugerencia..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
      {error && <div className="muted" style={{ color: '#c62828', marginTop: 10 }}>{error}</div>}
      <button className="btn" style={{ marginTop: 12 }} onClick={send}>
        Enviar
      </button>
      {sent && <div className="toast">¡Se abrirá tu correo para enviar el reporte!</div>}
    </div>
  )
}
