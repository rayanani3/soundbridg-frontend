import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Player() {
  const { getToken, BACKEND_URL } = useAuth()
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const audioRef = useRef(null)

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        })
        const data = await res.json()
        if (res.ok) {
          const audio = (data.projects || []).filter(p =>
            p.file_url && (p.file_url.endsWith('.mp3') || p.file_url.endsWith('.wav') || p.name?.match(/\.(mp3|wav)$/i))
          )
          setTracks(audio)
        }
      } catch {}
      setLoading(false)
    }
    fetchTracks()
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setProgress(audio.currentTime)
    const onDuration = () => setDuration(audio.duration)
    const onEnd = () => { setPlaying(false); setProgress(0) }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onDuration)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onDuration)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  const playTrack = (track) => {
    const audio = audioRef.current
    if (!audio) return
    if (current?.id === track.id) {
      if (playing) { audio.pause(); setPlaying(false) }
      else { audio.play(); setPlaying(true) }
      return
    }
    setCurrent(track)
    setProgress(0)
    audio.src = track.file_url
    audio.volume = volume
    audio.play().then(() => setPlaying(true)).catch(() => {})
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  const seek = (e) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
  }

  const fmtTime = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Audio Player</h1>
        <p className="text-white/50 text-sm">Preview your converted exports.</p>
      </div>

      <audio ref={audioRef} />

      {/* Now playing */}
      {current && (
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.25)'}}>
              <svg className={`w-6 h-6 text-brand-gold ${playing ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2"/></svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{current.name || current.file_name}</p>
              <p className="text-xs text-white/40">{playing ? 'Playing' : 'Paused'}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div
              className="w-full h-1.5 rounded-full cursor-pointer overflow-hidden"
              style={{background:'rgba(27,58,92,0.5)'}}
              onClick={seek}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{width: duration ? `${(progress/duration)*100}%` : '0%', background:'linear-gradient(90deg,#c9a84c,#fde047)'}}
              />
            </div>
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>{fmtTime(progress)}</span>
              <span>{fmtTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={togglePlay} className="w-12 h-12 rounded-full flex items-center justify-center bg-brand-gold text-brand-dark hover:brightness-110 transition-all">
              {playing ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 mt-4">
            <svg className="w-4 h-4 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072"/></svg>
            <input
              type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v }}
              className="flex-1 h-1 rounded-full accent-brand-gold appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-gold"
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
            <svg className="w-7 h-7 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2"/></svg>
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">No audio files yet</h3>
          <p className="text-white/50 text-sm">Convert a project to MP3 or WAV and it'll show up here.</p>
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
                {current?.id === t.id && playing ? (
                  <svg className="w-4 h-4 text-brand-dark" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                ) : (
                  <svg className={`w-4 h-4 ${current?.id === t.id ? 'text-brand-dark' : 'text-brand-gold'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{t.name || t.file_name}</p>
                <p className="text-xs text-white/40 mt-0.5">{t.file_url?.split('.').pop()?.toUpperCase()}</p>
              </div>
              {current?.id === t.id && (
                <span className="ml-auto text-xs text-brand-gold font-medium">{playing ? 'Now playing' : 'Paused'}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
