import { motion } from 'framer-motion'

export default function Splash() {
  return (
    <motion.div
      className="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="splash-logo">
        <img src="/images/logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div className="splash-title">Himnario Ebenezer</div>
      <div className="splash-sub">Instrumento de Adoración</div>
      <div className="splash-ring" />
    </motion.div>
  )
}
