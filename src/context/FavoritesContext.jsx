import { createContext, useContext, useEffect, useState } from 'react'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('he_favs') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('he_favs', JSON.stringify(ids))
  }, [ids])

  const toggle = (id) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const isFavorite = (id) => ids.includes(id)

  return (
    <FavoritesContext.Provider value={{ ids, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
