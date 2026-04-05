# DESIGN.md — SoundBridg

> Drop this file in the project root. All UI changes must reference these tokens.
> Design language: SoundBridg brand × Linear precision × Apple restraint.

---

## 1. Visual Theme & Atmosphere

Dark, focused, premium. A tool for serious creators — not a consumer app.
- **Density**: Medium-low. Breathable but efficient. No wasted space, no clutter.
- **Mood**: Deep night studio. Muted navy depths, gold warmth.
- **Philosophy**: Every element earns its place. If it doesn't need to exist, remove it.
- **Influences**: Linear (precise spacing, hairline borders, grouped nav) × Apple (whitespace, type hierarchy, frosted glass) × SoundBridg brand identity.

---

## 2. Color Palette

### Core Surfaces
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#0A0A0F` | App background, deepest layer |
| `--bg-card` | `#111118` | Cards, sidebar, panels |
| `--bg-elevated` | `#16161F` | Elevated surfaces |
| `--bg-hover` | `#1A1A26` | Hover states, subtle fills |
| `--bg-input` | `#0D0D14` | Form inputs, search fields |

### Brand
| Token | Hex | Role |
|---|---|---|
| `--primary` | `#1B3A5C` | Ocean blue — gradients, art fills, secondary elements |
| `--primary-mid` | `#1E4268` | Lighter ocean blue for gradients |
| `--primary-glow` | `rgba(27,58,92,0.4)` | Glow effects on primary |
| `--accent` | `#C9A84C` | Gold — CTAs, active states, playing indicator, highlights |
| `--accent-dim` | `rgba(201,168,76,0.10)` | Accent background fills |
| `--accent-glow` | `rgba(201,168,76,0.20)` | Accent glow/shadow |
| `--accent-line` | `rgba(201,168,76,0.35)` | Accent borders |

### Semantic
| Token | Hex | Role |
|---|---|---|
| `--green` | `#22C55E` | Sync active, live status, success |
| `--green-dim` | `rgba(34,197,94,0.10)` | Green background fills |
| `--red` | `#EF4444` | Error, destructive |
| `--red-dim` | `rgba(239,68,68,0.10)` | Error background fills |

### Text
| Token | Hex | Role |
|---|---|---|
| `--text-primary` | `#F0F0F5` | Headings, primary content |
| `--text-secondary` | `#8E8EA0` | Subtext, metadata, labels |
| `--text-tertiary` | `#4A4A5C` | Placeholders, disabled, row numbers |
| `--text-accent` | `#C9A84C` | Highlighted/active text |

### Borders (Linear-style hairlines)
| Token | Value | Role |
|---|---|---|
| `--border` | `rgba(255,255,255,0.055)` | Default dividers |
| `--border-mid` | `rgba(255,255,255,0.09)` | Slightly visible borders |
| `--border-accent` | `rgba(201,168,76,0.22)` | Accent borders on hover/active cards |

---

## 3. Typography

### Fonts
- **Primary**: `DM Sans` — UI, body, labels, buttons
- **Monospace**: `JetBrains Mono` — timestamps, file sizes, durations, format badges, row numbers
- **Fallback**: `-apple-system, BlinkMacSystemFont, sans-serif`

```css
font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
font-family: 'JetBrains Mono', 'SF Mono', monospace;
```

### Type Scale (Apple-style hierarchy)
| Role | Size | Weight | Notes |
|---|---|---|---|
| Page title | 20px | 700 | letter-spacing: -0.4px |
| Section title | 16px | 700 | letter-spacing: -0.3px |
| Card title | 13.5px | 600 | |
| Body / nav item | 13.5px | 500 | |
| Label / metadata | 12px | 400–500 | color: `--text-secondary` |
| Caption / badge | 11px | 600 | uppercase, letter-spacing: 0.06em |
| Mono data | 12px | 400–500 | JetBrains Mono |
| Stat value | 26px | 700 | letter-spacing: -1px, tabular-nums |

