import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Player() {
  const { getToken, BACKEND_URL } = useAuth()
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('sb_volume')
    return saved !== null ? parseFloat(saved) : 0.8
  })
  const [loadingTrack, setLoadingTrack] = useState(false)
  const audioRef = useRef(null)
  const progressRef = useRef(null)
  const volumeBarRef = useRef(null)
  const isDragging = useRef(false)
  const isVolumeDragging = useRef(false)

  // Fetch tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/tracks`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        })
        const data = await res.json()
        if (res.ok) {
          const audio = Array.isArray(data)
            ? data.filter(p => ['mp3', 'wav', 'flac', 'ogg', 'aiff', 'm4a'].includes(p.format?.toLowerCase()))
            : []
          setTracks(audio)
        }
      } catch {}
      setLoading(false)
    }
    fetchTracks()
  }, [])

  // Set initial volume on audio element
  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = volume
  }, [])

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const grabDuration = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      }
    }

    const onTime = () => {
      if (isDragging.current) return
      setProgress(audio.currentTime)
      // Fallback: grab duration from timeupdate if metadata events missed
      grabDuration()
    }
    const onEnd = () => { setPlaying(false); setProgress(0) }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', grabDuration)
    audio.addEventListener('durationchange', grabDuration)
    audio.addEventListener('canplay', grabDuration)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', grabDuration)
      audio.removeEventListener('durationchange', grabDuration)
      audio.removeEventListener('canplay', grabDuration)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  const playTrack = async (track) => {
    const audio = audioRef.current
    if (!audio) return

    if (current?.id === track.id) {
      if (playing) { audio.pause(); setPlaying(false) }
      else { audio.play().catch(() => {}); setPlaying(true) }
      return
    }

    audio.pause()
    audio.currentTime = 0
    setCurrent(track)
    setPlaying(false)
    setProgress(0)
    setDuration(0)
    setLoadingTrack(true)

    try {
      const res = await fetch(`${BACKEND_URL}/api/tracks/${track.id}/stream`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (!res.ok || !data.stream_url) throw new Error('No stream URL')
      audio.src = data.stream_url
      audio.volume = volume
      audio.preload = 'auto'
      audio.load()
      await audio.play()
      // Grab duration now that playback started
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      }
      setPlaying(true)
    } catch {
      setCurrent(null)
    }
    setLoadingTrack(false)
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play().catch(() => {}); setPlaying(true) }
  }

  // ── Progress scrub (click + drag) ──────────────────────────────────────────
  const scrubTo = useCallback((clientX) => {
    const bar = progressRef.current
    const audio = audioRef.current
    if (!bar || !audio) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    // Read duration directly from the DOM element — never from React state
    const dur = audio.duration
    if (!dur || !isFinite(dur) || dur <= 0) return
    audio.currentTime = ratio * dur
    setProgress(audio.currentTime)
  }, [])

  useEffect(() => {
    const onMove = (e) => { if (isDragging.current) scrubTo(e.clientX) }
    const onUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
    }

    const bar = progressRef.current
    if (!bar) return

    const onDown = (e) => {
      e.preventDefault()
      isDragging.current = true
      scrubTo(e.clientX)
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }

    bar.addEventListener('mousedown', onDown)
    return () => {
      bar.removeEventListener('mousedown', onDown)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [scrubTo])

  // ── Volume drag (click + drag) ─────────────────────────────────────────────
  const applyVolume = useCallback((clientX) => {
    const bar = volumeBarRef.current
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const val = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    setVolume(val)
    if (audioRef.current) audioRef.current.volume = val
    localStorage.setItem('sb_volume', String(val))
  }, [])

  useEffect(() => {
    const onMove = (e) => { if (isVolumeDragging.current) applyVolume(e.clientX) }
    const onUp = () => {
      if (isVolumeDragging.current) {
        isVolumeDragging.current = false
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
    }

    const bar = volumeBarRef.current
    if (!bar) return

    const onDown = (e) => {
      e.preventDefault()
      isVolumeDragging.current = true
      applyVolume(e.clientX)
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }

    bar.addEventListener('mousedown', onDown)
    return () => {
      bar.removeEventListener('mousedown', onDown)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [applyVolume])

  const fmtTime = (s) => {
    if (!s || !isFinite(s) || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Compute progress bar width safely
  const progressPct = (duration > 0 && isFinite(duration)) ? Math.min(100, (progress / duration) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Audio Player</h1>
        <p className="text-white/50 text-sm">Preview your synced and converted tracks.</p>
      </div>

      <audio ref={audioRef} preload="auto" />

      {/* Now playing */}
      {current && (
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.25)'}}>
              <svg className={`w-6 h-6 text-brand-gold ${playing ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{current.title || current.filename || 'Untitled'}</p>
              <p className="text-xs text-white/40">{loadingTrack ? 'Loading…' : playing ? 'Playing' : 'Paused'} · {current.format?.toUpperCase()}</p>
            </div>
          </div>

          {/* Progress bar — no transition so drag is instant */}
          <div className="mb-3">
            <div
              ref={progressRef}
              className="w-full h-2 rounded-full cursor-pointer overflow-hidden select-none"
              style={{background:'rgba(27,58,92,0.5)'}}
            >
              <div
                className="h-full rounded-full pointer-events-none"
                style={{width: `${progressPct}%`, background:'linear-gradient(90deg,#c9a84c,#fde047)'}}
              />
            </div>
            <div className="flex justify-between text-xs text-white/40 mt-1 select-none">
              <span>{fmtTime(progress)}</span>
              <span>{fmtTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={togglePlay} disabled={loadingTrack} className="w-12 h-12 rounded-full flex items-center justify-center bg-brand-gold text-brand-dark hover:brightness-110 transition-all disabled:opacity-50">
              {loadingTrack ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : playing ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 mt-4 select-none">
            <svg className="w-4 h-4 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072"/>
            </svg>
            <div
              ref={volumeBarRef}
              className="flex-1 h-2 rounded-full cursor-pointer"
              style={{background:`linear-gradient(to right, #c9a84c ${volume*100}%, rgba(27,58,92,0.5) ${volume*100}%)`}}
            />
          </div>
        </div>
      )}

      {/* Track list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-white/40">
          <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Loading tracks...
        </div>
      ) : tracks.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)'}}>
            <svg className="w-7 h-7 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2"/>
            </svg>
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">No audio files yet</h3>
          <p className="text-white/50 text-sm">Upload or sync MP3/WAV files and they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tracks.map((t) => (
            <button
              key={t.id}
              onClick={() => playTrack(t)}
              className={`w-full text-left glass rounded-xl p-4 flex items-center gap-3 transition-colors ${current?.id === t.id ? 'border-brand-gold/30' : 'hover:border-brand-gold/20'}`}
            >
              <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${current?.id === t.id ? 'bg-brand-gold' : 'bg-brand-ocean/30'}`}>
                {current?.id === t.id && (loadingTrack ? (
                  <svg className="w-4 h-4 text-brand-dark animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : playing ? (
                  <svg className="w-4 h-4 text-brand-dark" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                ) : (
                  <svg className="w-4 h-4 text-brand-dark" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                ))}
                {current?.id !== t.id && (
                  <svg className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{t.title || t.filename || 'Untitled'}</p>
                <p className="text-xs text-white/40 mt-0.5">{t.format?.toUpperCase()} · {t.size ? `${(t.size / (1024*1024)).toFixed(1)} MB` : '—'}</p>
              </div>
              {current?.id === t.id && (
                <span className="ml-auto text-xs text-brand-gold font-medium shrink-0">
                  {loadingTrack ? 'Loading…' : playing ? 'Now playing' : 'Paused'}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
