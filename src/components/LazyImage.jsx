import { useState } from 'react'

export default function LazyImage({ src, alt, fallback, style, ...props }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const imgStyle = {
    ...style,
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.3s ease'
  }

  const placeholderStyle = {
    ...style,
    background: 'var(--surface-2)',
    opacity: loaded ? 0 : 1,
    position: loaded ? 'absolute' : 'relative',
    transition: 'opacity 0.3s ease'
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      {!loaded && !error && <div style={placeholderStyle} />}
      <img
        src={error ? (fallback || src) : src}
        alt={alt}
        draggable="false"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true)
          setLoaded(true)
        }}
        style={imgStyle}
        {...props}
      />
    </div>
  )
}