### Rules
- Always use `-webkit-font-smoothing: antialiased`
- Stat numbers use `font-variant-numeric: tabular-nums`
- Section labels: `text-transform: uppercase; letter-spacing: 0.08em; font-size: 10–11px`
- Never use Inter, Roboto, or system-ui as primary font

---

## 4. Spacing (Linear's 4px grid)

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
```

All padding, margin, and gap values must snap to this 4px grid.

---

## 5. Border Radius

```
--r-sm:   6px
--r-md:   10px
--r-lg:   14px
--r-xl:   20px
--r-full: 999px
```

---

## 6. Component Specifications

### Sidebar (Linear-style)
- Width: 220px fixed
- Background: `--bg-card`
- Right border: `1px solid var(--border)`
- Logo: 28×28px rounded square (`--r-sm`), gradient from `--primary` to `--accent`
- Nav sections: grouped with uppercase label (`--text-tertiary`, 10px, 600 weight)
- Nav item height: ~32px, padding: `6px 12px`
- Nav item active: background `--accent-dim`, left 2px border `--accent`, text `--accent`
- Nav badge: `JetBrains Mono`, 10px, `--text-tertiary`, background `--bg-hover`
- User row at bottom: avatar gradient `--primary-mid → --accent`, 28×28 `--r-sm`

### Top Bar
- Height: 52px min
- Border-bottom: `1px solid var(--border)`
- Title: 15px, 600 weight
- Sync status pill: `--green-dim` background, `--green` text, animated breathing dot
- Padding: `0 32px`

### Buttons
```
Primary:  background --accent, color #0A0A0F, hover #D4B560
Ghost:    transparent, border 1px --border-mid, hover background --bg-hover
Danger:   background --red-dim, color --red, hover background --red color white
Icon btn: 32×32px, --r-sm
All:      font-size 13px, font-weight 600, padding 7px 14px, --r-sm
          transition: 0.12s, active: scale(0.98)
