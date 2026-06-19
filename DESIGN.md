# Design

## Color Palette

Seed: `oklch(0.550 0.145 150.0)` — moss green, from "moss garden at Saiho-ji: damp stone, filtered green light through cedar canopy."

### Strategy

**Committed**: one saturated color (moss green) carries 30–60% of the interactive surface — buttons, active states, links. The rest of the UI is cool, clean, and quiet, so the green reads as deliberate energy, not decoration.

### Mood

A polished terminal in a sunlit room — monochrome precision with one bold shot of moss-green energy.

### Light Mode (hero)

| Role | Value | Usage |
|---|---|---|
| `--bg` | `oklch(1.000 0.000 0)` | Page background. Pure white. |
| `--surface` | `oklch(0.965 0.005 160)` | Card, section, and panel backgrounds. Cool whisper of green. |
| `--ink` | `oklch(0.100 0.008 160)` | Body text. Near-black with a cool-green undertone. |
| `--primary` | `oklch(0.550 0.145 150)` | Buttons, links, focused inputs, brand mark. The committed green. |
| `--primary-hover` | `oklch(0.480 0.145 150)` | Primary dimmed for hover/pressed states. |
| `--accent` | `oklch(0.720 0.140 30)` | Tags, badges, secondary highlights. Warm coral — the "pop" against the cool base. |
| `--accent-hover` | `oklch(0.650 0.140 30)` | Accent dimmed for hover/pressed states. |
| `--muted` | `oklch(0.400 0.012 160)` | Secondary text, placeholders, labels. |
| `--border` | `oklch(0.880 0.008 160)` | Rules, dividers, input borders. Subtle green undertone. |
| `--error` | `oklch(0.550 0.180 25)` | Error text and icon fills. |
| `--success` | `oklch(0.600 0.140 150)` | Success indicators. |

### Dark Mode

| Role | Value | Usage |
|---|---|---|
| `--bg` | `oklch(0.080 0.000 0)` | Page background. Near-black. |
| `--surface` | `oklch(0.120 0.005 160)` | Card/section backgrounds. |
| `--ink` | `oklch(0.900 0.008 160)` | Body text. Near-white with cool-green undertone. |
| `--primary` | `oklch(0.650 0.130 150)` | Buttons, links. Lighter to glow against dark. |
| `--primary-hover` | `oklch(0.720 0.130 150)` | Primary hover. |
| `--accent` | `oklch(0.780 0.110 30)` | Tags, badges. |
| `--accent-hover` | `oklch(0.700 0.110 30)` | Accent hover. |
| `--muted` | `oklch(0.550 0.010 160)` | Secondary text. |
| `--border` | `oklch(0.200 0.008 160)` | Rules, dividers. |
| `--error` | `oklch(0.650 0.160 25)` | Error indicators. |
| `--success` | `oklch(0.700 0.120 150)` | Success indicators. |

### Text-on-color fills

For saturated elements (primary buttons, accent badges), text is always white (`--bg` from the appropriate mode). The Helmholtz-Kohlrausch effect makes these colors appear brighter than their luminance, so dark text reads as muddy.

## Typography

### Pairing rationale

- **Spline Sans** (headings & UI labels) — sharp, architectural geometric sans. Its disciplined letterforms echo the terminal aesthetic without being cold. Used at `--font-sans`.
- **Spline Sans Mono** (body, URL display, input field) — designed by the same foundry to pair seamlessly. The mono-spaced character carries the "terminal window" fluency. Used at `--font-mono`.

### Scale

| Level | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| Display (h1) | `clamp(2.5rem, 5vw, 4rem)` | 700 | 1.05 | -0.02em |
| h2 | `clamp(1.5rem, 3vw, 2rem)` | 600 | 1.15 | -0.01em |
| Body | `1rem` | 400 | 1.6 | 0 |
| Small (labels, meta) | `0.875rem` | 500 | 1.4 | 0.01em |
| Caption | `0.75rem` | 400 | 1.4 | 0 |

- Body max-width capped at 65ch.
- h1 uses `text-wrap: balance` for even line lengths.
- `--font-mono` used for input field (monospace looks like you're "typing code") and URL display (URLs are inherently technical — monospace treats them with precision).

## Layout

- **Single-column** centered layout, max-width 640px for the content area.
- **Spacing rhythm**: 8px base unit, gaps use multiples: 8, 12, 16, 24, 32, 40, 48.
- **Border radius**: 8px for inputs/cards, 6px for buttons (slightly tighter than inputs), 9999px for tags/badges/pills.
- **Shadows**: None on surfaces. Terminal aesthetic is flat. Floating elements (toasts, modals) use `0 4px 12px oklch(0 0 0 / 0.08)`.

## Motion

- **Reveals**: CSS opacity + translateY transitions, 300ms, ease-out-expo curve.
- **Interactions**: Button press → scale(0.97) 100ms. Hover → no transform, only color transition.
- **Copy feedback**: "Copied!" text swap, 200ms fade, 2s display.
- **Loading**: Skeleton shimmer using a simple opacity pulse (no spinner).
- **Reduced motion**: All transitions degrade to instant (0ms) at `prefers-reduced-motion: reduce`.

## Components

### Input
- Monospace font, full-width, 12px vertical padding, 8px horizontal radius.
- Border `1px solid --border`.
- Focus: `--primary` 2px ring outline, no offset.
- Placeholder: `--muted` at `0.875rem`.

### Primary Button
- Full-width (`--primary` fill, white text), 10px vertical padding, 6px radius.
- Hover: `--primary-hover`. Active: scale(0.97). Disabled: 40% opacity.

### Result Card
- `--surface` background, `--border` 1px border, 8px radius, 20px padding.
- Internal sections separated by subtle `--border` rules (not card-in-card).
- Copy button: primary fill, compact (8px horizontal, 6px vertical padding), sits inline with the short URL code block.

### Tag / Badge
- 6px horizontal, 3px vertical padding. Font: mono, `0.75rem`.
- `--accent` tinted background (at 15% opacity), `--accent` text.
- 9999px radius (pill shape).

## Responsive

- Content max-width 640px on desktop, full-width (minus 16px gutters) on mobile.
- Single column at all sizes. No breakpoint complexity needed for a one-input tool.
- Touch targets: all interactive elements ≥ 44×44px.
