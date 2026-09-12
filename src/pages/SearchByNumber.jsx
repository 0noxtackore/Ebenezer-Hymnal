import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'

export default function SearchByNumber() {
  const [num, setNum] = useState('')
  const [results, setResults] = useState([])
  const { hymns } = useData()
  const nav = useNavigate()

  const press = (d) => setNum((n) => (n + d).slice(0, 8))
  const del = () => setNum((n) => n.slice(0, -1))
  const clear = () => { setNum(''); setResults([]) }

  const search = () => {
    const query = num.toUpperCase().trim()
    if (!query) return
    const n = parseInt(num, 10)
    const matches = hymns.filter((x) => {
      if ((x.nomenclature || '').toUpperCase() === query) return true
      if (!isNaN(n) && Number(x.number) === n) return true
      return false
    })
    if (matches.length === 0) {
      alert('No se encontró la alabanza número ' + num)
    } else if (matches.length === 1) {
      nav('/himno/' + matches[0].id)
    } else {
      setResults(matches)
    }
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

  return (
    <div className="center-screen">
      <div className="num-label">Número o Nomenclatura</div>
      <div className="num-display">{num || '0'}</div>

      <div className="keypad">
        {letters.map((k) => (
          <button key={k} className="key" onClick={() => press(k)}>
            {k}
          </button>
        ))}
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
      )}
    </div>
  )
}
