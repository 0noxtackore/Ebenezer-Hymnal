import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'

const CHORUS_CATS = ['coros lentos', 'coros rapidos', 'gospel']
const strip = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function SearchByNumber() {
  const [num, setNum] = useState('')
  const [results, setResults] = useState([])
  const { hymns } = useData()
  const nav = useNavigate()

  const press = (d) => setNum((n) => (n + d).slice(0, 5))
  const del = () => setNum((n) => n.slice(0, -1))
  const clear = () => { setNum(''); setResults([]) }

  const search = () => {
    const n = parseInt(num, 10)
    if (!n) return
    const matches = hymns.filter((x) => Number(x.number) === n && !CHORUS_CATS.includes(strip(x.category)))
    if (matches.length === 0) {
      alert('No se encontró el himno número ' + num)
    } else if (matches.length === 1) {
      nav('/himno/' + matches[0].id)
    } else {
      setResults(matches)
    }
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="center-screen">
      <div className="num-label">Número del Himno</div>
      <div className="num-display">{num || '0'}</div>

      <div className="keypad">
        {keys.map((k) => (
          <button key={k} className="key" onClick={() => press(k)}>
            {k}
          </button>
        ))}
        <button className="key zero" onClick={() => press('0')}>
          0
        </button>
      </div>

      <div className="key-row">
        <button className="btn ghost" onClick={del}>
          BORRAR
        </button>
        <button className="btn ghost" onClick={clear}>
          LIMPIAR
        </button>
        <button className="btn" onClick={search}>
          BUSCAR
        </button>
      </div>

      {results.length > 1 && (
        <div className="modal-overlay" onClick={() => setResults([])}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setResults([]); setNum('') }}>✕</button>
            <h2 className="modal-title">Himno número {num}</h2>
            <div className="search-results">
              {results.map((h) => (
                <button
                  key={h.id}
                  className="search-result-item"
                  onClick={() => nav('/himno/' + h.id)}
                >
                  <span className="result-nomen">{h.nomenclature || h.number}</span>
                  <span className="result-title">{h.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
