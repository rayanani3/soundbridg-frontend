import { useEffect, useRef, useState } from 'react'
import Waveform from '../components/Waveform'

const BACKEND_URL = 'https://soundbridg-backend.onrender.com'

/**
 * Public page rendered when someone opens https://soundbridg.com/shared/:token.
 * Fetches track metadata from the backend's public `/api/shared/:token`
 * endpoint and plays the audio. No login required.
 */
export default function SharedTrack({ token }) {
  const [track, setTrack] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetch(`${BACKEND_URL}/api/shared/${encodeURIComponent(token)}`)
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (cancelled) return
        if (!ok) throw new Error(d.error || 'Track not found')
        setTrack(d)
      })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  useEffect(() => {
    if (!track?.stream_url) return
    const a = new Audio()
    a.preload = 'auto'
    a.src = track.stream_url
    audioRef.current = a
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => setProgress(a.currentTime)
    const onDur = () => { if (isFinite(a.duration) && a.duration > 0) setDuration(a.duration) }
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onDur)
    a.addEventListener('durationchange', onDur)
    return () => {
      a.pause()
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onDur)
      a.removeEventListener('durationchange', onDur)
    }
  }, [track?.stream_url])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }

  const fmtTime = (s) => {
    if (!s || !isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const ss = Math.floor(s - m * 60)
    return `${m}:${ss.toString().padStart(2, '0')}`
  }

  const title = track?.title || track?.filename || 'Shared track'
  const letter = (title[0] || 'S').toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{
          width: '100%', maxWidth: 720, padding: 32, borderRadius: 20,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          boxShadow: '0 32px 96px rgba(0,0,0,0.5)',
        }}>
          {loading && <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>Loading shared track…</p>}
          {error && <p style={{ textAlign: 'center', color: 'var(--red)', fontSize: 13 }}>{error}</p>}
          {track && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 96, height: 96, borderRadius: 16, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 44, fontWeight: 800, color: 'rgba(255,255,255,0.95)',
                  background: 'linear-gradient(135deg,#1B3A5C 0%,#C9A84C 120%)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}>{letter}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>
                    Shared on SoundBridg
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {(track.format || '').toUpperCase()}
                    {track.bpm ? ` · ${track.bpm} BPM` : ''}
                  </div>
                </div>
              </div>

              {track.stream_url && (
                <Waveform audio={audioRef.current} src={track.stream_url} height={96} barCount={400} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>
                <span>{fmtTime(progress)}</span>
                <span>{fmtTime(duration)}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={toggle} style={{
                  width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'var(--accent)', color: '#0A0A0F',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {playing
                    ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    : <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
                </button>
                {track.download_url && (
                  <a href={track.download_url} download style={{
                    padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    border: '1px solid var(--border-mid)', color: 'var(--text-secondary)', textDecoration: 'none',
                  }}>Download</a>
                )}
                <a href="/" style={{
                  marginLeft: 'auto', fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600,
                }}>Get SoundBridg →</a>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Sound<span style={{ color: 'var(--accent)' }}>Bridg</span> · Built for producers
      </footer>
    </div>
  )
}
