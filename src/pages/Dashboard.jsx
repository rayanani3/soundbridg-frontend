import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const STORAGE_LIMIT = 10 * 1024 * 1024 * 1024 // 10 GB

export default function Dashboard({ setPage }) {
  const { user, getToken, BACKEND_URL, logout } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [filterKind, setFilterKind] = useState('all')
  const [folders, setFolders] = useState(['All Files', 'Recently Deleted'])
  const [activeFolder, setActiveFolder] = useState('All Files')
  const [innerView, setInnerView] = useState('dashboard') // 'dashboard' | 'projects' | 'tracks' | 'sync' | 'convert' | 'settings' | 'upgrade'
  const [recentlyDeleted, setRecentlyDeleted] = useState([])
  const [newFolderName, setNewFolderName] = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [shareProject, setShareProject] = useState(null)
  const [shareTab, setShareTab] = useState('share')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [playerPlaying, setPlayerPlaying] = useState(false)
  const [uploadingTrack, setUploadingTrack] = useState(false)
  const editRef = useRef()
  const uploadRef = useRef()

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadingTrack(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', file.name.replace(/\.[^.]+$/, ''))
      const res = await fetch(`${BACKEND_URL}/api/tracks/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      fetchProjects()
    } catch (err) {
      setError(err.message)
    }
    setUploadingTrack(false)
  }

  useEffect(() => { fetchProjects(); fetchRecentlyDeleted() }, [])
  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus()
  }, [editingId])
  useEffect(() => {
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  const fetchProjects = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/tracks`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setProjects(Array.isArray(data) ? data : [])
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  // No recently-deleted endpoint on this backend — keep state empty
  const fetchRecentlyDeleted = async () => {}

  const handleRestore = async () => { setContextMenu(null) } // no restore endpoint

  const handlePermanentDelete = async (id) => {
    setDeleting(id); setContextMenu(null)
    try {
      await fetch(`${BACKEND_URL}/api/tracks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      setRecentlyDeleted(r => r.filter(x => x.id !== id))
    } catch {}
    setDeleting(null)
  }

  const handleDelete = async (id) => {
    setDeleting(id); setContextMenu(null)
    try {
      const res = await fetch(`${BACKEND_URL}/api/tracks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      if (res.ok) setProjects(p => p.filter(x => x.id !== id))
    } catch {}
    setDeleting(null)
  }

  const handleRename = async (id) => {
    if (!editingName.trim()) { setEditingId(null); return }
    const track = projects.find(x => x.id === id)
    const oldGroup = track?.sync_group || track?.title || ''
    if (oldGroup) {
      try {
        await fetch(`${BACKEND_URL}/api/sync-group/${encodeURIComponent(oldGroup)}/rename`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editingName.trim() })
        })
        setProjects(p => p.map(x => x.id === id ? { ...x, title: editingName.trim(), sync_group: editingName.trim() } : x))
      } catch {}
    }
    setEditingId(null)
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setEditingName(p.title || p.filename || '')
    setContextMenu(null)
  }

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const fmt = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const fmtAgo = (d) => {
    if (!d) return '—'
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  const fmtDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getKind = (p) => {
    const fmt = (p.format || '').toLowerCase()
    if (fmt === 'flp') return 'FL Studio'
    if (fmt === 'mp3') return 'MP3'
    if (fmt === 'wav') return 'WAV'
    if (fmt === 'flac') return 'FLAC'
    return 'File'
  }

  // Backend returns p.format directly; fall back to parsing filename
  const getExt = (p) => p.format?.toLowerCase() || (p.filename || p.title || '').split('.').pop()?.toLowerCase() || ''

  const totalUsed = projects.reduce((a, p) => a + (p.size || 0), 0)
  const usedPct = Math.min((totalUsed / STORAGE_LIMIT) * 100, 100)

  const isRecentlyDeleted = activeFolder === 'Recently Deleted'
  const sourceList = isRecentlyDeleted ? recentlyDeleted : projects

  const filtered = sourceList
    .filter(p => filterKind === 'all' || getExt(p) === filterKind)
    .sort((a, b) => {
      let va, vb
      if (sortKey === 'name') { va = (a.title || a.filename || '').toLowerCase(); vb = (b.title || b.filename || '').toLowerCase() }
      else if (sortKey === 'size') { va = a.size || 0; vb = b.size || 0 }
      else if (sortKey === 'kind') { va = getKind(a); vb = getKind(b) }
      else { va = new Date(a.created_at); vb = new Date(b.created_at) }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })

  const shareUrl = shareProject ? `${BACKEND_URL}/api/tracks/${shareProject.id}/stream` : ''

  // Stats
  const recentProject = [...projects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
  const lastSyncAgo = recentProject ? fmtAgo(recentProject.created_at) : '—'
  const lastSyncName = recentProject ? (recentProject.title || recentProject.filename || '') : ''

  // Ring SVG math: circumference of r=30 circle = 2π*30 ≈ 188.5
  const ringCircum = 188.5
  const ringOffset = ringCircum - (ringCircum * usedPct / 100)

  // Color art gradients for demo cards
  const ART_GRADS = [
    'linear-gradient(135deg,#0f2640 0%,#1B3A5C 100%)',
    'linear-gradient(135deg,#1a1a35 0%,#2a1a4a 100%)',
    'linear-gradient(135deg,#1a0f0f 0%,#3a1a1a 100%)',
    'linear-gradient(135deg,#0f1a30 0%,#1B3A5C 80%)',
    'linear-gradient(135deg,#0d1f18 0%,#1a3a28 100%)',
    'linear-gradient(135deg,#1a150f 0%,#3a2a10 100%)',
  ]
  const EMOJIS = ['🎹', '🎸', '🥁', '🎺', '🎻', '🎙️']

  const topProjects = projects.slice(0, 4)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        padding: '20px 0',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px 24px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '6px', flexShrink: 0,
            background: 'linear-gradient(135deg,#1B3A5C 0%,#C9A84C 120%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
              <path d="M9 18V6l12-2v12" stroke="#0A0A0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" stroke="#0A0A0F" strokeWidth="2" />
              <circle cx="18" cy="16" r="3" stroke="#0A0A0F" strokeWidth="2" />
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
            Sound<span style={{ color: 'var(--accent)' }}>Bridg</span>
          </span>
        </div>

        {/* Workspace nav */}
        <div style={{ padding: '0 12px 16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '0 12px 8px' }}>
            Workspace
          </div>
          <SideNavItem
            active={innerView === 'dashboard' && !isRecentlyDeleted}
            onClick={() => { setInnerView('dashboard'); setActiveFolder('All Files') }}
            icon={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>}
            badge={projects.length}
          >Dashboard</SideNavItem>
          <SideNavItem
            active={innerView === 'projects'}
            onClick={() => { setInnerView('projects'); setActiveFolder('All Files') }}
            icon={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>}
            badge={projects.filter(p => getExt(p) === 'flp').length}
          >Projects</SideNavItem>
          <SideNavItem
            active={innerView === 'tracks'}
            onClick={() => { setInnerView('tracks'); setActiveFolder('All Files') }}
            icon={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2" /></svg>}
            badge={projects.filter(p => getExt(p) === 'wav' || getExt(p) === 'mp3').length}
          >Tracks</SideNavItem>
          <SideNavItem
            active={isRecentlyDeleted && innerView === 'dashboard'}
            onClick={() => { setInnerView('dashboard'); setActiveFolder('Recently Deleted') }}
            icon={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
            badge={recentlyDeleted.length}
          >Trash</SideNavItem>
        </div>

        {/* Tools nav */}
        <div style={{ padding: '0 12px 16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '0 12px 8px' }}>
            Tools
          </div>
          <SideNavItem
            active={innerView === 'sync'}
            onClick={() => setInnerView('sync')}
            icon={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>}
          >Cloud Sync</SideNavItem>
          <SideNavItem
            active={innerView === 'convert'}
            onClick={() => setInnerView('convert')}
            icon={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>}
          >Convert</SideNavItem>
          <SideNavItem
            active={innerView === 'settings'}
            onClick={() => setInnerView('settings')}
            icon={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>}
          >Settings</SideNavItem>
        </div>

        {/* User footer */}
        <div style={{ marginTop: 'auto', padding: '16px 12px 0', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.12s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{
              width: 28, height: 28, borderRadius: '6px', flexShrink: 0,
              background: 'linear-gradient(135deg,#1E4268,#C9A84C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#0A0A0F',
            }}>
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Account'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pro · 10 GB</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-tertiary)"><path d="M7 10l5 5 5-5z" /></svg>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>

        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', borderBottom: '1px solid var(--border)',
          flexShrink: 0, minHeight: '52px',
        }}>
          <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>
            {innerView === 'sync' ? 'Cloud Sync' : innerView === 'convert' ? 'Convert Audio' : innerView === 'settings' ? 'Settings' : innerView === 'projects' ? 'Projects' : innerView === 'tracks' ? 'Tracks' : isRecentlyDeleted ? 'Trash' : 'Dashboard'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Sync pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
              background: 'var(--green-dim)', color: 'var(--green)',
              border: '1px solid rgba(34,197,94,0.2)',
            }}>
              <span className="animate-breathe" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, display: 'inline-block' }} />
              Watching FL Studio
            </div>
            {/* Filter chips */}
            {['all', 'mp3', 'wav', 'flp'].map(k => (
              <button key={k} onClick={() => setFilterKind(k)} style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.12s', border: 'none',
                background: filterKind === k ? 'var(--accent-dim)' : 'transparent',
                color: filterKind === k ? 'var(--accent)' : 'var(--text-tertiary)',
              }}>
                {k === 'all' ? 'All' : k.toUpperCase()}
              </button>
            ))}
            {/* Search */}
            <button style={{
              width: 32, height: 32, borderRadius: '6px', border: '1px solid var(--border-mid)',
              background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.12s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
            </button>
            {/* Refresh */}
            <button onClick={fetchProjects} style={{
              width: 32, height: 32, borderRadius: '6px', border: '1px solid var(--border-mid)',
              background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.12s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            {/* Upload */}
            <input
              ref={uploadRef}
              type="file"
              accept=".mp3,.wav,.flac,.flp"
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
            <button
              onClick={() => uploadRef.current?.click()}
              disabled={uploadingTrack}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                cursor: uploadingTrack ? 'not-allowed' : 'pointer', padding: '7px 14px',
                background: 'var(--accent)', color: '#0A0A0F',
                opacity: uploadingTrack ? 0.6 : 1,
                transition: 'background 0.12s, opacity 0.12s',
              }}
              onMouseEnter={e => { if (!uploadingTrack) e.currentTarget.style.background = '#d4b560' }}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
              {uploadingTrack ? (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                  <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
              )}
              {uploadingTrack ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>

        {/* Inner panels for non-dashboard views */}
        {innerView === 'sync' && <SyncPanel BACKEND_URL={BACKEND_URL} getToken={getToken} />}
        {innerView === 'convert' && <ConvertPanel BACKEND_URL={BACKEND_URL} getToken={getToken} />}
        {innerView === 'settings' && <SettingsPanel user={user} getToken={getToken} BACKEND_URL={BACKEND_URL} logout={logout} setPage={setPage} />}
        {innerView === 'projects' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
              {projects.filter(p => getExt(p) === 'flp').length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 0', color: 'var(--text-tertiary)', fontSize: '13px' }}>No FL Studio projects yet. Start syncing from the desktop app.</div>
              ) : projects.filter(p => getExt(p) === 'flp').map((p, i) => (
                <ProjectCard2 key={p.id} name={p.title || p.filename || 'Untitled'} artGrad={ART_GRADS[i % ART_GRADS.length]} emoji={EMOJIS[i % EMOJIS.length]} meta={`${fmt(p.size)} · ${fmtAgo(p.created_at)}`} />
              ))}
            </div>
          </div>
        )}
        {innerView === 'tracks' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>Title</th>
                    <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>Format</th>
                    <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>Size</th>
                    <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>Synced</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>Loading…</td></tr>
                  ) : projects.filter(p => ['wav','mp3','flac','ogg','aiff','m4a'].includes(getExt(p))).length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>No audio tracks yet. Open the desktop app to start syncing.</td></tr>
                  ) : projects.filter(p => ['wav','mp3','flac','ogg','aiff','m4a'].includes(getExt(p))).map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '6px', background: ART_GRADS[i % ART_GRADS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{EMOJIS[i % EMOJIS.length]}</div>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{p.title || p.filename || 'Untitled'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px' }}><span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '999px', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-line)' }}>{getExt(p).toUpperCase()}</span></td>
                      <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono,monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>{fmt(p.size)}</td>
                      <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-tertiary)' }}>{fmtAgo(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content scroll — only shown for dashboard/trash view */}
        {(innerView === 'dashboard' || innerView === 'upgrade') && <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>

          {/* Stats grid — shown only in main view */}
          {!isRecentlyDeleted && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' }}>
              <StatCard label="Total Tracks" value={loading ? '…' : String(projects.length)} delta={projects.length > 0 ? '+' + Math.min(projects.length, 8) + ' today' : null} deltaType="up" />
              <StatCard label="Projects" value={loading ? '…' : String(projects.length)} delta="5 active" deltaType="accent" />
              <StatCard label="Last Sync" value={loading ? '…' : lastSyncAgo} sub={lastSyncName ? lastSyncName.slice(0, 24) + (lastSyncName.length > 24 ? '…' : '') : 'No files yet'} small />
              <StatCard label="Storage Used" value={loading ? '…' : fmt(totalUsed)} sub={`of 10 GB · ${usedPct.toFixed(0)}%`} small bar barPct={usedPct} />
            </div>
          )}

          {/* Recently synced section */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              {isRecentlyDeleted ? 'Trash' : 'Recently synced'}
            </span>
            {!isRecentlyDeleted && (
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.12s' }}>
                View all →
              </span>
            )}
          </div>

          {/* Table */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '14px', overflow: 'hidden', marginBottom: '32px',
          }}>
            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['all', 'wav', 'mp3'].map(k => (
                  <button key={k} onClick={() => setFilterKind(k)} style={{
                    padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer', border: '1px solid var(--border-mid)',
                    background: filterKind === k ? 'var(--accent-dim)' : 'transparent',
                    color: filterKind === k ? 'var(--accent)' : 'var(--text-secondary)',
                    fontFamily: 'inherit', transition: 'all 0.12s',
                  }}>
                    {k === 'all' ? 'All' : k.toUpperCase()}
                  </button>
                ))}
              </div>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                border: '1px solid var(--border-mid)', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', padding: '5px 10px',
                background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'inherit',
                transition: 'all 0.12s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg>
                Filter
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '36px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>#</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                    <SortBtn col="name" current={sortKey} dir={sortDir} onClick={handleSort}>Title</SortBtn>
                  </th>
                  <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                    <SortBtn col="kind" current={sortKey} dir={sortDir} onClick={handleSort}>Format</SortBtn>
                  </th>
                  <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                    <SortBtn col="size" current={sortKey} dir={sortDir} onClick={handleSort}>Size</SortBtn>
                  </th>
                  <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                    <SortBtn col="date" current={sortKey} dir={sortDir} onClick={handleSort}>Sync</SortBtn>
                  </th>
                  <th style={{ textAlign: 'right', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '12px 20px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span style={{ fontSize: '13px' }}>Loading…</span>
                    </div>
                  </td></tr>
                ) : error ? (
                  <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--red)', fontSize: '13px' }}>
                    {error}
                    <button onClick={fetchProjects} style={{ display: 'block', margin: '8px auto 0', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Try again</button>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '160px', color: 'var(--text-tertiary)' }}>
                      <svg style={{ width: 32, height: 32, marginBottom: 12, opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2" />
                      </svg>
                      <span style={{ fontSize: '13px' }}>
                        {isRecentlyDeleted ? 'Trash is empty.' : 'No files yet. Open the desktop app to start syncing.'}
                      </span>
                    </div>
                  </td></tr>
                ) : filtered.map((p, i) => {
                  const name = p.title || p.filename || 'Untitled'
                  const ext = getExt(p)
                  const isEditing = editingId === p.id
                  const isWav = ext === 'wav'
                  const artGrad = ART_GRADS[i % ART_GRADS.length]
                  const emoji = EMOJIS[i % EMOJIS.length]

                  return (
                    <tr key={p.id}
                      onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'file', project: p }) }}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* # */}
                      <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono,monospace', fontSize: '12px', color: 'var(--text-tertiary)', width: 36, textAlign: 'center' }}>
                        {i + 1}
                      </td>

                      {/* Title */}
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: '1px solid var(--border)', background: artGrad }}>
                            {emoji}
                          </div>
                          <div>
                            {isEditing ? (
                              <input ref={editRef} value={editingName} onChange={e => setEditingName(e.target.value)}
                                onBlur={() => handleRename(p.id)}
                                onKeyDown={e => { if (e.key === 'Enter') handleRename(p.id); if (e.key === 'Escape') setEditingId(null) }}
                                style={{
                                  fontSize: '13.5px', padding: '2px 6px', borderRadius: '4px', minWidth: 0,
                                  background: 'var(--bg-input)', border: '1px solid var(--accent-line)',
                                  color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
                                }} />
                            ) : (
                              <div
                                onDoubleClick={() => !isRecentlyDeleted && startEdit(p)}
                                style={{ fontSize: '13.5px', fontWeight: 500, color: isRecentlyDeleted ? 'var(--text-tertiary)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}
                                title={name}>
                                {name}
                              </div>
                            )}
                            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                              {user?.name || 'SoundBridg'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Format */}
                      <td style={{ padding: '12px 20px' }}>
                        {ext ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            fontFamily: 'JetBrains Mono,monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em',
                            padding: '2px 7px', borderRadius: '999px',
                            background: isWav ? 'var(--accent-dim)' : 'var(--bg-hover)',
                            color: isWav ? 'var(--accent)' : 'var(--text-tertiary)',
                            border: isWav ? '1px solid var(--accent-line)' : '1px solid var(--border)',
                          }}>{ext.toUpperCase()}</span>
                        ) : <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>—</span>}
                      </td>

                      {/* Size */}
                      <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono,monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {fmt(p.size)}
                      </td>

                      {/* Sync */}
                      <td style={{ padding: '12px 20px' }}>
                        {i === 0 && !isRecentlyDeleted ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <span className="animate-breathe" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, display: 'inline-block' }} />
                            Live
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                            {fmtAgo(p.created_at)}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                          {isRecentlyDeleted ? (
                            <>
                              <IconBtn title="Restore" onClick={() => handleRestore(p.id)} color="var(--accent)">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 13, height: 13 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                              </IconBtn>
                              <IconBtn title="Delete permanently" onClick={() => handlePermanentDelete(p.id)} disabled={deleting === p.id} color="var(--red)">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 13, height: 13 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </IconBtn>
                            </>
                          ) : (
                            <>
                              <IconBtn title="Share" onClick={() => { setShareProject(p); setShareTab('share') }} color="var(--accent)">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 13, height: 13 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                              </IconBtn>
                              <IconBtn title="Move to Trash" onClick={() => handleDelete(p.id)} disabled={deleting === p.id} color="var(--red)">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 13, height: 13 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </IconBtn>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Projects grid — shown only when not in trash and have projects */}
          {!isRecentlyDeleted && topProjects.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>Projects</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', opacity: 0.8 }}>View all →</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' }}>
                {topProjects.map((p, i) => {
                  const name = p.title || p.filename || 'Untitled'
                  const artGrad = ART_GRADS[i % ART_GRADS.length]
                  const emoji = EMOJIS[i % EMOJIS.length]
                  return (
                    <ProjectCard2 key={p.id} name={name} artGrad={artGrad} emoji={emoji} meta={`${fmt(p.size)} · ${fmtAgo(p.created_at)}`} />
                  )
                })}
              </div>
            </>
          )}

          {/* Storage card — shown only in main view */}
          {!isRecentlyDeleted && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '24px',
              display: 'flex', alignItems: 'center', gap: '32px',
              marginBottom: '32px',
            }}>
              {/* Ring */}
              <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                <svg viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)', width: 72, height: 72 }}>
                  <circle style={{ fill: 'none', stroke: 'var(--border-mid)', strokeWidth: 5 }} cx="36" cy="36" r="30" />
                  <circle style={{
                    fill: 'none', stroke: 'var(--accent)', strokeWidth: 5,
                    strokeLinecap: 'round',
                    strokeDasharray: ringCircum,
                    strokeDashoffset: ringOffset,
                    transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)',
                  }} cx="36" cy="36" r="30" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{usedPct.toFixed(0)}%</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>used</div>
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Storage · Pro Plan</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {fmt(totalUsed)} of 10 GB used · {fmt(STORAGE_LIMIT - totalUsed)} available
                </div>
                <div style={{ height: '4px', background: 'var(--border-mid)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ height: '100%', width: `${usedPct}%`, background: 'linear-gradient(90deg,var(--primary-mid) 0%,var(--accent) 100%)', borderRadius: '2px', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  <span>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '2px', background: 'var(--primary-mid)', marginRight: '5px', verticalAlign: 'middle' }} />
                    WAV · {fmt(projects.filter(p => getExt(p) === 'wav').reduce((a, p) => a + (p.size || 0), 0))}
                  </span>
                  <span>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '2px', background: 'var(--accent)', marginRight: '5px', verticalAlign: 'middle' }} />
                    MP3 · {fmt(projects.filter(p => getExt(p) === 'mp3').reduce((a, p) => a + (p.size || 0), 0))}
                  </span>
                </div>
              </div>

              <button onClick={() => setPage('upgrade')} style={{
                flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '1px solid var(--border-mid)', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', padding: '7px 14px',
                background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'inherit',
                transition: 'all 0.12s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                Upgrade to Studio
              </button>
            </div>
          )}
        </div>}

        {/* ── PLAYER BAR ── */}
        <div style={{
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', height: '72px', flexShrink: 0, gap: '16px',
        }}>
          {/* Track */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '240px', flexShrink: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '6px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', border: '1px solid var(--border)',
              background: ART_GRADS[0],
            }}>
              {recentProject ? EMOJIS[0] : '🎵'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
                {recentProject ? (recentProject.title || recentProject.filename || 'Untitled').slice(0, 22) : 'No track playing'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                {user?.name || 'SoundBridg'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <PlayerCtrlBtn><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg></PlayerCtrlBtn>
              <PlayerCtrlBtn><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg></PlayerCtrlBtn>
              <button onClick={() => setPlayerPlaying(p => !p)} style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--text-primary)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--bg)', transition: 'background 0.1s,transform 0.1s', flexShrink: 0,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.transform = 'scale(1)' }}>
                {playerPlaying
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                }
              </button>
              <PlayerCtrlBtn><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg></PlayerCtrlBtn>
              <PlayerCtrlBtn><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg></PlayerCtrlBtn>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '480px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono,monospace', color: 'var(--text-tertiary)', minWidth: '32px' }}>0:00</span>
              <div style={{ flex: 1, height: 3, background: 'var(--border-mid)', borderRadius: '2px', cursor: 'pointer' }}>
                <div style={{ height: '100%', width: '0%', background: 'var(--text-secondary)', borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono,monospace', color: 'var(--text-tertiary)', minWidth: '32px', textAlign: 'right' }}>0:00</span>
            </div>
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px', justifyContent: 'flex-end', flexShrink: 0 }}>
            <PlayerCtrlBtn>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5zm7-.17v6.34L9.83 13H7v-2h2.83L12 8.83z" /></svg>
            </PlayerCtrlBtn>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '80px', height: '3px', background: 'var(--border-mid)', borderRadius: '2px', cursor: 'pointer' }}>
                <div style={{ height: '100%', width: '72%', background: 'var(--text-secondary)', borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Context menu ── */}
      {contextMenu && (
        <div style={{
          position: 'fixed', zIndex: 100,
          left: contextMenu.x, top: contextMenu.y,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
          borderRadius: '10px', padding: '4px 0', minWidth: '160px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {contextMenu.type === 'file' && contextMenu.project && (
            isRecentlyDeleted ? (
              <>
                <CtxItem onClick={() => handleRestore(contextMenu.project.id)}>Restore</CtxItem>
                <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                <CtxItem red onClick={() => handlePermanentDelete(contextMenu.project.id)}>Delete Permanently</CtxItem>
              </>
            ) : (
              <>
                <CtxItem onClick={() => startEdit(contextMenu.project)}>Rename</CtxItem>
                <CtxItem onClick={() => { setShareProject(contextMenu.project); setShareTab('share'); setContextMenu(null) }}>Share</CtxItem>
                <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                <CtxItem red onClick={() => handleDelete(contextMenu.project.id)}>Move to Trash</CtxItem>
              </>
            )
          )}
        </div>
      )}

      {/* ── Share modal ── */}
      {shareProject && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShareProject(null)}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
            borderRadius: '20px', width: '100%', maxWidth: '440px', margin: '0 16px', overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              {['share', 'embed', 'message'].map(t => (
                <button key={t} onClick={() => setShareTab(t)} style={{
                  flex: 1, padding: '12px 0', fontSize: '13px', fontWeight: 500,
                  textTransform: 'capitalize', cursor: 'pointer',
                  color: shareTab === t ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  borderBottom: shareTab === t ? '2px solid var(--accent)' : '2px solid transparent',
                  background: 'transparent', transition: 'color 0.12s', fontFamily: 'inherit',
                }}>{t}</button>
              ))}
              <button onClick={() => setShareProject(null)} style={{ padding: '0 16px', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', border: 'none' }}>
                <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: 'var(--bg-hover)', marginBottom: '16px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'var(--accent-dim)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg style={{ width: 20, height: 20, color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2" /></svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shareProject.title || shareProject.filename}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{user?.name || 'SoundBridg'}</p>
                </div>
              </div>

              {shareTab === 'share' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Share link</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input readOnly value={shareUrl} style={{ flex: 1, padding: '8px 12px', fontSize: '12px', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-mid)', color: 'var(--text-secondary)', outline: 'none', fontFamily: 'JetBrains Mono,monospace' }} />
                    <button onClick={() => navigator.clipboard.writeText(shareUrl)} style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: 'var(--accent)', color: '#0A0A0F', cursor: 'pointer', flexShrink: 0, border: 'none', fontFamily: 'inherit' }}>Copy</button>
                  </div>
                </div>
              )}
              {shareTab === 'embed' && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Embed code</p>
                  <textarea readOnly value={`<iframe src="${shareUrl}" width="100%" height="80" frameborder="0"></iframe>`}
                    style={{ width: '100%', height: '80px', padding: '8px 12px', fontSize: '11px', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-mid)', color: 'var(--text-secondary)', outline: 'none', resize: 'none', fontFamily: 'JetBrains Mono,monospace' }} />
                  <button onClick={() => navigator.clipboard.writeText(`<iframe src="${shareUrl}" width="100%" height="80" frameborder="0"></iframe>`)}
                    style={{ marginTop: '8px', width: '100%', padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: 'var(--accent)', color: '#0A0A0F', cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
                    Copy Embed
                  </button>
                </div>
              )}
              {shareTab === 'message' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Send via message</p>
                  <input placeholder="Email or phone number" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-mid)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }} />
                  <button style={{ width: '100%', padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: 'var(--accent)', color: '#0A0A0F', cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>Send</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ── */

function SideNavItem({ children, active, onClick, icon, badge }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '6px 12px', cursor: 'pointer',
      background: active ? 'var(--accent-dim)' : 'transparent',
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      fontSize: '13.5px', fontWeight: active ? 600 : 500,
      borderRadius: '6px', border: 'none', fontFamily: 'inherit',
      transition: 'all 0.12s', position: 'relative',
      borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}>
      <span style={{ flexShrink: 0, color: active ? 'var(--accent)' : 'var(--text-tertiary)', opacity: active ? 1 : 0.7 }}>{icon}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
      {badge > 0 && (
        <span style={{
          fontFamily: 'JetBrains Mono,monospace', fontSize: '10px',
          color: active ? 'var(--accent)' : 'var(--text-tertiary)',
          background: active ? 'var(--accent-dim)' : 'var(--bg-hover)',
          padding: '1px 6px', borderRadius: '999px',
        }}>{badge}</span>
      )}
    </button>
  )
}

function StatCard({ label, value, delta, deltaType, sub, small, bar, barPct }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '14px', padding: '20px 24px',
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '12px' }}>{label}</div>
      <div style={{ fontSize: small ? '20px' : '26px', fontWeight: 700, letterSpacing: small ? '-0.5px' : '-1px', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginBottom: '8px' }}>{value}</div>
      {delta && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 600, fontFamily: 'JetBrains Mono,monospace',
            padding: '2px 6px', borderRadius: '999px',
            background: deltaType === 'up' ? 'var(--green-dim)' : 'var(--accent-dim)',
            color: deltaType === 'up' ? 'var(--green)' : 'var(--accent)',
          }}>{delta}</span>
        </div>
      )}
      {sub && <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: bar ? '6px' : 0 }}>{sub}</div>}
      {bar && (
        <div style={{ height: '3px', background: 'var(--border-mid)', borderRadius: '2px', overflow: 'hidden', marginTop: '12px' }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            background: 'linear-gradient(90deg,var(--primary-mid),var(--accent))',
            width: `${barPct}%`,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      )}
    </div>
  )
}

