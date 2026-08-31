import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, Heart, Menu } from 'lucide-react'

const ITEMS = [
  { key: 'home', label: 'Inicio', icon: Home, to: '/' },
  { key: 'search', label: 'Buscar', icon: Search, to: '/buscar-nombre' },
  { key: 'fav', label: 'Favoritos', icon: Heart, to: '/favoritos' },
  { key: 'menu', label: 'Menú', icon: Menu }
]

export default function BottomNav({ onOpenMenu }) {
  const loc = useLocation()
  const nav = useNavigate()
  const isActive = (item) =>
    item.key === 'home' ? loc.pathname === '/' : loc.pathname.startsWith(item.to)

  return (
    <nav className="bottom-nav">
      {ITEMS.map((it) => {
        const Icon = it.icon
        const active = it.key === 'menu' ? false : isActive(it)
        return (
          <button
            key={it.key}
            className={'bn-item' + (active ? ' active' : '')}
            onClick={() => (it.key === 'menu' ? onOpenMenu() : nav(it.to))}
          >
            <span className="bn-ico">
              <Icon size={21} />
            </span>
            {it.label}
          </button>
        )
      })}
    </nav>
  )
}
