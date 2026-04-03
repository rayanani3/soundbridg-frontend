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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>}
      <SubmitBtn loading={loading}>Sign In</SubmitBtn>
    </form>
    <p className="text-center text-sm text-white/40 mt-4">
      Don't have an account?{' '}
      <button onClick={() => setPage('register')} className="text-brand-gold hover:underline">Get started free</button>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name" type="text" value={name} onChange={setName} placeholder="Your name" />
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min 6 characters" />
      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>}
      <SubmitBtn loading={loading}>Create Account</SubmitBtn>
    </form>
    <p className="text-center text-sm text-white/40 mt-4">
      Already have an account?{' '}
      <button onClick={() => setPage('login')} className="text-brand-gold hover:underline">Sign in</button>
    </p>
  </AuthCard>
}

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">{title}</h1>
          <p className="text-white/50">{subtitle}</p>
        </div>
        <div className="glass rounded-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full px-3 py-2.5 rounded-lg bg-brand-ocean/20 border border-brand-ocean/30 focus:border-brand-gold/50 focus:outline-none text-white placeholder:text-white/25 text-sm transition-colors"
      />
    </div>
  )
}

function SubmitBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-xl font-semibold text-brand-dark bg-brand-gold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  )
}
