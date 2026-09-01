import { createContext, useContext, useEffect, useState } from 'react'
import { get, ref, set } from 'firebase/database'
import { db } from '../firebase.js'

const DataContext = createContext(null)
const OVERRIDES_KEY = 'he_hymns_overrides'
const FB_NODE = 'hymnario'

export function DataProvider({ children }) {
  const [base, setBase] = useState({ hymns: [], categories: [] })
  const [overrides, setOverrides] = useState(() => {
    try {
      const raw = localStorage.getItem(OVERRIDES_KEY) || 'null'
      const data = JSON.parse(raw)
      // Deduplicar overrides por número al cargar
      if (data?.hymns?.length) {
        const seen = new Set()
        data.hymns = data.hymns.filter((h) => {
          if (seen.has(h.number)) return false
          seen.add(h.number)
          return true
        })
      }
      return data
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function seedFirebase(data) {
      try {
        await set(ref(db, FB_NODE), data)
      } catch {
        // Sin conexión: se continúa en modo local
      }
    }

    async function load() {
      try {
        const snap = await get(ref(db, FB_NODE))
        const fb = snap.exists() && snap.val() ? snap.val() : null
        if (fb && Array.isArray(fb.hymns)) {
          if (!cancelled) setBase({ hymns: fb.hymns, categories: fb.categories || [] })
          return
        }
        throw new Error('empty')
      } catch {
        try {
          const r = await fetch('/hymns.json')
          const d = await r.json()
          if (cancelled) return
          setBase(d || { hymns: [], categories: [] })
          seedFirebase(d || { hymns: [], categories: [] })
        } catch {
          if (!cancelled) setBase({ hymns: [], categories: [] })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const ov = overrides || { hymns: [], removed: [], categories: [] }
  const categories = [...(base.categories || []), ...(ov.categories || [])]
  let hymns = (base.hymns || []).filter((h) => !(ov.removed || []).includes(h.id))
  if (ov.hymns) hymns = [...hymns, ...ov.hymns]
  // Deduplicar por categoría + número: conservar primera aparición
  const seenKeys = new Set()
  hymns = hymns.filter((h) => {
    const key = (h.category || '') + '#' + h.number
    if (seenKeys.has(key)) return false
    seenKeys.add(key)
    return true
  })

  function updateFirebase(finalHymns, finalCategories) {
    try {
      set(ref(db, FB_NODE), { hymns: finalHymns, categories: finalCategories })
    } catch {
      // Sin conexión: se continúa en modo local
    }
  }

  function persist(next) {
    let hymnsList = next.hymns ?? ov.hymns ?? []
    // Deduplicar por número antes de persistir
    {
      const seen = new Set()
      hymnsList = hymnsList.filter((h) => {
        if (seen.has(h.number)) return false
        seen.add(h.number)
        return true
      })
    }
    const merged = {
      hymns: hymnsList,
      removed: next.removed ?? ov.removed ?? [],
      categories: next.categories ?? ov.categories ?? []
    }
    setOverrides(merged)
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(merged))

    const finalHymns = [
      ...(base.hymns || []).filter((h) => !(merged.removed || []).includes(h.id)),
      ...(merged.hymns || [])
    ]
    const finalCategories = [...(base.categories || []), ...(merged.categories || [])]
    updateFirebase(finalHymns, finalCategories)
  }

  function addHymn(h) {
    const catNums = hymns.filter((x) => x.category === h.category).map((x) => x.number)
    if (catNums.includes(h.number)) return false
    persist({ hymns: [...(ov.hymns || []), h] })
    return true
  }

  function updateHymn(h) {
    const conflict = hymns.find(
      (x) => x.number === h.number && x.id !== h.id && x.category === h.category
    )
    if (conflict) return false
    const existing = (ov.hymns || []).find((x) => x.id === h.id)
    const baseIds = (base.hymns || []).map((x) => x.id)
    const inBase = baseIds.includes(h.id)
    let list
    if (existing) list = ov.hymns.map((x) => (x.id === h.id ? h : x))
    else list = [...(ov.hymns || []), h]
    const removed = new Set(ov.removed || [])
    if (inBase && !existing) removed.add(h.id)
    persist({ hymns: list, removed: [...removed] })
    return true
  }

  function deleteHymn(id) {
    persist({
      hymns: (ov.hymns || []).filter((x) => x.id !== id),
      removed: [...new Set([...(ov.removed || []), id])]
    })
  }

  function addCategory(c) {
    persist({ categories: [...(ov.categories || []), c] })
  }

  function resetData() {
    localStorage.removeItem(OVERRIDES_KEY)
    setOverrides(null)
    try {
      set(ref(db, FB_NODE), { hymns: base.hymns || [], categories: base.categories || [] })
    } catch {
      // Sin conexión: se continúa en modo local
    }
  }

  const value = { hymns, categories, loading, addHymn, updateHymn, deleteHymn, addCategory, resetData }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)