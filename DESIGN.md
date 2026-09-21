# Design Brief

## Direction

Broadcast Noir — a dark-first, cinematic IPTV channel browser that reads like a broadcast control room, not a consumer streaming clone.

## Tone

Confident, high-contrast, cinematic; dark ink-blue-black surfaces with one vivid tally-light accent, executed with editorial restraint.

## Differentiation

The broadcast-hardware color language: a vermilion "tally light" primary and monospace channel-number/time codes make StreamDeck feel like live transmission equipment rather than a Netflix pastiche.

## Color Palette

| Token      | OKLCH           | Role                                                          |
| ---------- | --------------- | ------------------------------------------------------------- |
| background | 0.135 0.018 258 | Deep ink-blue-black app canvas                                |
| foreground | 0.95 0.008 255  | Primary text, high contrast on dark                           |
| card       | 0.18 0.02 258   | Elevated channel cards, panels, header                        |
| primary    | 0.62 0.24 27    | Vermilion tally-light — CTAs, active nav, live state          |
| accent     | 0.78 0.16 195   | Cyan on-air telemetry — used sparingly for status/live dots   |
| muted      | 0.235 0.024 258 | Inactive chips, secondary surfaces                            |
| border     | 0.28 0.024 258  | Hairline dividers and card outlines                           |

## Typography

- Display: Space Grotesk — wordmark, page headings, section titles (tight negative tracking)
- Body: Satoshi — UI labels, descriptions, paragraphs
- Mono: JetBrains Mono — channel numbers, EPG times, LIVE tags, status codes
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold`, label `label-eyebrow` (xs uppercase tracking-[0.2em]), body `text-base`

## Elevation & Depth

Depth comes from layered dark surfaces plus a deep `shadow-elevated` / `shadow-player` hierarchy; light is reserved for the tally accent, never for glow.

## Structural Zones

| Zone    | Background             | Border              | Notes                                                       |
| ------- | ---------------------- | ------------------- | ----------------------------------------------------------- |
| Header  | `bg-card/80` + blur    | `border-b`          | Sticky; wordmark left, nav center, search + auth right      |
| Content | `bg-background`        | —                   | Featured player on `bg-card`; alternating `bg-muted/30` bands |
| Footer  | `bg-muted/40`          | `border-t`          | Muted text, mono status line                                |

## Spacing & Rhythm

Generous section gaps (`py-12 md:py-16`), content grouped in `gap-4 md:gap-6` grids, micro-spacing at `gap-2` inside cards; a 1400px centered container.

## Component Patterns

- Buttons: medium-radius, solid vermilion primary for the single main action, outline/ghost for secondary; hover shifts to `bg-gradient-primary`.
- Cards: `rounded-lg`, `bg-card`, hairline `border-border`, `shadow-subtle` at rest → `card-hover-lift` (translateY -4px, primary-tinted border) on hover.
- Badges: pill-shaped category chips; active = solid primary, rest = `bg-muted` outlined; LIVE tag = mono uppercase with pulsing tally dot.

## Motion

- Entrance: `animate-fade-in-up` on cards and sections, staggered by index, 400ms `cubic-bezier(0.16,1,0.3,1)`.
- Hover: 300ms smooth lift and border tint via `transition-smooth`; quick 150ms for icon/color feedback.
- Decorative: `animate-tally-pulse` on the live dot, `animate-signal-sweep` for loading/signal states.

## Constraints

- Dark theme is the designed experience; light tokens exist only as an AA+ safety fallback.
- Never use raw color literals or arbitrary Tailwind color classes — semantic tokens only.
- Accent cyan is reserved for live/status telemetry; primary vermilion marks the single main action per view.
- No real stream playback or EPG feed is designed for; the player ships an intentional placeholder state.

## Signature Detail

The tally-light system — a pulsing vermilion live dot paired with monospace channel-number and timecode chips — turns every card and the player into a piece of broadcast hardware.
