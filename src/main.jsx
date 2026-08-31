import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SettingsProvider>
        <DataProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </DataProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
)
