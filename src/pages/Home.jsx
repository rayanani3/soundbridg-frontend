const DMG_URL = 'https://pub.soundbridg.com/SoundBridg.dmg'

export default function Home({ setPage }) {
  return (
    <div className="min-h-[90vh]" style={{ background: 'var(--bg)' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 px-4">
        {/* Ambient glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #1b3a5c, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full blur-[120px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #c9a84c33, transparent)' }} />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Logo mark + wordmark */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-[9px] flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #C9A84C 120%)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M9 18V6l12-2v12" stroke="#0A0A0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" stroke="#0A0A0F" strokeWidth="2" />
                <circle cx="18" cy="16" r="3" stroke="#0A0A0F" strokeWidth="2" />
              </svg>
            </div>
            <span className="font-sans font-bold text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Sound<span style={{ color: 'var(--accent)' }}>Bridg</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold leading-[1.1] mb-5"
            style={{ fontSize: 'clamp(2.4rem,5.5vw,4.2rem)', color: 'var(--text-primary)' }}>
            Your FL Studio,{' '}
            <span style={{
              background: 'linear-gradient(90deg, #c9a84c, #fde047)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              always in the cloud.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg leading-relaxed max-w-xl mx-auto mb-10"
            style={{ color: 'var(--text-secondary)' }}>
            SoundBridg watches your projects folder and syncs every bounce automatically —
            no clicks, no exports, no thinking.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            {/* Download */}
            <a href={DMG_URL} download
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all hover:brightness-110"
              style={{ background: 'var(--accent)', color: '#0A0A0F' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download for Mac
              <span className="text-xs font-normal opacity-60">Apple Silicon</span>
            </a>

            {/* Sign In */}
            <button onClick={() => setPage('login')}
              className="px-6 py-3.5 rounded-xl font-medium transition-all hover:text-white"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-mid)' }}>
              Sign In
            </button>

            {/* Get Started Free */}
            <button onClick={() => setPage('register')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all hover:text-white"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-mid)' }}>
              Get Started Free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted, rgba(255,255,255,0.3))' }}>
            macOS 12+ · Apple Silicon · Free beta
          </p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-3" style={{ color: 'var(--text-primary)' }}>
              Everything in one place
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Built for producers who don't want to think about file management.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="rounded-2xl p-6"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <f.Icon />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-xl mx-auto text-center rounded-2xl p-10"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="font-display font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
            Ready to sync?
          </h2>
          <p className="mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Download the app and create a free account to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={DMG_URL} download
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
              style={{ background: 'var(--accent)', color: '#0A0A0F' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download for Mac
            </a>
            <button onClick={() => setPage('register')}
              className="px-5 py-3 rounded-xl font-medium text-sm transition-all hover:text-white"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-mid)' }}>
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="px-4 py-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs"
          style={{ color: 'var(--text-muted, rgba(255,255,255,0.3))' }}>
          <span>Sound<span style={{ color: 'var(--accent)' }}>Bridg</span></span>
          <span>© 2026 SoundBridg · Built for FL Studio producers</span>
        </div>
      </footer>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────
function IconSync() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}
function IconCloud() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  )
}
function IconAudio() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2" />
    </svg>
  )
}

const FEATURES = [
  {
    Icon: IconSync,
    title: 'Auto-Sync',
    desc: 'Watches your projects folder 24/7. The moment you bounce a file, it\'s in the cloud — no clicks required.',
  },
  {
    Icon: IconCloud,
    title: 'Cloud Storage',
    desc: 'Your mixes live on Cloudflare R2 — fast global CDN, 10 GB free, always accessible from any browser.',
  },
  {
    Icon: IconAudio,
    title: 'Audio Player',
    desc: 'Stream any MP3 or WAV straight from your dashboard. Share a link with your collaborators in one click.',
  },
]
