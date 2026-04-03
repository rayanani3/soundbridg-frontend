import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Dashboard({ setPage }) {
  const { user, getToken, BACKEND_URL } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)

  const fetchProjects = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load projects')
      setProjects(data.projects || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (res.ok) setProjects(p => p.filter(x => x.id !== id))
    } catch {}
    setDeleting(null)
  }

  const fmt = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const fmtDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1">Your Projects</h1>
          <p className="text-white/50 text-sm">
            {user?.name ? `Hey ${user.name} — ` : ''}{projects.length} project{projects.length !== 1 ? 's' : ''} synced
          </p>
        </div>
        <button onClick={fetchProjects} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-brand-ocean/20 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: projects.length },
          { label: 'Total Size', value: fmt(projects.reduce((a, p) => a + (p.file_size || 0), 0)) },
          { label: 'Last Sync', value: projects.length ? fmtDate(Math.max(...projects.map(p => new Date(p.updated_at || p.created_at)))) : '—' },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="font-display font-semibold text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-white/40">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading projects...
        </div>
      ) : error ? (
        <div className="glass rounded-xl p-6 text-center text-red-400">
          <p>{error}</p>
          <button onClick={fetchProjects} className="mt-3 text-sm text-brand-gold hover:underline">Try again</button>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)'}}>
            <svg className="w-8 h-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2" /></svg>
          </div>
          <h3 className="font-display font-semibold text-xl mb-2">No projects yet</h3>
          <p className="text-white/50 text-sm max-w-xs mx-auto">
            Open the SoundBridg desktop app and it will automatically sync your FL Studio projects here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4 group hover:border-brand-gold/20 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{background:'rgba(201,168,76,0.1)'}}>
                  <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2" /></svg>
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.name || p.file_name || 'Untitled Project'}</p>
                  <p className="text-xs text-white/40">{fmt(p.file_size)} · {fmtDate(p.updated_at || p.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.file_url && (
                  <a href={p.file_url} download className="px-3 py-1.5 rounded-lg text-xs text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/10 transition-colors">
                    Download
                  </a>
                )}
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                >
                  {deleting === p.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
