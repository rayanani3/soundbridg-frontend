import { useEffect, useRef, useState } from 'react'

/**
 * SoundCloud-style waveform.
 *  - Pre-computes peaks from the audio stream URL via AudioContext.decodeAudioData.
 *  - Draws a static bar chart on a canvas.
 *  - Fills the "played" portion in accent color, in sync with audio.currentTime.
 *  - requestAnimationFrame keeps the playhead smooth (no re-render per frame).
 *  - Click/drag to seek.
 *
 * Props:
 *   audio        – HTMLAudioElement (required, the same `new Audio()` the app already plays)
 *   src          – stream URL for decoding peaks (refetched with arraybuffer; cached in component state)
 *   token        – bearer token for Authorization header (optional)
 *   barCount     – number of bars (default 240)
 *   height       – canvas pixel height (default 88)
 *   onSeek       – optional callback(seconds) when user seeks (for external state sync)
 *   accent       – played fill color (default #c9a84c)
 *   unplayed     – unplayed fill color (default rgba(255,255,255,0.18))
 *   className    – extra tailwind classes for wrapper
 */
export default function Waveform({
  audio,
  src,
  token,
  barCount = 400,
  height = 88,
  onSeek,
  accent = '#c9a84c',
  accentGlow = '#fde047',
  unplayed = 'rgba(255,255,255,0.18)',
  className = '',
}) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const peaksRef = useRef(null)    // Float32Array of normalized peaks [0..1]
  const playheadRef = useRef(0)    // 0..1 progress
  const rafRef = useRef(0)
  const draggingRef = useRef(false)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  // ── Decode audio and extract peaks ────────────────────────────────────────
  useEffect(() => {
    if (!src) { setLoading(false); setFailed(false); peaksRef.current = null; return }
    let cancelled = false
    setLoading(true)
    setFailed(false)
    peaksRef.current = null
    playheadRef.current = 0

    const fetchWithRetry = async (url, attempts = 2) => {
      let lastErr
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await fetch(url, {
            mode: 'cors',
            credentials: 'omit',
            ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return await res.arrayBuffer()
        } catch (e) {
          lastErr = e
          if (i < attempts - 1) await new Promise(r => setTimeout(r, 400))
        }
      }
      throw lastErr
    }

    ;(async () => {
      try {
        const buf = await fetchWithRetry(src, 2)
        if (cancelled) return
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) throw new Error('no AudioContext')
        const ctx = new AudioCtx()
        // Safari wants a callback-style decodeAudioData; wrap in Promise
        const audioBuf = await new Promise((resolve, reject) => {
          try {
            const p = ctx.decodeAudioData(buf, resolve, reject)
            if (p && typeof p.then === 'function') p.then(resolve, reject)
          } catch (e) { reject(e) }
        })
        if (cancelled) return

        // Merge channels
        const channels = audioBuf.numberOfChannels
        const len = audioBuf.length
        const channelData = []
        for (let c = 0; c < channels; c++) channelData.push(audioBuf.getChannelData(c))

        // Use a finer internal resolution (~3x barCount) and then combine with
        // a max-of-rms to expose beats. RMS gives perceived loudness, max of
        // sub-blocks preserves the transient spikes of drums/beats.
        const resolution = Math.max(barCount, Math.min(1200, barCount * 3))
        const subBlock = Math.max(1, Math.floor(len / resolution))
        const sub = new Float32Array(resolution)
        for (let i = 0; i < resolution; i++) {
          const start = i * subBlock
          const end = Math.min(start + subBlock, len)
          let sumSq = 0
          let cnt = 0
          for (let j = start; j < end; j++) {
            let s = 0
            for (let c = 0; c < channels; c++) s += channelData[c][j]
            s /= channels
            sumSq += s * s
            cnt++
          }
          sub[i] = cnt > 0 ? Math.sqrt(sumSq / cnt) : 0
        }

        // Now collapse sub-array into barCount bars, taking max to keep transient spikes
        const peaks = new Float32Array(barCount)
        const group = sub.length / barCount
        for (let i = 0; i < barCount; i++) {
          const a = Math.floor(i * group)
          const b = Math.min(sub.length, Math.floor((i + 1) * group))
          let mx = 0
          for (let k = a; k < b; k++) if (sub[k] > mx) mx = sub[k]
          peaks[i] = mx
        }

        // Normalize to [0, 1] by the global max
        let maxPeak = 0
        for (let i = 0; i < barCount; i++) if (peaks[i] > maxPeak) maxPeak = peaks[i]
        if (maxPeak > 0) {
          const inv = 1 / maxPeak
          // Mild gamma (< 1) lifts quiet sections slightly so the waveform
          // reads as a continuous shape, while loud hits still tower above.
          for (let i = 0; i < barCount; i++) {
            peaks[i] = Math.pow(peaks[i] * inv, 0.8)
          }
        }

        peaksRef.current = peaks
        setLoading(false)
        draw()
        try { ctx.close() } catch {}
      } catch (e) {
        console.warn('[Waveform] decode failed:', e)
        if (!cancelled) { setFailed(true); setLoading(false); draw() }
      }
    })()

    return () => { cancelled = true }
  }, [src, token, barCount])

  // ── Draw ───────────────────────────────────────────────────────────────────
  const draw = () => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const dpr = window.devicePixelRatio || 1
    const cssW = wrap.clientWidth
    const cssH = height
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr
      canvas.height = cssH * dpr
      canvas.style.width = cssW + 'px'
      canvas.style.height = cssH + 'px'
    }
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssW, cssH)

    const peaks = peaksRef.current
    const n = peaks ? peaks.length : barCount
    const gap = 2
    const barW = Math.max(1.5, (cssW - gap * (n - 1)) / n)
    const mid = cssH / 2
    const playhead = playheadRef.current
    const playheadBar = Math.floor(playhead * n)

    for (let i = 0; i < n; i++) {
      const v = peaks ? peaks[i] : 0.12 + 0.08 * Math.abs(Math.sin(i * 0.35))
      // Minimum visible amplitude so empty silence still shows a tick
      const amp = Math.max(0.04, v) * (cssH * 0.44)
      const x = i * (barW + gap)
      const isPlayed = i <= playheadBar
      ctx.fillStyle = isPlayed ? accent : unplayed
      // Rounded bars
      const y = mid - amp
      const h = amp * 2
      const r = Math.min(barW / 2, 2)
      roundRect(ctx, x, y, barW, h, r)
      ctx.fill()
    }

    // Soft accent glow on the playhead bar
    if (peaks) {
      const x = playheadBar * (barW + gap)
      ctx.fillStyle = accentGlow
      ctx.globalAlpha = 0.9
      const v = peaks[playheadBar] ?? 0
      const amp = Math.max(0.06, v) * (cssH * 0.5)
      roundRect(ctx, x, mid - amp, Math.max(2, barW), amp * 2, Math.min(barW / 2, 2))
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  // ── RAF loop: track audio.currentTime → playhead ──────────────────────────
  useEffect(() => {
    let running = true
    const tick = () => {
      if (!running) return
      if (audio && audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        const p = Math.min(1, Math.max(0, audio.currentTime / audio.duration))
        if (Math.abs(p - playheadRef.current) > 0.0005) {
          playheadRef.current = p
          draw()
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, [audio])

  // ── Redraw on resize ──────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ── Seek on click / drag ──────────────────────────────────────────────────
  const seekFromClientX = (clientX) => {
    const wrap = wrapRef.current
    if (!wrap || !audio) return
    const rect = wrap.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const d = audio.duration
    if (!d || !isFinite(d) || d <= 0) return
    audio.currentTime = ratio * d
    playheadRef.current = ratio
    draw()
    if (onSeek) onSeek(audio.currentTime)
  }

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const onMove = (e) => { if (draggingRef.current) seekFromClientX(e.clientX) }
    const onUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
    }
    const onDown = (e) => {
      e.preventDefault()
      e.stopPropagation()
      draggingRef.current = true
      seekFromClientX(e.clientX)
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }
    wrap.addEventListener('mousedown', onDown)
    return () => {
      wrap.removeEventListener('mousedown', onDown)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [audio])

  return (
    <div
      ref={wrapRef}
      className={`relative w-full select-none cursor-pointer ${className}`}
      style={{ height: `${height}px` }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[11px] tracking-[0.12em] uppercase font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Analyzing waveform…
          </span>
        </div>
      )}
      {/* Failed state: we just render the soft decorative wave from draw(),
          no overlay text — keeps the player looking polished either way. */}
    </div>
  )
}

function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
