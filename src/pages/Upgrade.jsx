export default function Upgrade({ setPage }) {
  const plans = [
    {
      name: 'Free', price: '$0', period: 'forever', storage: '10 GB',
      features: ['10 GB cloud storage', 'Auto-sync MP3 & WAV', 'Web dashboard', 'Audio player'],
      cta: 'Current Plan', current: true,
    },
    {
      name: 'Pro', price: '$9', period: '/month', storage: '100 GB',
      features: ['100 GB cloud storage', 'Auto-sync all formats', 'Priority sync', 'Sync groups', 'Share links'],
      cta: 'Upgrade to Pro', current: false,
    },
    {
      name: 'Unlimited', price: '$19', period: '/month', storage: 'Unlimited',
      features: ['Unlimited storage', 'All Pro features', 'Collaborative folders', 'Version history', 'Early access to new features'],
      cta: 'Go Unlimited', current: false,
    },
  ]

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',padding:'48px 32px'}}>
      <button onClick={() => setPage('dashboard')} style={{
        display:'flex',alignItems:'center',gap:'6px',
        fontSize:'13px',color:'var(--text-tertiary)',
        background:'none',border:'none',cursor:'pointer',marginBottom:'32px',
        transition:'color 0.12s',
      }}
        onMouseEnter={e => e.currentTarget.style.color='var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color='var(--text-tertiary)'}>
        <svg style={{width:14,height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      <div style={{textAlign:'center',marginBottom:'48px'}}>
        <h1 style={{fontSize:'20px',fontWeight:700,letterSpacing:'-0.4px',color:'var(--text-primary)',margin:'0 0 8px'}}>
          Upgrade Storage
        </h1>
        <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0}}>More space for your mixes. Cancel anytime.</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
        {plans.map(p => (
          <div key={p.name} style={{
            background:'var(--bg-card)',
            border: p.current ? '1px solid var(--border)' : '1px solid var(--accent-line)',
            borderRadius:'14px',padding:'24px',
            display:'flex',flexDirection:'column',
            position:'relative',
          }}>
            {!p.current && (
              <div style={{position:'absolute',top:-1,left:'50%',transform:'translateX(-50%) translateY(-50%)',
                background:'var(--accent)',borderRadius:'999px',padding:'3px 12px',
                fontSize:'10px',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',color:'#0A0A0F',
                whiteSpace:'nowrap',
              }}>
                {p.name === 'Pro' ? 'Most popular' : 'Best value'}
              </div>
            )}

            <div style={{marginBottom:'20px'}}>
              <p style={{
                fontSize:'11px',fontWeight:600,letterSpacing:'0.08em',
                textTransform:'uppercase',color:'var(--text-tertiary)',margin:'0 0 8px',
              }}>{p.name}</p>
              <div style={{display:'flex',alignItems:'flex-end',gap:'4px',marginBottom:'4px'}}>
                <span style={{fontSize:'26px',fontWeight:700,letterSpacing:'-1px',color:'var(--text-primary)',fontVariantNumeric:'tabular-nums'}}>{p.price}</span>
                <span style={{fontSize:'13px',color:'var(--text-tertiary)',marginBottom:'4px'}}>{p.period}</span>
              </div>
              <p style={{fontSize:'13px',color:'var(--accent)',margin:0}}>{p.storage} storage</p>
            </div>

            <ul style={{display:'flex',flexDirection:'column',gap:'8px',flex:1,marginBottom:'20px',listStyle:'none',padding:0}}>
              {p.features.map(f => (
                <li key={f} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:'var(--text-secondary)'}}>
                  <svg style={{width:14,height:14,color:'var(--accent)',flexShrink:0}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <button disabled={p.current} style={{
              width:'100%',padding:'8px',borderRadius:'6px',
              fontSize:'13px',fontWeight:600,cursor:p.current?'default':'pointer',
              background: p.current ? 'var(--bg-hover)' : 'var(--accent)',
              color: p.current ? 'var(--text-tertiary)' : '#0A0A0F',
              border:'none',transition:'filter 0.12s',
            }}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
