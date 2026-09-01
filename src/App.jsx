import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout.jsx'
import Splash from './components/Splash.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const SearchByNumber = lazy(() => import('./pages/SearchByNumber.jsx'))
const SearchByName = lazy(() => import('./pages/SearchByName.jsx'))
const HymnDetail = lazy(() => import('./pages/HymnDetail.jsx'))
const KeyList = lazy(() => import('./pages/KeyList.jsx'))
const ChorusCompilation = lazy(() => import('./pages/ChorusCompilation.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Favorites = lazy(() => import('./pages/Favorites.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
const Report = lazy(() => import('./pages/Report.jsx'))
const Social = lazy(() => import('./pages/Social.jsx'))
const About = lazy(() => import('./pages/About.jsx'))

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <div className="skeleton-loader">
        <div className="skeleton-line" style={{ width: '60%', height: 24, marginBottom: 12 }} />
        <div className="skeleton-line" style={{ width: '100%', height: 16, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: '80%', height: 16, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: '90%', height: 16 }} />
      </div>
    </div>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <AnimatePresence>{showSplash && <Splash />}</AnimatePresence>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/buscar-numero" element={<SearchByNumber />} />
            <Route path="/buscar-nombre" element={<SearchByName />} />
            <Route path="/himno/:id" element={<HymnDetail />} />
            <Route path="/tono/:key" element={<KeyList />} />
            <Route path="/coros/:category/:key" element={<ChorusCompilation />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/configuraciones" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/errores" element={<Report />} />
            <Route path="/fanpage" element={<Social />} />
            <Route path="/conocenos" element={<About />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
