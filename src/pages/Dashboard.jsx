import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const STORAGE_LIMIT = 10 * 1024 * 1024 * 1024 // 10 GB

export default function Dashboard({ setPage }) {
  const { user, getToken, BACKEND_URL } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [filterKind, setFilterKind] = useState('all')
  const [folders, setFolders] = useState(['All Files', 'Recently Deleted'])
  const [activeFolder, setActiveFolder] = useState('All Files')
  const [recentlyDeleted, setRecentlyDeleted] = useState([])
  const [newFolderName, setNewFolderName] = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [shareProject, setShareProject] = useState(null)
  const [shareTab, setShareTab] = useState('share')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const editRef = useRef()

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
      const res = await fetch(`${BACKEND_URL}/api/projects`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setProjects(data.projects || [])
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  const fetchRecentlyDeleted = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/recently-deleted`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      if (res.ok) setRecentlyDeleted(data.projects || [])
    } catch {}
  }

  const handleRestore = async (id) => {
    setContextMenu(null)
    try {
      await fetch(`${BACKEND_URL}/api/projects/${id}/restore`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } })
      setRecentlyDeleted(r => r.filter(x => x.id !== id))
      fetchProjects()
    } catch {}
  }

  const handlePermanentDelete = async (id) => {
    setDeleting(id); setContextMenu(null)
    try {
      await fetch(`${BACKEND_URL}/api/projects/${id}/permanent`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      setRecentlyDeleted(r => r.filter(x => x.id !== id))
    } catch {}
    setDeleting(null)
  }

  const handleDelete = async (id) => {
    setDeleting(id); setContextMenu(null)
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      if (res.ok) {
        const deleted = projects.find(x => x.id === id)
        setProjects(p => p.filter(x => x.id !== id))
        if (deleted) setRecentlyDeleted(r => [{ ...deleted, deleted_at: new Date().toISOString() }, ...r])
      }
    } catch {}
    setDeleting(null)
  }

  const handleRename = async (id) => {
    if (!editingName.trim()) { setEditingId(null); return }
    try {
      await fetch(`${BACKEND_URL}/api/projects/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() })
      })
      setProjects(p => p.map(x => x.id === id ? { ...x, name: editingName.trim() } : x))
    } catch {}
    setEditingId(null)
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setEditingName(p.name || p.file_name || '')
    setContextMenu(null)
  }

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const fmt = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`
    return `${(bytes/(1024*1024)).toFixed(1)} MB`
  }
  const fmtDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
  const getKind = (p) => {
    const name = (p.file_name || p.name || '').toLowerCase()
    if (name.endsWith('.flp')) return 'FL Studio'
    if (name.endsWith('.mp3')) return 'MP3'
    if (name.endsWith('.wav')) return 'WAV'
    if (name.endsWith('.flac')) return 'FLAC'
    return 'File'
  }
  const getExt = (p) => (p.file_name || p.name || '').split('.').pop()?.toLowerCase() || ''

  const totalUsed = projects.reduce((a, p) => a + (p.file_size || 0), 0)
  const usedPct = Math.min((totalUsed / STORAGE_LIMIT) * 100, 100)

  const isRecentlyDeleted = activeFolder === 'Recently Deleted'
  const sourceList = isRecentlyDeleted ? recentlyDeleted : projects

  const filtered = sourceList
    .filter(p => filterKind === 'all' || getExt(p) === filterKind)
    .sort((a, b) => {
      let va, vb
      if (sortKey === 'name') { va = (a.name||a.file_name||'').toLowerCase(); vb = (b.name||b.file_name||'').toLowerCase() }
      else if (sortKey === 'size') { va = a.file_size||0; vb = b.file_size||0 }
      else if (sortKey === 'kind') { va = getKind(a); vb = getKind(b) }
      else { va = new Date(a.updated_at||a.created_at); vb = new Date(b.updated_at||b.created_at) }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })

  const shareUrl = shareProject?.file_url || ''

  return (
    <div className="flex" style={{height: 'calc(100vh - 52px)'}}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo row */}
        <div style={{padding: '20px 12px 8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
            background: 'linear-gradient(135deg, #1B3A5C 0%, #C9A84C 120%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" style={{width: '14px', height: '14px'}}>
              <path d="M9 18V6l12-2v12" stroke="#0A0A0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="#0A0A0F" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="#0A0A0F" strokeWidth="2"/>
            </svg>
          </div>
          <span style={{fontSize: '14px', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)'}}>
            Sound<span style={{color: 'var(--accent)'}}>Bridg</span>
          </span>
        </div>

        {/* Nav sections */}
        <div style={{flex: 1, overflowY: 'auto', padding: '8px 0'}}>
          {/* Library section */}
          <div style={{padding: '8px 12px 4px'}}>
            <span style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--text-tertiary)',
            }}>Library</span>
          </div>
          {['All Files', 'Recently Deleted'].map(f => (
            <SideNavItem
              key={f}
              active={activeFolder === f}
              onClick={() => setActiveFolder(f)}
              icon={f === 'Recently Deleted' ? (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              ) : (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
              )}
              badge={f === 'All Files' ? projects.length : recentlyDeleted.length}
            >
              {f}
            </SideNavItem>
          ))}

          {/* Custom folders */}
          {folders.filter(f => f !== 'All Files' && f !== 'Recently Deleted').length > 0 && (
            <>
              <div style={{padding: '12px 12px 4px'}}>
                <span style={{
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--text-tertiary)',
                }}>Folders</span>
              </div>
              {folders.filter(f => f !== 'All Files' && f !== 'Recently Deleted').map(f => (
                <SideNavItem key={f} active={activeFolder === f} onClick={() => setActiveFolder(f)}
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>}>
                  {f}
                </SideNavItem>
              ))}
            </>
          )}

          {showFolderInput && (
            <div style={{padding: '4px 12px'}}>
              <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newFolderName.trim()) {
                    setFolders(f => {
                      const idx = f.indexOf('Recently Deleted')
                      const next = [...f]
                      next.splice(idx >= 0 ? idx : next.length, 0, newFolderName.trim())
                      return next
                    })
                    setNewFolderName(''); setShowFolderInput(false)
                  }
                  if (e.key === 'Escape') { setShowFolderInput(false); setNewFolderName('') }
                }}
                onBlur={() => { setShowFolderInput(false); setNewFolderName('') }}
                placeholder="Folder name"
                style={{
                  width: '100%', padding: '4px 8px', fontSize: '12px', borderRadius: '6px',
                  background: 'var(--bg-input)', border: '1px solid var(--accent-line)',
                  color: 'var(--text-primary)', outline: 'none',
                  fontFamily: 'inherit',
                }} />
            </div>
          )}
        </div>

        {/* User + storage at bottom */}
        <div style={{borderTop: '1px solid var(--border)', padding: '12px'}}>
          {/* User row */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
              background: 'linear-gradient(135deg, #1E4268, #C9A84C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#0A0A0F',
            }}>
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div style={{minWidth: 0}}>
              <div style={{fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {user?.name || 'Account'}
              </div>
              <div style={{fontSize: '11px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* Storage */}
          <button onClick={() => setPage('upgrade')} style={{width: '100%', textAlign: 'left', display: 'block'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '6px'}}>
              <span>Storage</span>
              <span style={{fontFamily: 'JetBrains Mono, monospace'}}>{fmt(totalUsed)} / 10 GB</span>
            </div>
            <div style={{width: '100%', height: '3px', borderRadius: '999px', background: 'var(--border-mid)', overflow: 'hidden'}}>
              <div style={{
                height: '100%', borderRadius: '999px',
                background: `linear-gradient(90deg, var(--primary-mid), var(--accent))`,
                width: `${usedPct}%`,
                transition: '0.6s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
            <p style={{fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px'}}>Upgrade storage →</p>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>

        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '52px', flexShrink: 0,
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <h1 style={{fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0}}>
              {activeFolder}
            </h1>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '3px 8px', borderRadius: '999px',
              background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)',
            }}>
              <span className="animate-breathe" style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--green)', flexShrink: 0,
                display: 'inline-block',
              }} />
              <span style={{fontSize: '11px', fontWeight: 600, color: 'var(--green)', fontFamily: 'inherit'}}>
                Sync Live
              </span>
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            {['all','mp3','wav','flp'].map(k => (
              <button key={k} onClick={() => setFilterKind(k)} style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.12s',
                background: filterKind === k ? 'var(--accent-dim)' : 'transparent',
                color: filterKind === k ? 'var(--accent)' : 'var(--text-tertiary)',
                border: filterKind === k ? '1px solid var(--accent-line)' : '1px solid transparent',
              }}>
                {k === 'all' ? 'All' : k.toUpperCase()}
              </button>
            ))}
            <button onClick={() => setShowFolderInput(true)} title="New folder" style={{
              width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', color: 'var(--text-tertiary)', border: '1px solid var(--border-mid)', cursor: 'pointer',
              marginLeft: '4px',
            }}>
              <svg style={{width:14,height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            <button onClick={fetchProjects} title="Refresh" style={{
              width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', color: 'var(--text-tertiary)', border: '1px solid var(--border-mid)', cursor: 'pointer',
            }}>
              <svg style={{width:14,height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{flex: 1, overflowY: 'auto', padding: '24px 32px'}}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px',
            overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr 200px 100px 120px 80px',
              padding: '0 16px',
              borderBottom: '1px solid var(--border)',
              height: '36px', alignItems: 'center',
            }}>
              <span style={{fontSize:'11px',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--text-tertiary)'}}>#</span>
              <SortBtn col="name" current={sortKey} dir={sortDir} onClick={handleSort}>Name</SortBtn>
              <SortBtn col="date" current={sortKey} dir={sortDir} onClick={handleSort}>Date Modified</SortBtn>
              <SortBtn col="size" current={sortKey} dir={sortDir} onClick={handleSort}>Size</SortBtn>
              <SortBtn col="kind" current={sortKey} dir={sortDir} onClick={handleSort}>Format</SortBtn>
              <span />
            </div>

            {/* Table body */}
            {loading ? (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'160px',gap:'8px',color:'var(--text-tertiary)'}}>
                <svg style={{width:16,height:16,animation:'spin 1s linear infinite'}} fill="none" viewBox="0 0 24 24">
                  <circle style={{opacity:0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path style={{opacity:0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span style={{fontSize:'13px'}}>Loading…</span>
              </div>
            ) : error ? (
              <div style={{padding:'32px',textAlign:'center',color:'var(--red)',fontSize:'13px'}}>
                {error}
                <button onClick={fetchProjects} style={{display:'block',margin:'8px auto 0',color:'var(--accent)',background:'none',border:'none',cursor:'pointer',fontSize:'13px'}}>Try again</button>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'160px',color:'var(--text-tertiary)'}}>
                <svg style={{width:32,height:32,marginBottom:12,opacity:0.3}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2"/>
                </svg>
                <span style={{fontSize:'13px'}}>No files yet. Open the desktop app to start syncing.</span>
              </div>
            ) : filtered.map((p, i) => {
              const name = p.name || p.file_name || 'Untitled'
              const ext = getExt(p)
              const isEditing = editingId === p.id
              const isWav = ext === 'wav'
              const isMp3 = ext === 'mp3'

              return (
                <div key={p.id}
                  onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'file', project: p }) }}
                  className="group"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr 200px 100px 120px 80px',
                    padding: '0 16px',
                    height: '40px', alignItems: 'center',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'default',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Row number */}
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
                    color: 'var(--text-tertiary)', userSelect: 'none',
                  }}>{i + 1}</span>

                  {/* Name */}
                  <div style={{display:'flex',alignItems:'center',gap:'8px',minWidth:0,paddingRight:'16px'}}>
                    {isEditing ? (
                      <input ref={editRef} value={editingName} onChange={e => setEditingName(e.target.value)}
                        onBlur={() => handleRename(p.id)}
                        onKeyDown={e => { if (e.key==='Enter') handleRename(p.id); if (e.key==='Escape') setEditingId(null) }}
                        style={{
                          fontSize:'13px', padding:'2px 6px', borderRadius:'4px', minWidth:0, flex:1,
                          background:'var(--bg-input)', border:'1px solid var(--accent-line)',
                          color:'var(--text-primary)', outline:'none', fontFamily:'inherit',
                        }} />
                    ) : (
                      <span
                        onDoubleClick={() => !isRecentlyDeleted && startEdit(p)}
                        style={{
                          fontSize: '13px', fontWeight: 500,
                          color: isRecentlyDeleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          cursor: isRecentlyDeleted ? 'default' : 'text',
                        }}
                        title={name}
                      >
                        {name}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <span style={{
                    fontSize:'12px', fontFamily:'JetBrains Mono, monospace',
                    color:'var(--text-secondary)',
                  }}>{fmtDate(p.updated_at||p.created_at)}</span>

                  {/* Size */}
                  <span style={{
                    fontSize:'12px', fontFamily:'JetBrains Mono, monospace',
                    color:'var(--text-secondary)',
                  }}>{fmt(p.file_size)}</span>

                  {/* Format badge */}
                  <div>
                    {ext ? (
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 6px', borderRadius: '4px',
                        fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        fontFamily: 'JetBrains Mono, monospace',
                        background: isWav ? 'var(--accent-dim)' : 'var(--bg-hover)',
                        color: isWav ? 'var(--accent)' : 'var(--text-tertiary)',
                        border: isWav ? '1px solid var(--accent-line)' : '1px solid var(--border)',
                      }}>{ext}</span>
                    ) : (
                      <span style={{color:'var(--text-tertiary)',fontSize:'12px'}}>—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{display:'flex',alignItems:'center',gap:'2px',justifyContent:'flex-end'}}>
                    {isRecentlyDeleted ? (
                      <>
                        <IconBtn title="Restore" onClick={() => handleRestore(p.id)} color="var(--accent)">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:13,height:13}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                        </IconBtn>
                        <IconBtn title="Delete permanently" onClick={() => handlePermanentDelete(p.id)} disabled={deleting===p.id} color="var(--red)">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:13,height:13}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </IconBtn>
                      </>
                    ) : (
                      <>
                        {p.file_url && (
                          <IconBtn title="Share" onClick={() => { setShareProject(p); setShareTab('share') }} color="var(--accent)">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:13,height:13}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                          </IconBtn>
                        )}
                        {p.file_url && (
                          <a href={p.file_url} download>
                            <IconBtn title="Download" color="var(--accent)">
                              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:13,height:13}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </IconBtn>
                          </a>
                        )}
                        <IconBtn title="Move to Trash" onClick={() => handleDelete(p.id)} disabled={deleting===p.id} color="var(--red)">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:13,height:13}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </IconBtn>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
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
                <div style={{borderTop:'1px solid var(--border)',margin:'4px 0'}} />
                <CtxItem red onClick={() => handlePermanentDelete(contextMenu.project.id)}>Delete Permanently</CtxItem>
              </>
            ) : (
              <>
                <CtxItem onClick={() => startEdit(contextMenu.project)}>Rename</CtxItem>
                {contextMenu.project.file_url && <CtxItem onClick={() => { setShareProject(contextMenu.project); setShareTab('share'); setContextMenu(null) }}>Share</CtxItem>}
                {contextMenu.project.file_url && <a href={contextMenu.project.file_url} download onClick={() => setContextMenu(null)} style={{display:'block'}}><CtxItem>Download</CtxItem></a>}
                <div style={{borderTop:'1px solid var(--border)',margin:'4px 0'}} />
                <CtxItem red onClick={() => handleDelete(contextMenu.project.id)}>Move to Trash</CtxItem>
              </>
            )
          )}
          {contextMenu.type === 'sidebar' && (
            <>
              <CtxItem onClick={() => { setShowFolderInput(true); setContextMenu(null) }}>New Folder</CtxItem>
              {activeFolder !== 'All Files' && activeFolder !== 'Recently Deleted' && (
                <CtxItem red onClick={() => { setFolders(f => f.filter(x => x !== activeFolder)); setActiveFolder('All Files'); setContextMenu(null) }}>Delete Folder</CtxItem>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Share modal ── */}
      {shareProject && (
        <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)'}}
          onClick={() => setShareProject(null)}>
          <div style={{
            background:'var(--bg-card)', border:'1px solid var(--border-mid)',
            borderRadius:'20px', width:'100%', maxWidth:'440px', margin:'0 16px', overflow:'hidden',
          }} onClick={e => e.stopPropagation()}>
            {/* Tabs */}
            <div style={{display:'flex',borderBottom:'1px solid var(--border)'}}>
              {['share','embed','message'].map(t => (
                <button key={t} onClick={() => setShareTab(t)} style={{
                  flex:1, padding:'12px 0', fontSize:'13px', fontWeight:500,
                  textTransform:'capitalize', cursor:'pointer',
                  color: shareTab===t ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  borderBottom: shareTab===t ? '2px solid var(--accent)' : '2px solid transparent',
                  background:'transparent', transition:'color 0.12s',
                }}>
                  {t}
                </button>
              ))}
              <button onClick={() => setShareProject(null)} style={{
                padding:'0 16px', background:'transparent', color:'var(--text-tertiary)', cursor:'pointer',
              }}>
                <svg style={{width:16,height:16}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div style={{padding:'20px'}}>
              {/* Preview */}
              <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',borderRadius:'10px',background:'var(--bg-hover)',marginBottom:'16px'}}>
                <div style={{width:40,height:40,borderRadius:'8px',background:'var(--accent-dim)',border:'1px solid var(--accent-line)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg style={{width:20,height:20,color:'var(--accent)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2"/></svg>
                </div>
                <div style={{minWidth:0}}>
                  <p style={{fontSize:'13px',fontWeight:600,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{shareProject.name || shareProject.file_name}</p>
                  <p style={{fontSize:'12px',color:'var(--text-tertiary)'}}>{user?.name || 'SoundBridg'}</p>
                </div>
              </div>

              {shareTab === 'share' && (
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  <p style={{fontSize:'11px',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--text-tertiary)'}}>Share link</p>
                  <div style={{display:'flex',gap:'8px'}}>
                    <input readOnly value={shareUrl} style={{flex:1,padding:'8px 12px',fontSize:'12px',borderRadius:'6px',background:'var(--bg-input)',border:'1px solid var(--border-mid)',color:'var(--text-secondary)',outline:'none',fontFamily:'JetBrains Mono, monospace'}} />
                    <button onClick={() => navigator.clipboard.writeText(shareUrl)} style={{padding:'8px 14px',borderRadius:'6px',fontSize:'13px',fontWeight:600,background:'var(--accent)',color:'#0A0A0F',cursor:'pointer',flexShrink:0}}>
                      Copy
                    </button>
                  </div>
                </div>
              )}
              {shareTab === 'embed' && (
                <div>
                  <p style={{fontSize:'11px',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--text-tertiary)',marginBottom:'8px'}}>Embed code</p>
                  <textarea readOnly value={`<iframe src="${shareUrl}" width="100%" height="80" frameborder="0"></iframe>`}
                    style={{width:'100%',height:'80px',padding:'8px 12px',fontSize:'11px',borderRadius:'6px',background:'var(--bg-input)',border:'1px solid var(--border-mid)',color:'var(--text-secondary)',outline:'none',resize:'none',fontFamily:'JetBrains Mono, monospace'}} />
                  <button onClick={() => navigator.clipboard.writeText(`<iframe src="${shareUrl}" width="100%" height="80" frameborder="0"></iframe>`)}
                    style={{marginTop:'8px',width:'100%',padding:'8px',borderRadius:'6px',fontSize:'13px',fontWeight:600,background:'var(--accent)',color:'#0A0A0F',cursor:'pointer'}}>
                    Copy Embed
                  </button>
                </div>
              )}
              {shareTab === 'message' && (
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  <p style={{fontSize:'11px',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--text-tertiary)'}}>Send via message</p>
                  <input placeholder="Email or phone number" style={{width:'100%',padding:'8px 12px',fontSize:'13px',borderRadius:'6px',background:'var(--bg-input)',border:'1px solid var(--border-mid)',color:'var(--text-primary)',outline:'none',fontFamily:'inherit'}} />
                  <button style={{width:'100%',padding:'8px',borderRadius:'6px',fontSize:'13px',fontWeight:600,background:'var(--accent)',color:'#0A0A0F',cursor:'pointer'}}>Send</button>
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
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 12px', cursor: 'pointer',
      background: active ? 'var(--accent-dim)' : 'transparent',
      borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      fontSize: '13px', fontWeight: active ? 600 : 500,
      transition: 'all 0.12s',
    }}>
      <span style={{flexShrink:0,color: active ? 'var(--accent)' : 'var(--text-tertiary)'}}>{icon}</span>
      <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{children}</span>
      {badge > 0 && (
        <span style={{
          fontFamily:'JetBrains Mono, monospace', fontSize:'10px',
          color:'var(--text-tertiary)', background:'var(--bg-hover)',
          padding:'1px 5px', borderRadius:'999px',
        }}>{badge}</span>
      )}
    </button>
  )
}

function SortBtn({ children, col, current, dir, onClick }) {
  const active = current === col
  return (
    <button onClick={() => onClick(col)} style={{
      display:'flex', alignItems:'center', gap:'4px', cursor:'pointer',
      fontSize:'11px', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase',
      color: active ? 'var(--text-secondary)' : 'var(--text-tertiary)',
      background:'transparent',
    }}>
      {children}
      {active ? (
        dir === 'asc'
          ? <svg style={{width:10,height:10,color:'var(--accent)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          : <svg style={{width:10,height:10,color:'var(--accent)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      ) : (
        <svg style={{width:10,height:10,opacity:0.3}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
      )}
    </button>
  )
}

function IconBtn({ children, onClick, title, disabled, color }) {
  return (
    <button title={title} onClick={onClick} disabled={disabled} style={{
      width:'28px', height:'28px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center',
      background:'transparent', color:'var(--text-tertiary)', border:'none', cursor: disabled ? 'not-allowed' : 'pointer',
      transition:'all 0.12s', opacity: disabled ? 0.4 : 1,
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background='var(--bg-elevated)'; e.currentTarget.style.color=color } }}
      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-tertiary)' }}>
      {children}
    </button>
  )
}

function CtxItem({ children, onClick, red }) {
  return (
    <button onClick={onClick} style={{
      width:'100%', textAlign:'left', padding:'7px 14px', fontSize:'13px', cursor:'pointer',
      color: red ? 'var(--red)' : 'var(--text-secondary)',
      background:'transparent', transition:'background 0.12s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = red ? 'var(--red-dim)' : 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {children}
    </button>
  )
}
