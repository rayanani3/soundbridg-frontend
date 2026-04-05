import { useState } from 'react'

const DMG_URL = 'https://pub-83f852d659c145459103180a6d018dc2.r2.dev/SoundBridg-2.0.0-arm64.dmg'

const G = {
  green: '#1DB954',
  black: '#000',
  base: '#121212',
  elevated: '#181818',
  highlight: '#282828',
  sub: '#B3B3B3',
  white: '#FFF',
}

const grads = {
  g1: 'linear-gradient(135deg,#1a3a2a,#0d1f14)',
  g2: 'linear-gradient(135deg,#2a1a3a,#140d1f)',
  g3: 'linear-gradient(135deg,#3a1a1a,#1f0d0d)',
  g4: 'linear-gradient(135deg,#1a2a3a,#0d141f)',
  g5: 'linear-gradient(135deg,#2a3a1a,#141f0d)',
  g6: 'linear-gradient(135deg,#1db954,#0d6630)',
}

const LIBRARY = [
  { g: 'g1', emoji: '🎹', name: 'Midnight Sessions', meta: 'Project · 12 tracks' },
  { g: 'g2', emoji: '🎸', name: 'Summer EP', meta: 'Project · 8 tracks' },
  { g: 'g3', emoji: '🥁', name: 'Drum Loops Vol.3', meta: 'Project · 24 tracks' },
  { g: 'g4', emoji: '🎺', name: 'Collab w/ Adam', meta: 'Project · 6 tracks' },
  { g: 'g5', emoji: '🎻', name: 'Orchestral Sketches', meta: 'Project · 18 tracks' },
]

const QUICK = [
  { g: 'g1', emoji: '🎹', name: 'Midnight Sessions' },
  { g: 'g2', emoji: '🎸', name: 'Summer EP' },
  { g: 'g3', emoji: '🥁', name: 'Drum Loops Vol.3' },
  { g: 'g4', emoji: '🎺', name: 'Collab w/ Adam' },
  { g: 'g5', emoji: '🎻', name: 'Orchestral Sketches' },
  { g: 'g6', emoji: '☁️', name: 'Recently Synced' },
]

const TRACKS = [
  { num: 1, g: 'g1', emoji: '🎹', name: 'Fade Into You', artist: 'Rayan Ani', project: 'Midnight Sessions', fmt: 'wav', live: true, dur: '3:42' },
  { num: 2, g: 'g2', emoji: '🎸', name: 'Golden Hour', artist: 'Rayan Ani', project: 'Summer EP', fmt: 'mp3', sync: '2 min ago', dur: '4:11' },
  { num: 3, g: 'g3', emoji: '🥁', name: '808 Pattern #7', artist: 'Rayan Ani', project: 'Drum Loops Vol.3', fmt: 'wav', sync: '18 min ago', dur: '1:28' },
  { num: 4, g: 'g4', emoji: '🎺', name: 'Brass Hook', artist: 'Rayan Ani, Adam Ani', project: 'Collab w/ Adam', fmt: 'wav', sync: '1 hr ago', dur: '2:55' },
  { num: 5, g: 'g5', emoji: '🎻', name: 'String Swell v2', artist: 'Rayan Ani', project: 'Orchestral Sketches', fmt: 'mp3', sync: 'Yesterday', dur: '5:03' },
]

const CARDS = [
  { g: 'g1', emoji: '🎹', name: 'Midnight Sessions', desc: '12 tracks · 847 MB · Last synced 2 min ago' },
  { g: 'g2', emoji: '🎸', name: 'Summer EP', desc: '8 tracks · 412 MB · Last synced 18 min ago' },
  { g: 'g3', emoji: '🥁', name: 'Drum Loops Vol.3', desc: '24 tracks · 1.2 GB · Last synced 1 hr ago' },
  { g: 'g4', emoji: '🎺', name: 'Collab w/ Adam', desc: '6 tracks · 298 MB · Last synced yesterday' },
  { g: 'g5', emoji: '🎻', name: 'Orchestral Sketches', desc: '18 tracks · 2.1 GB · Last synced 3 days ago' },
]

