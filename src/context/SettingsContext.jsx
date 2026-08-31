import { createContext, useContext, useEffect, useState } from 'react'

const SettingsContext = createContext(null)

// Limpia ajustes viejos (p.ej. acento azul guardado) en rediseños
const HE_V = '3'
if (localStorage.getItem('he_v') !== HE_V) {
  ['he_night', 'he_font', 'he_fontsize', 'he_accent'].forEach((k) => localStorage.removeItem(k))
  localStorage.setItem('he_v', HE_V)
}

export const FONTS = {
  system: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  serif: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  rounded: "'Trebuchet MS', system-ui, sans-serif",
  mono: "'Courier New', monospace"
}

export const COLORS = [
  { name: 'Dorado', value: '#C9A227' },
  { name: 'Oro', value: '#E0B23A' },
  { name: 'Amarillo', value: '#FFC83D' },
  { name: 'Ámbar', value: '#D4A017' }
]

export function SettingsProvider({ children }) {
  const [night, setNight] = useState(() => localStorage.getItem('he_night') === '1')
  const [fontKey, setFontKey] = useState(() => localStorage.getItem('he_font') || 'system')
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('he_fontsize') || 16))
  const [accent, setAccent] = useState(() => localStorage.getItem('he_accent') || '#C9A227')

  useEffect(() => {
    document.body.classList.toggle('night', night)
    localStorage.setItem('he_night', night ? '1' : '0')
  }, [night])

  useEffect(() => {
    document.documentElement.style.setProperty('--font-family', FONTS[fontKey] || FONTS.system)
    localStorage.setItem('he_font', fontKey)
  }, [fontKey])

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', fontSize + 'px')
    localStorage.setItem('he_fontsize', String(fontSize))
  }, [fontSize])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent)
    localStorage.setItem('he_accent', accent)
  }, [accent])

  const value = { night, setNight, fontKey, setFontKey, fontSize, setFontSize, accent, setAccent }
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => useContext(SettingsContext)
