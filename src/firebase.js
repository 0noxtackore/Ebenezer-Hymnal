// Firebase SDK — inicialización de la app
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCPnsegptU8dCOOimhsPSmHUE5KwbXiDoM',
  authDomain: 'ebenezer-hymnal.firebaseapp.com',
  databaseURL: 'https://ebenezer-hymnal-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'ebenezer-hymnal',
  storageBucket: 'ebenezer-hymnal.firebasestorage.app',
  messagingSenderId: '1011443273940',
  appId: '1:1011443273940:web:ca995d7fe8542ec929eb41',
  measurementId: 'G-5HJTXQLB6C'
}

const app = initializeApp(firebaseConfig)

let analytics = null
try {
  analytics = getAnalytics(app)
} catch {
  // Analítica no disponible en este entorno (offline/SSR): ignorar.
}

const db = getDatabase(app)
const auth = getAuth(app)

export { app, db, auth, analytics }