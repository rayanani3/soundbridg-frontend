import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function SyncGroups() {
  const { getToken, BACKEND_URL } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/sync-groups`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
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
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/api/sync-groups/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setGroups(g => g.filter(x => x.id !== id))
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1">Sync Groups</h1>
          <p className="text-white/50 text-sm">Share project folders with collaborators.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-brand-dark bg-brand-gold hover:brightness-110 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          New Group
        </button>
      </div>

      {showCreate && (
        <div className="glass rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-3">Create Sync Group</h3>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Group name..."
              className="flex-1 px-3 py-2 rounded-lg bg-brand-ocean/20 border border-brand-ocean/30 focus:border-brand-gold/50 focus:outline-none text-white placeholder:text-white/25 text-sm"
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-brand-dark bg-brand-gold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {creating ? '...' : 'Create'}
            </button>
          </form>
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/40">
          <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Loading groups...
        </div>
      ) : groups.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)'}}>
            <svg className="w-7 h-7 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">No groups yet</h3>
          <p className="text-white/50 text-sm">Create a sync group to collaborate with other producers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(g => (
            <div key={g.id} className="glass rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background:'rgba(201,168,76,0.1)'}}>
                  <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <p className="font-medium">{g.name}</p>
                  {g.invite_code && (
                    <p className="text-xs text-white/40 font-mono mt-0.5">Code: {g.invite_code}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(g.id)}
                className="text-xs text-white/40 hover:text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
