const CACHE_VERSION = 'v2'
const STATIC_CACHE = 'himnario-static-' + CACHE_VERSION
const DYNAMIC_CACHE = 'himnario-dynamic-' + CACHE_VERSION

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/images/logo.webp',
  '/images/logo_dark.webp',
  '/images/logo_app.webp',
  '/manifest.json'
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.includes(CACHE_VERSION)).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return

  const url = new URL(e.request.url)

  if (url.hostname.includes('firebasestorage.googleapis.com') || url.hostname.includes('firebaseio.com')) {
    e.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) =>
        cache.match(e.request).then((cached) => {
          const fetched = fetch(e.request).then((res) => {
            if (res.ok) cache.put(e.request, res.clone())
            return res
          }).catch(() => cached)
          return cached || fetched
        })
      )
    )
    return
  }

  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(e.request).then((cached) => {
          if (cached) return cached
          return fetch(e.request).then((res) => {
            if (res.ok) cache.put(e.request, res.clone())
            return res
          })
        })
      )
    )
    return
  }

  e.respondWith(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.match(e.request).then((cached) => {
        const fetched = fetch(e.request).then((res) => {
          if (res.ok) cache.put(e.request, res.clone())
          return res
        }).catch(() => cached)
        return cached || fetched
      })
    )
  )
})
