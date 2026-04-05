import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function LoginPage({ setPage }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      setPage('dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return <AuthCard title="Welcome back" subtitle="Sign in to your SoundBridg account">
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
      {error && (
        <div style={{fontSize:'13px',color:'var(--red)',background:'var(--red-dim)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'6px',padding:'8px 12px'}}>
          {error}
        </div>
      )}
      <SubmitBtn loading={loading}>Sign In</SubmitBtn>
    </form>
    <p style={{textAlign:'center',fontSize:'13px',color:'var(--text-tertiary)',marginTop:'16px'}}>
      Don't have an account?{' '}
      <button onClick={() => setPage('register')} style={{color:'var(--accent)',background:'none',border:'none',cursor:'pointer',fontSize:'13px'}}>
        Get started free
      </button>
    </p>
  </AuthCard>
}

export function RegisterPage({ setPage }) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(email, password, name)
      setPage('dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return <AuthCard title="Create account" subtitle="Start syncing your FL Studio projects">
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <Field label="Name" type="text" value={name} onChange={setName} placeholder="Your name" />
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min 6 characters" />
      {error && (
        <div style={{fontSize:'13px',color:'var(--red)',background:'var(--red-dim)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'6px',padding:'8px 12px'}}>
          {error}
        </div>
      )}
      <SubmitBtn loading={loading}>Create Account</SubmitBtn>
    </form>
    <p style={{textAlign:'center',fontSize:'13px',color:'var(--text-tertiary)',marginTop:'16px'}}>
      Already have an account?{' '}
      <button onClick={() => setPage('login')} style={{color:'var(--accent)',background:'none',border:'none',cursor:'pointer',fontSize:'13px'}}>
        Sign in
      </button>
    </p>
  </AuthCard>
}

function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'48px 16px'}}>
      <div style={{width:'100%',maxWidth:'400px'}}>
        {/* Logo mark */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'32px'}}>
          <div style={{
            width:'40px',height:'40px',borderRadius:'10px',marginBottom:'16px',
            background:'linear-gradient(135deg, #1B3A5C 0%, #C9A84C 120%)',
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" style={{width:20,height:20}}>
              <path d="M9 18V6l12-2v12" stroke="#0A0A0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="#0A0A0F" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="#0A0A0F" strokeWidth="2"/>
            </svg>
          </div>
          <h1 style={{fontSize:'20px',fontWeight:700,letterSpacing:'-0.4px',color:'var(--text-primary)',margin:'0 0 6px'}}>{title}</h1>
          <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0}}>{subtitle}</p>
        </div>
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'28px'}}>
          {children}
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{display:'block',fontSize:'12px',fontWeight:500,color:'var(--text-secondary)',marginBottom:'6px'}}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={{
          width:'100%', padding:'8px 12px', borderRadius:'6px',
          background:'var(--bg-input)', border:'1px solid var(--border-mid)',
          color:'var(--text-primary)', outline:'none',
          fontSize:'13px', fontFamily:'inherit',
          transition:'border-color 0.12s',
          boxSizing:'border-box',
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-line)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
      />
    </div>
  )
}

function SubmitBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width:'100%', padding:'10px', borderRadius:'6px',
        fontSize:'13px', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer',
        background:'var(--accent)', color:'#0A0A0F',
        opacity: loading ? 0.6 : 1, transition:'opacity 0.12s, filter 0.12s',
        border:'none',
      }}
    >
      {loading ? (
        <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
          <svg style={{width:14,height:14,animation:'spin 1s linear infinite'}} fill="none" viewBox="0 0 24 24">
            <circle style={{opacity:0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{opacity:0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading…
        </span>
      ) : children}
    </button>
  )
}
