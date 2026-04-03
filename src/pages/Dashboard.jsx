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
  const [folders, setFolders] = useState(['All Files'])
  const [activeFolder, setActiveFolder] = useState('All Files')
  const [newFolderName, setNewFolderName] = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [shareProject, setShareProject] = useState(null)
  const [shareTab, setShareTab] = useState('share')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const editRef = useRef()

  useEffect(() => { fetchProjects() }, [])
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

  const handleDelete = async (id) => {
    setDeleting(id); setContextMenu(null)
    try {
      await fetch(`${BACKEND_URL}/api/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      setProjects(p => p.filter(x => x.id !== id))
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
    if (name.endsWith('.flp')) return 'FL Studio Project'
    if (name.endsWith('.mp3')) return 'MP3 audio'
    if (name.endsWith('.wav')) return 'Waveform audio'
    if (name.endsWith('.flac')) return 'FLAC audio'
    return 'File'
  }
  const getExt = (p) => (p.file_name || p.name || '').split('.').pop()?.toLowerCase() || ''

  const totalUsed = projects.reduce((a, p) => a + (p.file_size || 0), 0)
  const usedPct = Math.min((totalUsed / STORAGE_LIMIT) * 100, 100)

  const filtered = projects
    .filter(p => filterKind === 'all' || getExt(p) === filterKind)
    .sort((a, b) => {
      let va, vb
      if (sortKey === 'name') { va = (a.name||a.file_name||'').toLowerCase(); vb = (b.name||b.file_name||'').toLowerCase() }
      else if (sortKey === 'size') { va = a.file_size||0; vb = b.file_size||0 }
      else if (sortKey === 'kind') { va = getKind(a); vb = getKind(b) }
      else { va = new Date(a.updated_at||a.created_at); vb = new Date(b.updated_at||b.created_at) }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <svg className="w-3 h-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
    return sortDir === 'asc'
      ? <svg className="w-3 h-3 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
      : <svg className="w-3 h-3 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
  }

  const shareUrl = shareProject?.file_url || ''

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-48 shrink-0 border-r border-brand-ocean/20 flex flex-col" style={{background:'rgba(10,14,39,0.8)'}}>
        <div className="p-3 border-b border-brand-ocean/20 flex items-center justify-between">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Folders</span>
          <button onClick={() => setShowFolderInput(true)} className="w-5 h-5 rounded flex items-center justify-center text-white/40 hover:text-brand-gold hover:bg-brand-gold/10 transition-colors" title="Add folder">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5"
          onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'sidebar' }) }}>
          {folders.map(f => (
            <button key={f} onClick={() => setActiveFolder(f)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${activeFolder === f ? 'bg-brand-gold/15 text-brand-gold' : 'text-white/60 hover:text-white hover:bg-brand-ocean/20'}`}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
              <span className="truncate">{f}</span>
            </button>
          ))}

          {showFolderInput && (
            <div className="px-2 py-1">
              <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newFolderName.trim()) { setFolders(f => [...f, newFolderName.trim()]); setNewFolderName(''); setShowFolderInput(false) }
                  if (e.key === 'Escape') { setShowFolderInput(false); setNewFolderName('') }
                }}
                onBlur={() => { setShowFolderInput(false); setNewFolderName('') }}
                placeholder="Folder name" className="w-full px-2 py-1 text-xs rounded bg-brand-ocean/30 border border-brand-gold/30 text-white outline-none" />
            </div>
          )}
        </div>

        {/* Storage bar */}
        <div className="p-3 border-t border-brand-ocean/20">
          <button onClick={() => setPage('upgrade')} className="w-full text-left group">
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>Storage</span>
              <span className="group-hover:text-brand-gold transition-colors">{fmt(totalUsed)} / 10 GB</span>
            </div>
            <div className="w-full h-1 rounded-full bg-brand-ocean/40 overflow-hidden">
              <div className="h-full rounded-full bg-brand-gold transition-all" style={{width:`${usedPct}%`}} />
            </div>
            <p className="text-xs text-white/25 mt-1.5 group-hover:text-brand-gold/60 transition-colors">Upgrade storage →</p>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-brand-ocean/20 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-semibold text-lg">Your projects</h1>
            <span className="text-xs text-white/40">{filtered.length} files</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Kind filter tabs */}
            {['all','mp3','wav','flp'].map(k => (
              <button key={k} onClick={() => setFilterKind(k)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterKind===k ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30' : 'text-white/40 hover:text-white border border-transparent'}`}>
                {k === 'all' ? 'All' : k.toUpperCase()}
              </button>
            ))}
            <button onClick={fetchProjects} className="ml-1 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-brand-ocean/20 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="flex items-center px-5 py-2 border-b border-brand-ocean/15 text-xs font-medium text-white/35 shrink-0" style={{background:'rgba(27,58,92,0.1)'}}>
          <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-white transition-colors" style={{width:'40%'}}>
            NAME <SortIcon col="name" />
          </button>
          <button onClick={() => handleSort('date')} className="flex items-center gap-1 hover:text-white transition-colors" style={{width:'25%'}}>
            DATE MODIFIED <SortIcon col="date" />
          </button>
          <button onClick={() => handleSort('size')} className="flex items-center gap-1 hover:text-white transition-colors" style={{width:'15%'}}>
            SIZE <SortIcon col="size" />
          </button>
          <button onClick={() => handleSort('kind')} className="flex items-center gap-1 hover:text-white transition-colors" style={{width:'20%'}}>
            KIND <SortIcon col="kind" />
          </button>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40 gap-2 text-white/40">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Loading...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-sm">{error}<button onClick={fetchProjects} className="block mx-auto mt-2 text-brand-gold hover:underline">Try again</button></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-white/30 text-sm">
              <svg className="w-8 h-8 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2"/></svg>
              No files yet. Open the desktop app to start syncing.
            </div>
          ) : (
            filtered.map((p, i) => {
              const name = p.name || p.file_name || 'Untitled'
              const ext = getExt(p)
              const isEditing = editingId === p.id
              return (
                <div key={p.id}
                  onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'file', project: p }) }}
                  className={`flex items-center px-5 py-2.5 border-b border-brand-ocean/10 hover:bg-brand-ocean/10 transition-colors group cursor-default ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  {/* Name */}
                  <div className="flex items-center gap-2.5 min-w-0" style={{width:'40%'}}>
                    <div className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold ${ext==='mp3'?'bg-blue-400/15 text-blue-400':ext==='wav'?'bg-green-400/15 text-green-400':ext==='flp'?'bg-brand-gold/15 text-brand-gold':'bg-white/10 text-white/40'}`}>
                      {ext.toUpperCase().slice(0,3)||'?'}
                    </div>
                    {isEditing ? (
                      <input ref={editRef} value={editingName} onChange={e => setEditingName(e.target.value)}
                        onBlur={() => handleRename(p.id)}
                        onKeyDown={e => { if (e.key==='Enter') handleRename(p.id); if (e.key==='Escape') setEditingId(null) }}
                        className="text-sm bg-brand-ocean/40 border border-brand-gold/40 rounded px-1.5 py-0.5 text-white outline-none min-w-0 flex-1" />
                    ) : (
                      <span onDoubleClick={() => startEdit(p)} className="text-sm text-white truncate cursor-text" title={name}>{name}</span>
                    )}
                  </div>
                  {/* Date */}
                  <div className="text-xs text-white/40 tabular-nums" style={{width:'25%'}}>{fmtDate(p.updated_at||p.created_at)}</div>
                  {/* Size */}
                  <div className="text-xs text-white/40 tabular-nums" style={{width:'15%'}}>{fmt(p.file_size)}</div>
                  {/* Kind + actions */}
                  <div className="flex items-center justify-between" style={{width:'20%'}}>
                    <span className="text-xs text-white/40">{getKind(p)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {p.file_url && (
                        <button onClick={() => { setShareProject(p); setShareTab('share') }}
                          className="p-1 rounded text-white/40 hover:text-brand-gold transition-colors" title="Share">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                      )}
                      {p.file_url && (
                        <a href={p.file_url} download className="p-1 rounded text-white/40 hover:text-brand-gold transition-colors" title="Download">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                      )}
                      <button onClick={() => handleDelete(p.id)} disabled={deleting===p.id}
                        className="p-1 rounded text-white/40 hover:text-red-400 transition-colors" title="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div className="fixed z-50 glass rounded-xl py-1 min-w-[160px] shadow-2xl" style={{left:contextMenu.x, top:contextMenu.y}}>
          {contextMenu.type === 'file' && contextMenu.project && (
            <>
              <CtxItem onClick={() => startEdit(contextMenu.project)}>Rename</CtxItem>
              {contextMenu.project.file_url && <CtxItem onClick={() => { setShareProject(contextMenu.project); setShareTab('share'); setContextMenu(null) }}>Share</CtxItem>}
              {contextMenu.project.file_url && <a href={contextMenu.project.file_url} download onClick={() => setContextMenu(null)}><CtxItem>Download</CtxItem></a>}
              <div className="border-t border-brand-ocean/20 my-1" />
              <CtxItem red onClick={() => handleDelete(contextMenu.project.id)}>Delete</CtxItem>
            </>
          )}
          {contextMenu.type === 'sidebar' && (
            <>
              <CtxItem onClick={() => { setShowFolderInput(true); setContextMenu(null) }}>New Folder</CtxItem>
              {activeFolder !== 'All Files' && <CtxItem red onClick={() => { setFolders(f => f.filter(x => x !== activeFolder)); setActiveFolder('All Files'); setContextMenu(null) }}>Delete Folder</CtxItem>}
            </>
          )}
        </div>
      )}

      {/* Share modal */}
      {shareProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShareProject(null)}>
          <div className="glass rounded-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Tabs */}
            <div className="flex border-b border-brand-ocean/20">
              {['share','embed','message'].map(t => (
                <button key={t} onClick={() => setShareTab(t)}
                  className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${shareTab===t ? 'text-white border-b-2 border-brand-gold' : 'text-white/40 hover:text-white'}`}>
                  {t}
                </button>
              ))}
              <button onClick={() => setShareProject(null)} className="px-4 text-white/40 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5">
              {/* Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-ocean/20 mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-gold/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2"/></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{shareProject.name || shareProject.file_name}</p>
                  <p className="text-xs text-white/40">{user?.name || 'SoundBridg'}</p>
                </div>
              </div>

              {shareTab === 'share' && (
                <div className="space-y-3">
                  <p className="text-xs text-white/40 mb-2">Share link</p>
                  <div className="flex gap-2">
                    <input readOnly value={shareUrl} className="flex-1 px-3 py-2 text-xs rounded-lg bg-brand-ocean/20 border border-brand-ocean/30 text-white/70 outline-none" />
                    <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="px-3 py-2 rounded-lg text-xs font-medium bg-brand-gold text-brand-dark hover:brightness-110 transition-all">Copy</button>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {[
                      { label: 'Twitter', color: '#1DA1F2', icon: '𝕏' },
                      { label: 'iMessage', color: '#34C759', icon: '💬' },
                      { label: 'Email', color: '#6B7280', icon: '✉' },
                    ].map(s => (
                      <button key={s.label} className="flex-1 py-2 rounded-lg text-xs font-medium text-white transition-all hover:brightness-110" style={{background:s.color+'33', border:`1px solid ${s.color}44`}}>
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {shareTab === 'embed' && (
                <div>
                  <p className="text-xs text-white/40 mb-2">Embed code</p>
                  <textarea readOnly value={`<iframe src="${shareUrl}" width="100%" height="80" frameborder="0"></iframe>`}
                    className="w-full h-20 px-3 py-2 text-xs rounded-lg bg-brand-ocean/20 border border-brand-ocean/30 text-white/60 outline-none resize-none font-mono" />
                  <button onClick={() => navigator.clipboard.writeText(`<iframe src="${shareUrl}" width="100%" height="80" frameborder="0"></iframe>`)}
                    className="mt-2 w-full py-2 rounded-lg text-xs font-medium bg-brand-gold text-brand-dark hover:brightness-110 transition-all">Copy Embed</button>
                </div>
              )}
              {shareTab === 'message' && (
                <div className="space-y-3">
                  <p className="text-xs text-white/40 mb-2">Send via message</p>
                  <input placeholder="Email or phone number" className="w-full px-3 py-2 text-xs rounded-lg bg-brand-ocean/20 border border-brand-ocean/30 text-white outline-none placeholder:text-white/25" />
                  <button className="w-full py-2 rounded-lg text-xs font-medium bg-brand-gold text-brand-dark hover:brightness-110 transition-all">Send</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CtxItem({ children, onClick, red }) {
  return (
    <button onClick={onClick} className={`w-full text-left px-4 py-2 text-sm transition-colors ${red ? 'text-red-400 hover:bg-red-400/10' : 'text-white/80 hover:bg-brand-ocean/30 hover:text-white'}`}>
      {children}
    </button>
  )
}
