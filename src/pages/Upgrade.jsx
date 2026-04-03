export default function Upgrade({ setPage }) {
  const plans = [
    { name: 'Free', price: '$0', period: 'forever', storage: '10 GB', features: ['10 GB cloud storage', 'Auto-sync MP3 & WAV', 'Web dashboard', 'Audio player'], cta: 'Current Plan', current: true },
    { name: 'Pro', price: '$9', period: '/month', storage: '100 GB', features: ['100 GB cloud storage', 'Auto-sync all formats', 'Priority sync', 'Sync groups', 'Share links'], cta: 'Upgrade to Pro', current: false },
    { name: 'Unlimited', price: '$19', period: '/month', storage: 'Unlimited', features: ['Unlimited storage', 'All Pro features', 'Collaborative folders', 'Version history', 'Early access to new features'], cta: 'Go Unlimited', current: false },
  ]
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button onClick={() => setPage('dashboard')} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-4xl mb-3">Upgrade Storage</h1>
        <p className="text-white/50">More space for your mixes. Cancel anytime.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {plans.map(p => (
          <div key={p.name} className={`glass rounded-2xl p-6 flex flex-col ${!p.current ? 'border-brand-gold/30' : ''}`} style={!p.current ? {border:'1px solid rgba(201,168,76,0.3)'} : {}}>
            <div className="mb-4">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{p.name}</p>
              <div className="flex items-end gap-1">
                <span className="font-display font-bold text-3xl">{p.price}</span>
                <span className="text-white/40 text-sm mb-1">{p.period}</span>
              </div>
              <p className="text-sm text-brand-gold mt-1">{p.storage} storage</p>
            </div>
            <ul className="space-y-2 flex-1 mb-6">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <svg className="w-4 h-4 text-brand-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button disabled={p.current} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${p.current ? 'bg-brand-ocean/30 text-white/40 cursor-default' : 'bg-brand-gold text-brand-dark hover:brightness-110'}`}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