export default function Home({ setPage }) {
  const [libChip, setLibChip] = useState('Projects')
  const [playing, setPlaying] = useState(false)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
      gridTemplateRows: '1fr 90px',
      height: 'calc(100vh - 52px)',
      gap: '8px',
      padding: '8px',
      background: G.black,
    }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        gridRow: '1/2',
        background: G.base,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Top nav */}
        <div style={{ padding: '24px 16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 24px' }}>
            <div style={{
              width: 32, height: 32, background: G.green, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={G.black}>
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', color: G.white }}>SoundBridg</span>
          </div>

          <nav>
            <SNavItem active icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            }>Home</SNavItem>
            <SNavItem icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
            }>Search</SNavItem>
          </nav>
        </div>

        {/* Library */}
        <div style={{
          flex: 1, background: G.elevated, borderRadius: '8px',
          margin: '8px', padding: '8px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: G.sub, fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
              </svg>
              Your Library
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', padding: '0 8px 12px', flexWrap: 'wrap' }}>
            {['Projects', 'WAV', 'MP3'].map(c => (
              <button key={c} onClick={() => setLibChip(c)} style={{
                background: libChip === c ? G.white : G.highlight,
                color: libChip === c ? G.black : G.white,
                border: 'none', borderRadius: '500px', padding: '6px 12px',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.1s',
              }}>{c}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {LIBRARY.map((p, i) => (
              <LibItem key={i} {...p} grads={grads} />
            ))}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{
        background: G.elevated, borderRadius: '8px',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <NavArrow>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
            </NavArrow>
            <NavArrow>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            </NavArrow>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setPage('login')} style={{
              background: 'rgba(0,0,0,0.7)', color: G.white, border: 'none',
              borderRadius: '500px', padding: '8px 20px', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.1s',
            }}>Log in</button>
            <button onClick={() => setPage('register')} style={{
              background: G.white, color: G.black, border: 'none',
              borderRadius: '500px', padding: '8px 20px', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.1s',
            }}>Sign Up Free</button>
          </div>
        </div>

        {/* Scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>

          {/* Hero gradient */}
          <div style={{
            background: 'linear-gradient(180deg,#1a3a1f 0%,#181818 100%)',
            padding: '32px 24px 24px', margin: '0 -24px',
          }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px', letterSpacing: '-1px', color: G.white }}>
              Good evening
            </h1>

            {/* Quick grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
              {QUICK.map((q, i) => (
                <QuickItem key={i} {...q} grads={grads} />
              ))}
            </div>
          </div>

          {/* Recently synced */}
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', color: G.white }}>Recently synced</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: G.sub, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}>Show all</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Title', 'Project', 'Format', 'Sync', 'Duration'].map((h, i) => (
                    <th key={i} style={{
                      textAlign: i === 5 ? 'right' : 'left',
                      fontSize: '11px', fontWeight: 400, color: G.sub,
                      textTransform: 'uppercase', letterSpacing: '1px',
                      padding: '8px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRACKS.map((t, i) => (
                  <TrackRow key={i} {...t} grads={grads} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Your projects */}
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', color: G.white }}>Your projects</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: G.sub, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}>Show all</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '16px' }}>
              {CARDS.map((c, i) => (
                <ProjectCard key={i} {...c} grads={grads} />
              ))}
            </div>
          </div>

          {/* Storage */}
          <div style={{
            background: G.elevated, borderRadius: '8px', padding: '16px',
            marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: G.sub, marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Storage</div>
              <div style={{ height: '4px', background: G.highlight, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: G.green, borderRadius: '2px', width: '34%' }} />
              </div>
              <div style={{ fontSize: '13px', color: G.sub, marginTop: '6px' }}>
                <strong style={{ color: G.white }}>3.4 GB</strong> of 10 GB used
              </div>
            </div>
            <button onClick={() => setPage('upgrade')} style={{
              background: G.white, color: G.black, border: 'none', borderRadius: '500px',
              padding: '10px 20px', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              transition: 'transform 0.1s',
            }}>Upgrade Plan</button>
          </div>

          {/* CTA */}
          <div style={{
            marginTop: '32px', padding: '32px',
            background: 'linear-gradient(135deg,rgba(29,185,84,0.12),rgba(29,185,84,0.04))',
            borderRadius: '8px', border: '1px solid rgba(29,185,84,0.2)',
          }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px', color: G.white }}>
              Ready to sync?
            </h2>
            <p style={{ fontSize: '14px', color: G.sub, marginBottom: '20px' }}>
              Download the Mac app and create a free account to get started.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href={DMG_URL} download style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: G.green, color: G.black, borderRadius: '500px',
                padding: '12px 24px', fontSize: '14px', fontWeight: 700, textDecoration: 'none',
              }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={G.black}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download for Mac
                <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 400 }}>Apple Silicon</span>
              </a>
              <button onClick={() => setPage('register')} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.1)', color: G.white,
                border: 'none', borderRadius: '500px', padding: '12px 24px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── NOW PLAYING BAR ── */}
      <div style={{
        gridColumn: '1/-1',
        background: G.elevated,
        borderTop: `1px solid ${G.highlight}`,
        borderRadius: '8px',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: '16px',
      }}>
        {/* Track */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '280px', flexShrink: 0 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '4px',
            background: grads.g1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '24px', flexShrink: 0,
          }}>🎹</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 400, color: G.green }}>Fade Into You</div>
            <div style={{ fontSize: '11px', color: G.sub, marginTop: '2px' }}>Rayan Ani</div>
          </div>
          <button style={{ background: 'none', border: 'none', color: G.sub, cursor: 'pointer', padding: '4px', marginLeft: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" /></svg>
          </button>
        </div>

        {/* Controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <CtrlBtn><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg></CtrlBtn>
            <CtrlBtn><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg></CtrlBtn>
            <button onClick={() => setPlaying(p => !p)} style={{
              width: 32, height: 32, borderRadius: '50%', background: G.white,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: G.black, transition: 'transform 0.1s',
            }}>
              {playing
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              }
            </button>
            <CtrlBtn><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg></CtrlBtn>
            <CtrlBtn><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg></CtrlBtn>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '500px' }}>
            <span style={{ fontSize: '11px', color: G.sub, fontVariantNumeric: 'tabular-nums' }}>1:18</span>
            <div style={{ flex: 1, height: '4px', background: G.highlight, borderRadius: '2px', cursor: 'pointer' }}>
              <div style={{ height: '100%', background: G.white, borderRadius: '2px', width: '35%' }} />
            </div>
            <span style={{ fontSize: '11px', color: G.sub, fontVariantNumeric: 'tabular-nums' }}>3:42</span>
          </div>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px', flexShrink: 0, justifyContent: 'flex-end' }}>
          <CtrlBtn><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5zm7-.17v6.34L9.83 13H7v-2h2.83L12 8.83z" /></svg></CtrlBtn>
          <div style={{ flex: 1, height: '4px', background: G.highlight, borderRadius: '2px' }}>
            <div style={{ height: '100%', background: G.white, borderRadius: '2px', width: '70%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function SNavItem({ children, icon, active }) {
  return (
    <a style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '10px 16px', borderRadius: '4px', cursor: 'pointer',
      color: active ? '#FFF' : '#B3B3B3',
      fontSize: '14px', fontWeight: 700, textDecoration: 'none',
      transition: 'color 0.1s',
    }}
      onMouseEnter={e => e.currentTarget.style.color = '#FFF'}
      onMouseLeave={e => e.currentTarget.style.color = active ? '#FFF' : '#B3B3B3'}>
      {icon}
      {children}
    </a>
  )
}

function NavArrow({ children }) {
  return (
    <button style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'rgba(0,0,0,0.7)', border: 'none',
      color: '#FFF', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.1s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}>
      {children}
    </button>
  )
}

function LibItem({ emoji, name, meta, g, grads }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.background = '#282828'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{ width: 48, height: 48, borderRadius: '4px', background: grads[g], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 400, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: '12px', color: '#B3B3B3', marginTop: '2px' }}>{meta}</div>
      </div>
    </div>
  )
}

function QuickItem({ emoji, name, g, grads }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', background: hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={{ width: 56, height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: grads[g] }}>{emoji}</div>
      <span style={{ fontSize: '13px', fontWeight: 700, padding: '0 12px', flex: 1, color: '#FFF' }}>{name}</span>
      <button style={{
        width: 48, height: 48, borderRadius: '50%', background: '#1DB954', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginRight: '12px',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.2s,transform 0.2s',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z" /></svg>
      </button>
    </div>
  )
}

function TrackRow({ num, emoji, name, artist, project, fmt, live, sync, dur, g, grads }) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr style={{ cursor: 'pointer', background: hovered ? '#282828' : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <td style={{ padding: '10px 16px', fontSize: '14px', color: live ? '#1DB954' : '#B3B3B3', width: '40px', textAlign: 'center' }}>
        {live ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954"><path d="M8 5v14l11-7z" /></svg> : num}
      </td>
      <td style={{ padding: '10px 16px', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '4px', background: grads[g], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{emoji}</div>
          <div>
            <div style={{ fontWeight: 400, color: live ? '#1DB954' : '#FFF' }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#B3B3B3', marginTop: '2px' }}>{artist}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '10px 16px', fontSize: '14px', color: '#B3B3B3' }}>{project}</td>
      <td style={{ padding: '10px 16px', fontSize: '14px' }}>
        <span style={{
          display: 'inline-block', padding: '3px 8px', borderRadius: '500px',
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
          background: fmt === 'wav' ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.1)',
          color: fmt === 'wav' ? '#1DB954' : '#B3B3B3',
        }}>{fmt.toUpperCase()}</span>
      </td>
      <td style={{ padding: '10px 16px', fontSize: '14px' }}>
        {live ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B3B3B3', fontSize: '12px' }}>
            <span className="animate-breathe" style={{ width: 6, height: 6, borderRadius: '50%', background: '#1DB954', display: 'inline-block', flexShrink: 0 }} />
            Live
          </div>
        ) : (
          <span style={{ color: '#B3B3B3', fontSize: '12px' }}>{sync}</span>
        )}
      </td>
      <td style={{ padding: '10px 16px', fontSize: '14px', color: '#B3B3B3', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{dur}</td>
    </tr>
  )
}

function ProjectCard({ emoji, name, desc, g, grads }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ background: hovered ? '#282828' : '#181818', borderRadius: '8px', padding: '16px', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={{
        width: '100%', aspectRatio: '1', borderRadius: '4px', background: grads[g],
        marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '48px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        position: 'relative', overflow: 'hidden',
      }}>
        {emoji}
        <button style={{
          position: 'absolute', bottom: '8px', right: '8px',
          width: 48, height: 48, borderRadius: '50%', background: '#1DB954',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.2s,transform 0.2s',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z" /></svg>
        </button>
      </div>
      <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
      <div style={{ fontSize: '12px', color: '#B3B3B3', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</div>
    </div>
  )
}

function CtrlBtn({ children }) {
  return (
    <button style={{ background: 'none', border: 'none', color: '#B3B3B3', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.1s' }}
      onMouseEnter={e => e.currentTarget.style.color = '#FFF'}
      onMouseLeave={e => e.currentTarget.style.color = '#B3B3B3'}>
      {children}
    </button>
  )
}
