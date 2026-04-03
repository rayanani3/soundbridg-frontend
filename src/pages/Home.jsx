const DMG_URL = 'https://pub-83f852d659c145459103180a6d018dc2.r2.dev/SoundBridg-2.0.0-arm64.dmg'

export default function Home({ setPage }) {
  return (
    <div className="min-h-[90vh]">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* Background blobs */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-25 pointer-events-none" style={{background:'radial-gradient(circle, #1b3a5c, transparent)'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-25 pointer-events-none" style={{background:'radial-gradient(circle, #c9a84c22, transparent)'}} />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-10 text-xs font-medium tracking-widest uppercase" style={{background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', color:'#c9a84c'}}>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
            FL Studio Cloud Sync
          </div>

          <h1 className="font-display font-extrabold leading-[1.08] mb-6 animate-slide-up" style={{fontSize:'clamp(2.5rem,6vw,4.5rem)'}}>
            Your projects.<br />
            <span style={{background:'linear-gradient(90deg, #c9a84c, #fde047)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
              Everywhere you work.
            </span>
          </h1>

          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10 animate-fade-in delay-100">
            SoundBridg syncs your FL Studio projects to the cloud so you can pick up exactly where you left off — on any Mac, any time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in delay-200">
            {/* Download button */}
            <a
              href={DMG_URL}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-brand-dark bg-brand-gold hover:brightness-110 transition-all gold-glow"
              download
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download for Mac
              <span className="text-xs font-normal opacity-70">Apple Silicon</span>
            </a>

            <button
              onClick={() => setPage('register')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium text-white/80 hover:text-white transition-colors"
              style={{border:'1px solid rgba(255,255,255,0.1)'}}
            >
              Create Free Account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-white/30 mt-4 animate-fade-in delay-300">
            macOS 12+ · Apple Silicon · Free beta
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-3">Built for producers who move.</h2>
            <p className="text-white/50">Everything you need to keep your sessions in sync.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="glass rounded-2xl p-5 animate-fade-in" style={{animationDelay:`${i * 0.1}s`, animationFillMode:'both'}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)'}}>
                  <f.icon />
                </div>
                <h3 className="font-display font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 border-t border-brand-ocean/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl mb-3">How it works</h2>
          <p className="text-white/50 mb-12">Three steps to never lose your session again.</p>

          <div className="flex flex-col gap-4 text-left">
            {steps.map((s, i) => (
              <div key={i} className="glass rounded-xl p-5 flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm text-brand-dark bg-brand-gold">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{s.title}</h4>
                  <p className="text-sm text-white/50">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center glass rounded-2xl p-10">
          <h2 className="font-display font-bold text-3xl mb-3">Ready to sync?</h2>
          <p className="text-white/50 mb-8">Download the app and create a free account to get started.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={DMG_URL}
              download
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-brand-dark bg-brand-gold hover:brightness-110 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download for Mac
            </a>
            <button
              onClick={() => setPage('register')}
              className="px-6 py-3 rounded-xl font-medium text-white/70 hover:text-white border border-brand-ocean/30 hover:border-brand-gold/30 transition-all"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function IconSync() {
  return <svg className="w-5 h-5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
}
function IconCloud() {
  return <svg className="w-5 h-5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
}
function IconGroup() {
  return <svg className="w-5 h-5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}
function IconAudio() {
  return <svg className="w-5 h-5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2" /></svg>
}

const features = [
  { icon: IconSync, title: 'Auto Sync', desc: 'Projects sync automatically whenever you save — no manual uploads needed.' },
  { icon: IconCloud, title: 'Cloud Storage', desc: 'Powered by Cloudflare R2. Fast, reliable, and always available.' },
  { icon: IconGroup, title: 'Sync Groups', desc: 'Create shared groups so collaborators always have the latest version.' },
  { icon: IconAudio, title: 'Audio Player', desc: 'Preview MP3 and WAV exports directly in your browser with waveform playback.' },
]

const steps = [
  { title: 'Download & Install', desc: 'Grab the Mac app (Apple Silicon), install it, and log into your SoundBridg account.' },
  { title: 'Point it at your FL Studio folder', desc: 'The app watches your projects directory and detects changes automatically.' },
  { title: 'Work anywhere', desc: 'Open the dashboard from any browser to see your latest projects, render exports, and play back audio.' },
]
