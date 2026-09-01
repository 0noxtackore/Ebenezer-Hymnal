import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { useFavorites } from '../context/FavoritesContext.jsx'

export default function Favorites() {
  const { hymns } = useData()
  const { ids } = useFavorites()
  const nav = useNavigate()

  const favs = hymns.filter((h) => ids.includes(h.id))

  if (favs.length === 0) return <div className="empty">Aún no tienes alabanzas favoritas. Toca ☆ en una alabanza.</div>

  return (
    <ul className="hymn-list">
      {favs.map((h) => (
        <li key={h.id} className="hymn-row" onClick={() => nav('/himno/' + h.id)}>
          <div className="hymn-num">{h.number}</div>
          <div className="hymn-meta">
            <div className="hymn-name">{h.title}</div>
          </div>
          <i className="bi bi-star-fill star"></i>
        </li>
      ))}
    </ul>
  )
}