```

### Cards (Project cards)
- Background: `--bg-card`
- Border: `1px solid var(--border)`
- Border-radius: `--r-lg`
- Hover: border-color `--accent-line`, transform `translateY(-1px)`
- Art area: square aspect ratio, gradient background using `--primary` + `--primary-mid`
- Overlay on hover: dark 50% scrim with gold play circle (`--accent`, box-shadow `--accent-glow`)
- Body padding: `--space-4`

### Data Table (Linear-style)
- Wrap: `--bg-card` background, `1px solid var(--border)`, `--r-lg`
- Header cells: 11px, 600 weight, uppercase, `letter-spacing: 0.06em`, `--text-tertiary`
- Header border-bottom: `1px solid var(--border)`
- Row border-bottom: `1px solid var(--border)`, last row no border
- Row hover: background `--bg-hover`
- Playing row: background `rgba(201,168,76,0.04)`, title color `--accent`
- Row number column: `JetBrains Mono`, `--text-tertiary`, playing = `--accent`
- Format badge WAV: `--accent-dim` bg, `--accent` text, border `--accent-line`, mono font, 10px, uppercase
- Format badge MP3: `--bg-hover` bg, `--text-tertiary` text, border `--border`
- Duration/size: `JetBrains Mono`, `--text-secondary`
- Live sync cell: 6px green dot with breathing animation + "Live" text

### Stat Cards
- Background: `--bg-card`, border `1px solid var(--border)`, `--r-lg`
- Label: 11px, 600, uppercase, `letter-spacing: 0.06em`, `--text-tertiary`
- Value: 26px, 700, `letter-spacing: -1px`, `font-variant-numeric: tabular-nums`
- Delta badges: `--r-full`, green-dim/accent-dim backgrounds

### Storage Card
- Circular ring indicator: 72×72px SVG, stroke `--accent`, track stroke `--border-mid`
- Fill bar: gradient from `--primary-mid` to `--accent`
- Legend dots: square 8×8 `--r-sm`

### Bottom Player Bar (Apple Music-style)
- Height: 72px
- Background: `rgba(10,10,15,0.85)` + `backdrop-filter: blur(20px) saturate(1.4)`
- Border-top: `1px solid var(--border)`
- Three-column layout: track info (240px) | controls (flex) | volume (200px)
- Playing title: `--accent` color
- Play/pause button: 34×34 circle, white background, `--bg` icon, hover turns `--accent`
- Progress track: 3px height, hover 5px, fill `--text-secondary`, hover fill `--accent`
- Time labels: `JetBrains Mono`, 11px, `--text-tertiary`

---

## 7. Motion & Transitions

- **Default transition**: `0.12s ease` for color, background, border-color
- **Card hover lift**: `transform: translateY(-1px)`, `0.15s ease`
- **Button press**: `transform: scale(0.98)` on `:active`
- **Play overlay**: `opacity 0.2s ease`
- **Storage bar fill**: `0.6s cubic-bezier(0.4, 0, 0.2, 1)`
- **Breathing dot** (live sync): `opacity 1→0.4→1, scale 1→0.8→1` over `2.4s ease-in-out infinite`
- No large motion. No bounces. No decorative animations. Functional only.

---

## 8. Art / Gradient Fills

Project art blocks use dark gradient fills (never solid colors, never light):
```css
art-1: linear-gradient(135deg, #0f2640 0%, #1B3A5C 100%)
art-2: linear-gradient(135deg, #1a1a35 0%, #2a1a4a 100%)
art-3: linear-gradient(135deg, #1a0f0f 0%, #3a1a1a 100%)
art-4: linear-gradient(135deg, #0f1a30 0%, #1B3A5C 80%)
art-5: linear-gradient(135deg, #0d1f18 0%, #1a3a28 100%)
art-6: linear-gradient(135deg, #1a150f 0%, #3a2a10 100%)
```

Logo mark: `linear-gradient(135deg, #1B3A5C 0%, #C9A84C 120%)`
User avatar: `linear-gradient(135deg, #1E4268, #C9A84C)`

---

## 9. Layout

```
App grid: 220px sidebar | 1fr main content
Main: flex column (topbar → scrollable content → player bar)
Stats: 4-column grid, 16px gap
Projects: 4-column grid, 16px gap
Content padding: 32px horizontal
Sidebar padding: 20px vertical, 12px horizontal for nav items
```

---

## 10. Do's and Don'ts

**Do:**
- Use `--accent` gold for all interactive/active states
- Keep borders as hairlines — they should barely be visible
- Use `JetBrains Mono` for any numeric data
- Maintain the 4px spacing grid strictly
- Use `backdrop-filter: blur` for the player bar only
- Keep all art blocks dark — deep gradients only
- Breathing animation only for live sync status dot

**Don't:**
- Never use white or light backgrounds
- Never use purple gradients (generic AI look)
- Never use Inter, Roboto, or Arial
- Never use `box-shadow` as decoration — only for play button glow on `--accent`
- Never use bright/saturated colors outside semantic (green=sync, red=error)
- Never use border-radius larger than `--r-lg` (14px) on data components
- Never add animations that aren't functional

---

## 11. Claude Code Prompt Guide

**Quick color reference:**
- Active/playing/CTA → `#C9A84C`
- Depth/gradients → `#1B3A5C`
- App background → `#0A0A0F`
- Cards → `#111118`
- Live/success → `#22C55E`

**Ready-to-use prompts:**

```
Build this component using DESIGN.md tokens. Dark background (#0A0A0F),
card surfaces (#111118), gold accent (#C9A84C) for active states,
ocean blue (#1B3A5C) for gradients. DM Sans font, JetBrains Mono for data.
Linear-style spacing (4px grid), Apple-style whitespace.
```

```
Restyle this page to match DESIGN.md. Apply --bg-card backgrounds,
--accent gold for primary actions and active nav, --border hairlines,
--text-secondary for metadata. No light backgrounds, no purple gradients.
```

```
Update the player bar to match DESIGN.md: 72px height,
rgba(10,10,15,0.85) + backdrop-filter blur, --accent gold on playing title,
JetBrains Mono timestamps, 3px progress track.
```
