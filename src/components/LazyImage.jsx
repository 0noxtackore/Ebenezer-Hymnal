import { useState, useRef, useEffect } from 'react'

export default function LazyImage({ src, alt, fallback, style, ...props }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [inView, setInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect() }
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const imgStyle = {
    ...style,
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.2s ease'
  }

  const placeholderStyle = {
    ...style,
    background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)',
    opacity: loaded ? 0 : 1,
    position: loaded ? 'absolute' : 'relative',
    top: 0,
    left: 0,
    transition: 'opacity 0.2s ease'
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', ...style }}>
      {!loaded && !error && <div style={placeholderStyle} />}
      {inView && (
        <img
          src={error ? (fallback || src) : src}
          alt={alt}
          draggable="false"
          loading="lazy"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true) }}
          style={imgStyle}
          {...props}
        />
      )}
    </div>
  )
}