function ProjectCard2({ name, artGrad, emoji, meta }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${hovered ? 'var(--border-accent)' : 'var(--border)'}`,
      borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
      transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
      transition: 'border-color 0.15s,transform 0.15s',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', position: 'relative', overflow: 'hidden', background: artGrad }}>
        {emoji}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px var(--accent-glow)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A0F"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>{name}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{meta}</div>
      </div>
    </div>
  )
}

function SortBtn({ children, col, current, dir, onClick }) {
  const active = current === col
  return (
    <button onClick={() => onClick(col)} style={{
      display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
      fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
      color: active ? 'var(--text-secondary)' : 'var(--text-tertiary)',
      background: 'transparent', border: 'none', fontFamily: 'inherit',
    }}>
      {children}
      {active ? (
        dir === 'asc'
          ? <svg style={{ width: 10, height: 10, color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          : <svg style={{ width: 10, height: 10, color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      ) : (
        <svg style={{ width: 10, height: 10, opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
      )}
    </button>
  )
}

function IconBtn({ children, onClick, title, disabled, color }) {
  return (
    <button title={title} onClick={onClick} disabled={disabled} style={{
      width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'transparent', color: 'var(--text-tertiary)', border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.12s', opacity: disabled ? 0.4 : 1,
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = color } }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}>
      {children}
    </button>
  )
}

function PlayerCtrlBtn({ children }) {
  return (
    <button style={{
      background: 'none', border: 'none', color: 'var(--text-secondary)',
      cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '6px', transition: 'color 0.1s,background 0.1s',
    }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">{children}</svg>
    </button>
  )
}

function CtxItem({ children, onClick, red }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', padding: '7px 14px', fontSize: '13px', cursor: 'pointer',
      color: red ? 'var(--red)' : 'var(--text-secondary)',
      background: 'transparent', transition: 'background 0.12s', border: 'none', fontFamily: 'inherit',
    }}
      onMouseEnter={e => e.currentTarget.style.background = red ? 'var(--red-dim)' : 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {children}
    </button>
  )
}

/* ── Inner Panel Components ── */

function SyncPanel({ BACKEND_URL, getToken }) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/sync-groups`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      if (res.ok) setGroups(data.groups || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchGroups() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/sync-groups`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create group')
      setGroups(g => [data.group, ...g])
      setNewName('')
      setShowCreate(false)
    } catch (err) { setError(err.message) }
    setCreating(false)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
      <div style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Cloud Sync Groups</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Organize files into sync groups for easy sharing and collaboration.</p>
          </div>
          <button onClick={() => setShowCreate(s => !s)} style={{ padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: 'var(--accent)', color: '#0A0A0F', border: 'none', cursor: 'pointer' }}>
            + New Group
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Group name…" autoFocus style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-mid)', color: 'var(--text-primary)', outline: 'none', fontSize: '13px', fontFamily: 'inherit' }} />
            <button type="submit" disabled={creating} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: 'var(--accent)', color: '#0A0A0F', border: 'none', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.6 : 1 }}>
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        )}

        {error && <div style={{ fontSize: '13px', color: 'var(--red)', marginBottom: '12px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)', fontSize: '13px' }}>Loading…</div>
        ) : groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-tertiary)', fontSize: '13px' }}>No sync groups yet. Create one above to get started.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {groups.map(g => (
              <div key={g.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{g.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{g.member_count || 0} member{g.member_count !== 1 ? 's' : ''} · {g.file_count || 0} file{g.file_count !== 1 ? 's' : ''}</div>
                </div>
                <button style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: 'transparent', color: 'var(--accent)', border: '1px solid var(--border-mid)', cursor: 'pointer' }}>Open</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ConvertPanel({ BACKEND_URL, getToken }) {
  const [file, setFile] = useState(null)
  const [format, setFormat] = useState('mp3')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef()

  const handleConvert = async () => {
    if (!file) return
    setUploading(true); setError(''); setResult(null)
    try {
      // Step 1: upload the source file
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', file.name.replace(/\.[^.]+$/, ''))
      const uploadRes = await fetch(`${BACKEND_URL}/api/tracks/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed')

      // Step 2: convert the uploaded track
      const convertRes = await fetch(`${BACKEND_URL}/api/tracks/${uploadData.id}/convert`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ format })
      })
      const convertData = await convertRes.json()
      if (!convertRes.ok) throw new Error(convertData.error || 'Conversion failed')

      // Step 3: get a signed download URL for the converted file
      const dlRes = await fetch(`${BACKEND_URL}/api/tracks/${convertData.id}/download`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const dlData = await dlRes.json()
      if (!dlRes.ok) throw new Error(dlData.error || 'Could not get download URL')

      setResult({ url: dlData.download_url, filename: dlData.filename })
    } catch (err) { setError(err.message) }
    setUploading(false)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
      <div style={{ maxWidth: 560 }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Convert Audio</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Upload a WAV or MP3 and convert it to your desired format.</p>

        <div
          style={{ border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border-mid)'}`, borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s', marginBottom: '16px' }}
          onDragOver={e => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={e => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) setFile(f) }}
          onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept=".wav,.mp3,.flac" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB — click to change</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Drop a file here or <span style={{ color: 'var(--accent)' }}>browse</span></div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>WAV, MP3, FLAC supported</div>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Output Format</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['mp3', 'wav'].map(f => (
              <button key={f} onClick={() => setFormat(f)} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', background: format === f ? 'var(--accent)' : 'var(--bg-hover)', color: format === f ? '#0A0A0F' : 'var(--text-secondary)', transition: 'all 0.12s', fontFamily: 'inherit' }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={{ fontSize: '13px', color: 'var(--red)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '10px 14px', marginBottom: '12px' }}>{error}</div>}

        <button onClick={handleConvert} disabled={!file || uploading} style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: 'var(--accent)', color: '#0A0A0F', border: 'none', cursor: !file || uploading ? 'not-allowed' : 'pointer', opacity: !file || uploading ? 0.6 : 1, transition: 'opacity 0.12s', fontFamily: 'inherit' }}>
          {uploading ? 'Uploading & converting…' : `Convert to ${format.toUpperCase()}`}
        </button>

        {result && result.url && (
          <div style={{ marginTop: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600, marginBottom: '8px' }}>Conversion complete</div>
            <a href={result.url} download={result.filename} style={{ fontSize: '13px', color: 'var(--accent)' }}>Download {result.filename || 'converted file'}</a>
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsPanel({ user, getToken, BACKEND_URL, logout, setPage }) {
  const token = getToken()
  const appVersion = '1.0.0'
  const watchFolder = 'Documents/Image-Line/FL Studio/Projects'
  const syncInterval = '5 minutes'

  const handleLogout = () => {
    logout()
    setPage('home')
  }

  const copyToken = () => {
    if (token) navigator.clipboard.writeText(token)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
      <div style={{ maxWidth: 560 }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Settings</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>Manage your account and sync preferences.</p>

        {/* Account section */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '14px' }}>Account</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'linear-gradient(135deg,#1E4268,#C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#0A0A0F' }}>
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name || 'Account'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.email || ''}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: 'transparent', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>
            Sign Out
          </button>
        </div>

        {/* Sync settings */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '14px' }}>Sync</div>
          <SettingsRow label="Watch Folder" value={watchFolder} />
          <SettingsRow label="Sync Interval" value={syncInterval} />
        </div>

        {/* Auth token */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '14px' }}>Auth Token</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1, fontFamily: 'JetBrains Mono,monospace', fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-input)', border: '1px solid var(--border-mid)', borderRadius: '6px', padding: '8px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {token ? token.slice(0, 40) + '…' : 'Not signed in'}
            </div>
            {token && (
              <button onClick={copyToken} style={{ padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: 'var(--accent)', color: '#0A0A0F', border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Copy</button>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Used by the desktop app to authenticate sync uploads.</div>
        </div>

        {/* App info */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '14px' }}>About</div>
          <SettingsRow label="App Version" value={`v${appVersion}`} />
          <SettingsRow label="Backend" value="soundbridg-backend.onrender.com" />
        </div>
      </div>
    </div>
  )
}

function SettingsRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, fontFamily: label === 'Watch Folder' || label === 'Auth Token' || label === 'Backend' ? 'JetBrains Mono,monospace' : 'inherit' }}>{value}</span>
    </div>
  )
}
