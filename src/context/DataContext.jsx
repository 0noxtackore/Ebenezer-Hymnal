import { createContext, useContext, useEffect, useState } from 'react'
import { get, ref, set } from 'firebase/database'
import { db } from '../firebase.js'

const DataContext = createContext(null)
const OVERRIDES_KEY = 'he_hymns_overrides'
const DATA_CACHE_KEY = 'he_data_cache'
const CACHE_VERSION_KEY = 'he_cache_version'
const CACHE_VERSION = 2
const FB_NODE = 'hymnario'

const CHORUS_CATS = ['coros lentos', 'coros rapidos', 'gospel']

const strip = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function renumberChorus(hymns) {
  const groups = {}
  hymns.forEach((h) => {
    const cat = strip(h.category)
    if (!CHORUS_CATS.includes(cat)) return
    const key = cat + '#' + ((h.musicKey || '').trim()) + '#' + ((h.scale || '').trim())
    if (!groups[key]) groups[key] = []
    groups[key].push(h)
  })
  Object.values(groups).forEach((list) => {
    list.sort((a, b) => (a.number || 0) - (b.number || 0))
    list.forEach((h, i) => { h.number = i + 1 })
  })
}

export function DataProvider({ children }) {
  const [base, setBase] = useState(() => {
    try {
      const cached = localStorage.getItem(DATA_CACHE_KEY)
      if (cached) return JSON.parse(cached)
    } catch {}
    return { hymns: [], categories: [] }
  })
  const [overrides, setOverrides] = useState(() => {
    try {
      const raw = localStorage.getItem(OVERRIDES_KEY) || 'null'
      const data = JSON.parse(raw)
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
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem(DATA_CACHE_KEY)
    } catch {
      return true
    }
  })

  useEffect(() => {
    let cancelled = false

    const cachedVersion = parseInt(localStorage.getItem(CACHE_VERSION_KEY) || '0', 10)
    if (cachedVersion < CACHE_VERSION) {
      localStorage.removeItem(DATA_CACHE_KEY)
      localStorage.setItem(CACHE_VERSION_KEY, String(CACHE_VERSION))
    }

    async function load() {
      try {
        const snap = await get(ref(db, FB_NODE))
        const fb = snap.exists() && snap.val() ? snap.val() : null
        if (fb && fb.hymns) {
          const hymnsList = Array.isArray(fb.hymns) ? fb.hymns : Object.values(fb.hymns)
          if (!cancelled) {
            const cats = Array.isArray(fb.categories) ? fb.categories : Object.values(fb.categories || {})
            setBase({ hymns: hymnsList, categories: cats })
            try { localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ hymns: hymnsList, categories: cats })) } catch {}
          }
          return
        }
        throw new Error('empty')
      } catch {
        try {
          const r = await fetch('/hymns.json')
          const d = await r.json()
          if (cancelled) return
          const data = d || { hymns: [], categories: [] }
          setBase(data)
          try { localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(data)) } catch {}
          try { await set(ref(db, FB_NODE), data) } catch {}
        } catch {
          if (!cancelled && !localStorage.getItem(DATA_CACHE_KEY)) {
            setBase({ hymns: [], categories: [] })
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const ov = overrides || { hymns: [], removed: [], categories: [] }
  const rawBaseCategories = base.categories || []
  const baseCategories = Array.isArray(rawBaseCategories) ? rawBaseCategories : Object.values(rawBaseCategories)
  const rawOvCategories = ov.categories || []
  const ovCategories = Array.isArray(rawOvCategories) ? rawOvCategories : Object.values(rawOvCategories)
  const categories = [...baseCategories, ...ovCategories]
  const rawBaseHymns = base.hymns || []
  const baseHymns = Array.isArray(rawBaseHymns) ? rawBaseHymns : Object.values(rawBaseHymns)
  let hymns = baseHymns.filter((h) => !(ov.removed || []).includes(h.id))
  if (ov.hymns) hymns = [...hymns, ...ov.hymns]
  const seenKeys = new Set()
  hymns = hymns.filter((h) => {
    const cat = (h.category || '')
    const isChorus = CHORUS_CATS.includes(strip(cat))
    const key = isChorus
      ? cat + '#' + h.number + '#' + (h.musicKey || '') + '#' + (h.scale || '')
      : cat + '#' + h.number
    if (seenKeys.has(key)) return false
    seenKeys.add(key)
    return true
  })
  renumberChorus(hymns)

  async function updateFirebase(finalHymns, finalCategories) {
    const hymnsDict = {}
    finalHymns.forEach((h, i) => { hymnsDict[h.id || String(i)] = h })
    await set(ref(db, FB_NODE), { hymns: hymnsDict, categories: finalCategories })
  }

  async function persist(next) {
    let hymnsList = next.hymns ?? ov.hymns ?? []
    {
      const seen = new Set()
      hymnsList = hymnsList.filter((h) => {
        const cat = (h.category || '')
        const isChorus = CHORUS_CATS.includes(strip(cat))
        const key = isChorus
          ? cat + '#' + h.number + '#' + (h.musicKey || '') + '#' + (h.scale || '')
          : cat + '#' + h.number
        if (seen.has(key)) return false
        seen.add(key)
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

    const rawBh = base.hymns || []
    const baseHymns = Array.isArray(rawBh) ? rawBh : Object.values(rawBh)
    let finalHymns = [
      ...baseHymns.filter((h) => !(merged.removed || []).includes(h.id)),
      ...(merged.hymns || [])
    ]
    renumberChorus(finalHymns)
    const rawMergedCats = merged.categories || []
    const mergedCats = Array.isArray(rawMergedCats) ? rawMergedCats : Object.values(rawMergedCats)
    const finalCategories = [...baseCategories, ...mergedCats]
    try { localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ hymns: finalHymns, categories: finalCategories })) } catch {}
    await updateFirebase(finalHymns, finalCategories)
    setBase({ hymns: finalHymns, categories: finalCategories })
  }

  async function addHymn(h) {
    const cat = strip(h.category)
    if (CHORUS_CATS.includes(cat)) {
      const dup = hymns.find(
        (x) => x.number === h.number && x.category === h.category &&
          (x.musicKey || '').trim() === (h.musicKey || '').trim() &&
          (x.scale || '').trim() === (h.scale || '').trim()
      )
      if (dup) return false
    } else {
      const catNums = hymns.filter((x) => x.category === h.category).map((x) => x.number)
      if (catNums.includes(h.number)) return false
    }
    await persist({ hymns: [...(ov.hymns || []), h] })
    return true
  }

  async function updateHymn(h) {
    const cat = strip(h.category)
    if (CHORUS_CATS.includes(cat)) {
      const conflict = hymns.find(
        (x) => x.number === h.number && x.id !== h.id && x.category === h.category &&
          (x.musicKey || '').trim() === (h.musicKey || '').trim() &&
          (x.scale || '').trim() === (h.scale || '').trim()
      )
      if (conflict) return false
    } else {
      const conflict = hymns.find(
        (x) => x.number === h.number && x.id !== h.id && x.category === h.category
      )
      if (conflict) return false
    }
    const existing = (ov.hymns || []).find((x) => x.id === h.id)
    const baseIds = baseHymns.map((x) => x.id)
    const inBase = baseIds.includes(h.id)
    let list
    if (existing) {
      list = ov.hymns.map((x) => (x.id === h.id ? h : x))
    } else {
      list = [...(ov.hymns || []), h]
    }
    const removed = new Set(ov.removed || [])
    if (inBase) removed.add(h.id)
    await persist({ hymns: list, removed: [...removed] })
    return true
  }

  async function deleteHymn(id) {
    await persist({
      hymns: (ov.hymns || []).filter((x) => x.id !== id),
      removed: [...new Set([...(ov.removed || []), id])]
    })
  }

  async function addCategory(c) {
    await persist({ categories: [...(ov.categories || []), c] })
  }

  function resetData() {
    localStorage.removeItem(OVERRIDES_KEY)
    localStorage.removeItem(DATA_CACHE_KEY)
    setOverrides(null)
    const hymnsDict = {}
    baseHymns.forEach((h, i) => { hymnsDict[h.id || String(i)] = h })
    try { set(ref(db, FB_NODE), { hymns: hymnsDict, categories: baseCategories }) } catch {}
  }

  const value = { hymns, categories, loading, addHymn, updateHymn, deleteHymn, addCategory, resetData }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
