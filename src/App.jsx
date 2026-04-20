import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { LoginPage, RegisterPage } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Convert from './pages/Convert'
import Upgrade from './pages/Upgrade'
import SharedTrack from './pages/SharedTrack'

// Parse /shared/:token before any auth routing so public share links work
// for signed-out visitors.
const sharedMatch = typeof window !== 'undefined' ? window.location.pathname.match(/^\/shared\/([A-Za-z0-9_-]+)\/?$/) : null
const sharedToken = sharedMatch ? sharedMatch[1] : null

function AppInner() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('home')

  if (sharedToken) {
    return <SharedTrack token={sharedToken} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="w-6 h-6 animate-spin" style={{color:'var(--accent)'}} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  const effectivePage = (() => {
    if (user && (page === 'home' || page === 'login' || page === 'register')) return 'dashboard'
    if (!user && ['dashboard', 'convert', 'upgrade'].includes(page)) return 'login'
    return page
  })()

  // Dashboard and upgrade are full-height, no navbar padding needed
  const fullHeight = ['dashboard'].includes(effectivePage)

  const renderPage = () => {
    switch (effectivePage) {
      case 'home': return <Home setPage={setPage} />
      case 'login': return <LoginPage setPage={setPage} />
      case 'register': return <RegisterPage setPage={setPage} />
      case 'dashboard': return <Dashboard setPage={setPage} />
      case 'convert': return <Convert />
      case 'upgrade': return <Upgrade setPage={setPage} />
      default: return <Home setPage={setPage} />
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar page={effectivePage} setPage={setPage} />
      <main className={fullHeight ? 'flex-1 overflow-hidden' : ''}>{renderPage()}</main>
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
