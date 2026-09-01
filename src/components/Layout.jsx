import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Moon,
  Sun,
  Settings,
  Heart,
  MessageSquareWarning,
  Share2,
  Users,
  Lock,
  LogOut,
  LayoutDashboard
} from 'lucide-react'
import { useSettings } from '../context/SettingsContext.jsx'
import LazyImage from './LazyImage.jsx'
import { auth } from '../firebase.js'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import BottomNav from './BottomNav.jsx'

const NAV = [
  { to: '/configuraciones', label: 'Configuraciones', icon: Settings },
  { to: '/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/errores', label: 'Errores y sugerencias', icon: MessageSquareWarning },
  { to: '/fanpage', label: 'Página oficial', icon: Share2 },
  { to: '/conocenos', label: 'Desarrollador', icon: Users }
]

const TITLES = {
  '/': 'Inicio',
  '/buscar-numero': 'Buscar por número',
  '/buscar-nombre': 'Buscar por nombre',
  '/favoritos': 'Favoritos',
  '/configuraciones': 'Configuraciones',
  '/errores': 'Errores y sugerencias',
  '/fanpage': 'Página oficial',
  '/conocenos': 'Conócenos'
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { night, setNight } = useSettings()
  const navigate = useNavigate()
  const loc = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return unsub
  }, [])

  function handleSignOut() {
    signOut(auth).then(() => {
      navigate('/')
      setOpen(false)
    })
  }

  const isActive = (to) => loc.pathname === to

  return (
    <div className="app-shell">
      <aside className={'drawer' + (open ? ' open' : '')}>
        <div className="drawer-header">
          <LazyImage className="drawer-logo" src={night ? '/images/logo_dark.png' : '/images/logo.png'} alt="logo" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'contain' }} />
          <div className="dh-text">
            <div className="drawer-title">Himnario Ebenezer</div>
            <div className="drawer-sub">Instrumento de Adoración</div>
          </div>
          <button className="dh-theme" onClick={() => setNight(!night)} aria-label="Tema">
            {night ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className="drawer-items">
          <div className="drawer-label">Principal</div>
          {NAV.slice(0, 2).map((n) => {
            const Icon = n.icon
            return (
              <button
                key={n.to}
                className={'drawer-item' + (isActive(n.to) ? ' active' : '')}
                onClick={() => {
                  setOpen(false)
                  navigate(n.to)
                }}
              >
                <span className="di-ico">
                  <Icon size={20} />
                </span>
                {n.label}
              </button>
            )
          })}
          {user ? (
            <>
              <button
                className={'drawer-item' + (isActive('/admin') ? ' active' : '')}
                onClick={() => {
                  setOpen(false)
                  navigate('/admin')
                }}
              >
                <span className="di-ico">
                  <LayoutDashboard size={20} />
                </span>
                Ir al panel
              </button>
              <button
                className="drawer-item"
                onClick={() => {
                  setOpen(false)
                  handleSignOut()
                }}
              >
                <span className="di-ico">
                  <LogOut size={20} />
                </span>
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              className={'drawer-item' + (isActive('/admin') ? ' active' : '')}
              onClick={() => {
                setOpen(false)
                navigate('/admin')
              }}
            >
              <span className="di-ico">
                <Lock size={20} />
              </span>
              Administrador
            </button>
          )}
          <div className="drawer-label">Más opciones</div>
          {NAV.slice(2).map((n) => {
            const Icon = n.icon
            return (
              <button
                key={n.to}
                className={'drawer-item' + (isActive(n.to) ? ' active' : '')}
                onClick={() => {
                  setOpen(false)
                  navigate(n.to)
                }}
              >
                <span className="di-ico">
                  <Icon size={20} />
                </span>
                {n.label}
              </button>
            )
          })}
        </div>
      </aside>

      <div className={'backdrop' + (open ? ' show' : '')} onClick={() => setOpen(false)} />

      <div className="main-area">
        <main className="content">
          <AnimatePresence mode="wait">
            <motion.div
              key={loc.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav onOpenMenu={() => setOpen(true)} />
      </div>
    </div>
  )
}
