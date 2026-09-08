import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'

export default function SearchByNumber() {
  const [num, setNum] = useState('')
  const { hymns } = useData()
  const nav = useNavigate()

  const press = (d) => setNum((n) => (n + d).slice(0, 8))
  const del = () => setNum((n) => n.slice(0, -1))
  const clear = () => setNum('')

  const search = () => {
    const n = parseInt(num, 10)
    if (!n && !num) return
    const h = hymns.find((x) => Number(x.number) === n || (x.nomenclature || '').toUpperCase() === num.toUpperCase())
    if (h) nav('/himno/' + h.id)
    else alert('No se encontró la alabanza número ' + num)
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
    </div>
  )
}
