import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { LoginPage, RegisterPage } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Convert from './pages/Convert'
import SyncGroups from './pages/SyncGroups'
import Player from './pages/Player'

function AppInner() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('home')

  // Redirect logic
  useEffect(() => {
    if (!loading) {
      if (user && (page === 'home' || page === 'login' || page === 'register')) {
        setPage('dashboard')
      }
      if (!user && !['home', 'login', 'register'].includes(page)) {
        setPage('home')
      }
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/40">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading...
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home setPage={setPage} />
      case 'login': return <LoginPage setPage={setPage} />
      case 'register': return <RegisterPage setPage={setPage} />
      case 'dashboard': return <Dashboard setPage={setPage} />
      case 'convert': return <Convert />
      case 'groups': return <SyncGroups />
      case 'player': return <Player />
      default: return <Home setPage={setPage} />
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar page={page} setPage={setPage} />
      <main>
        {renderPage()}
      </main>
      <footer className="border-t border-brand-ocean/20 py-6 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <span className="font-display font-semibold">Sound<span className="text-brand-gold">Bridg</span></span>
          <span>© {new Date().getFullYear()} SoundBridg · Built for FL Studio producers</span>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
