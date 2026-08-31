import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'

export default function SearchByNumber() {
  const [num, setNum] = useState('')
  const { hymns } = useData()
  const nav = useNavigate()

  const press = (d) => setNum((n) => (n + d).slice(0, 4))
  const del = () => setNum((n) => n.slice(0, -1))
  const clear = () => setNum('')

  const search = () => {
    const n = parseInt(num, 10)
    if (!n) return
    const h = hymns.find((x) => Number(x.number) === n)
    if (h) nav('/himno/' + h.id)
    else alert('No se encontró el himno número ' + num)
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div>
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
    </div>
  )
}
