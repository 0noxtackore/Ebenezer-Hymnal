import { motion } from 'framer-motion'
import LazyImage from './LazyImage.jsx'

export default function Splash() {
  return (
    <motion.div
      className="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="splash-logo">
        <LazyImage src="/images/logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div className="splash-title">Himnario Ebenezer</div>
      <div className="splash-sub">Instrumento de Adoración</div>
      <div className="splash-ring" />
    </motion.div>
  )
}
