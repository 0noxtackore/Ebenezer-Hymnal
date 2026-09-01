import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout.jsx'
import Splash from './components/Splash.jsx'
import Home from './pages/Home.jsx'
import SearchByNumber from './pages/SearchByNumber.jsx'
import SearchByName from './pages/SearchByName.jsx'
import HymnDetail from './pages/HymnDetail.jsx'
import KeyList from './pages/KeyList.jsx'
import ChorusCompilation from './pages/ChorusCompilation.jsx'
import Settings from './pages/Settings.jsx'
import Favorites from './pages/Favorites.jsx'
import Admin from './pages/Admin.jsx'
import Report from './pages/Report.jsx'
import Social from './pages/Social.jsx'
import About from './pages/About.jsx'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1900)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <AnimatePresence>{showSplash && <Splash />}</AnimatePresence>
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
    </>
  )
}
