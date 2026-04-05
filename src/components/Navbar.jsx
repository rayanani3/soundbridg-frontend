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
    <nav className="sticky top-0 z-50" style={{
      height: '52px',
      background: 'rgba(10,10,15,0.90)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="max-w-6xl mx-auto px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => setPage('home')} className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0" style={{
            background: 'linear-gradient(135deg, #1B3A5C 0%, #C9A84C 120%)',
          }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
              <path d="M9 18V6l12-2v12" stroke="#0A0A0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="#0A0A0F" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="#0A0A0F" strokeWidth="2"/>
            </svg>
          </div>
          <span className="font-sans font-bold text-[15px] tracking-[-0.3px]" style={{color: 'var(--text-primary)'}}>
            Sound<span style={{color: 'var(--accent)'}}>Bridg</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {user ? (
            <>
              <NavBtn active={page === 'dashboard'} onClick={() => setPage('dashboard')}>Dashboard</NavBtn>
              <NavBtn active={page === 'convert'} onClick={() => setPage('convert')}>Convert</NavBtn>
              <NavBtn active={page === 'groups'} onClick={() => setPage('groups')}>Sync Groups</NavBtn>
              <NavBtn active={page === 'player'} onClick={() => setPage('player')}>Player</NavBtn>
              <div className="ml-3 flex items-center gap-2" style={{borderLeft: '1px solid var(--border)', paddingLeft: '12px'}}>
                <span className="text-[13px] truncate max-w-[120px]" style={{color: 'var(--text-secondary)'}}>{user.email}</span>
                <button onClick={handleLogout} className="px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors"
                  style={{color: 'var(--text-secondary)'}}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' }}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavBtn active={page === 'home'} onClick={() => setPage('home')}>Home</NavBtn>
              <button onClick={() => setPage('login')} className="ml-2 px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors"
                style={{color: 'var(--text-secondary)', border: '1px solid var(--border-mid)'}}>
                Sign In
              </button>
              <button onClick={() => setPage('register')} className="ml-1 px-3 py-1.5 rounded-[6px] text-[13px] font-semibold transition-all"
                style={{background: 'var(--accent)', color: '#0A0A0F'}}>
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-[6px] transition-colors"
          style={{color: 'var(--text-secondary)'}}>
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 py-3 flex flex-col gap-1" style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)',
        }}>
          {user ? (
            <>
              <MobileNavBtn onClick={() => { setPage('dashboard'); setMenuOpen(false) }}>Dashboard</MobileNavBtn>
              <MobileNavBtn onClick={() => { setPage('convert'); setMenuOpen(false) }}>Convert</MobileNavBtn>
              <MobileNavBtn onClick={() => { setPage('groups'); setMenuOpen(false) }}>Sync Groups</MobileNavBtn>
              <MobileNavBtn onClick={() => { setPage('player'); setMenuOpen(false) }}>Player</MobileNavBtn>
              <button onClick={handleLogout} className="text-left px-3 py-2 rounded-[6px] text-[13px] transition-colors"
                style={{color: 'var(--red)'}}>Logout</button>
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
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors"
      style={{
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-dim)' : 'transparent',
      }}>
      {children}
    </button>
  )
}

function MobileNavBtn({ children, onClick }) {
  return (
    <button onClick={onClick} className="text-left px-3 py-2 rounded-[6px] text-[13px] transition-colors"
      style={{color: 'var(--text-secondary)'}}>
      {children}
    </button>
  )
}
