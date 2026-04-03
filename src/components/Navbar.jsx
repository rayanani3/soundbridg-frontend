import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ page, setPage }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setPage('home')
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-ocean/20" style={{background:'rgba(10,14,39,0.92)', backdropFilter:'blur(16px)'}}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => setPage('home')} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg, #1b3a5c, #0a0e27)', border:'1px solid rgba(201,168,76,0.3)'}}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M9 18V6l12-2v12" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="#c9a84c" strokeWidth="1.5"/>
              <circle cx="18" cy="16" r="3" stroke="#c9a84c" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Sound<span className="text-brand-gold">Bridg</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <NavBtn active={page === 'dashboard'} onClick={() => setPage('dashboard')}>Dashboard</NavBtn>
              <NavBtn active={page === 'convert'} onClick={() => setPage('convert')}>Convert</NavBtn>
              <NavBtn active={page === 'groups'} onClick={() => setPage('groups')}>Sync Groups</NavBtn>
              <NavBtn active={page === 'player'} onClick={() => setPage('player')}>Player</NavBtn>
              <div className="ml-2 flex items-center gap-2">
                <span className="text-sm text-white/50 truncate max-w-[120px]">{user.email}</span>
                <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavBtn active={page === 'home'} onClick={() => setPage('home')}>Home</NavBtn>
              <button onClick={() => setPage('login')} className="ml-2 px-4 py-1.5 rounded-lg text-sm font-medium border border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10 transition-colors">
                Sign In
              </button>
              <button onClick={() => setPage('register')} className="px-4 py-1.5 rounded-lg text-sm font-medium bg-brand-gold text-brand-dark hover:brightness-110 transition-all">
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-brand-ocean/20 transition-colors">
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-brand-ocean/20 px-4 py-3 flex flex-col gap-2">
          {user ? (
            <>
              <MobileNavBtn onClick={() => { setPage('dashboard'); setMenuOpen(false) }}>Dashboard</MobileNavBtn>
              <MobileNavBtn onClick={() => { setPage('convert'); setMenuOpen(false) }}>Convert</MobileNavBtn>
              <MobileNavBtn onClick={() => { setPage('groups'); setMenuOpen(false) }}>Sync Groups</MobileNavBtn>
              <MobileNavBtn onClick={() => { setPage('player'); setMenuOpen(false) }}>Player</MobileNavBtn>
              <button onClick={handleLogout} className="text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors">Logout</button>
            </>
          ) : (
            <>
              <MobileNavBtn onClick={() => { setPage('home'); setMenuOpen(false) }}>Home</MobileNavBtn>
              <MobileNavBtn onClick={() => { setPage('login'); setMenuOpen(false) }}>Sign In</MobileNavBtn>
              <MobileNavBtn onClick={() => { setPage('register'); setMenuOpen(false) }}>Get Started</MobileNavBtn>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

function NavBtn({ children, onClick, active }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active ? 'text-brand-gold bg-brand-gold/10' : 'text-white/60 hover:text-white hover:bg-brand-ocean/20'}`}>
      {children}
    </button>
  )
}

function MobileNavBtn({ children, onClick }) {
  return (
    <button onClick={onClick} className="text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-brand-ocean/20 transition-colors">
      {children}
    </button>
  )
}
