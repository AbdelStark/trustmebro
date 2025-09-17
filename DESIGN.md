# TrustMeBro Design System

This document defines the visual language, interaction patterns, and compositional rules for building a world‑class, Bitcoin‑maxi dark UI that feels precise, premium, and timeless.

The aesthetic is black/white dominant with Bitcoin Orange accents and hints of graphite/silver. The result should be elegant, readable, and confidently minimal — no gimmicks, no noise.

## Color System

- Base
  - Bg: `#0b0b0b`
  - Panel: `#111214`
  - Surface: `#151618`
  - Text: `#e8e8e8`
  - Muted: `#9ea2a8` (supporting text)
  - Muted‑2: `#b0b5bd` (labels)
  - Muted‑3: `#6c7280` (placeholders)
- Accent
  - Accent‑600 (Bitcoin Orange): `#F7931A`
  - Accent‑500: `#FF9900`
  - Accent‑700: `#CF7A14`
- Semantic
  - Success: `#39FF14` (neon green, used sparingly)
  - Warning: `#FFCC00`
  - Danger: `#FF3B3B`

All colors are exposed as CSS variables in `app/globals.css`. Dark‑only for V1.

## Typography

- Sans: Geist (fallback system UI)
- Mono: Geist Mono (fallback system monospace)
- Weights: 400, 500, 600 where needed; avoid too‑heavy bolds.
- Tracking: Slightly tight for headings, normal for body, none for mono.

Type scale (guidance):
- H1: 24px / 32 leading / 600
- H2: 18px / 28 leading / 600
- Body: 14–16px
- Mono data: 14–15px

## Spacing & Radius

- Grid gap: 16px default (`gap-4`); Section gap: 24px (`space-y-6`).
- Radius: 10px for panels; 6–8px for controls.
- Hit targets >= 36px height where possible.

## Elevation & Surfaces

- Panels use a very subtle vertical sheen + soft inner border:
  - Background: Panel with a 2–3% white gradient overlay.
  - Border: `rgba(255,255,255,0.08)`; on hover increase subtly.
  - Shadow: soft, low spread; avoid heavy glows.

- Optional “grid chrome” texture for hero cards not interfering with content.

## Components

- Panel (`.panel`)
  - Background gradient overlay, 1px subtle border, 10px radius, soft inset line.
  - Hover increases border contrast by ~8–12%.

- Button (`.btn`)
  - Minimal chrome; subtle gradient and border; no filled neon.
  - Hover: border adopts Accent‑600. Active: nudge down 1px.

- Badge (`.badge`)
  - Pills for statuses. Icon + label, 12–13px size. Semantic colors are applied to the icon only. The badge background remains neutral.

- Focus Rings
  - Use accent as focus ring (`--ring`), offset by 2px.

## Blocks Presentation

- Block Card (Home grid)
  - Header row: left label “Block” (Muted‑2) with large `#height`; right side: Proof badge.
  - Meta row: time ago · tx count · size · weight.
  - Hash row: mono, truncated hash with copy control; prev hash muted beneath.
  - Hover: soft orange shadow, border contrast increase.

- Block Detail
  - Top panel mirrors card header (label + height + proof badge).
  - Details rendered as a clean two‑column table: left labels, right values (mono). Truncate long values consistently (`truncateHex`).

## Charts (Future)

When charts are introduced:
- Monochrome base with a single accent series in Bitcoin Orange.
- Grid lines in `rgba(255,255,255,0.06)`; axes labels in Muted‑3; data labels in Text.
- Avoid saturated fills; prefer thin strokes and small point markers.

## Interaction Principles

- Motion: quick and subtle; 120–160ms transitions for hover/press, no large animations.
- Feedback: clear hover affordances; focus states always visible for keyboard users.
- Density: keep vertical rhythm tight but readable; don’t overcrowd.

## Content Rules

- Hashes, IDs, and numeric protocol data = monospace.
- Human time displays (e.g., “12 min ago”) with UTC in `title` attribute for precision.
- Tooltips are optional; ensure titles/labels convey meaning without them.

## Do / Don’t

- Do: use black/white dominance with tiny accent touches.
- Do: keep semantic colors for icons/badges, not entire surfaces.
- Don’t: introduce gradients or colors outside the palette.
- Don’t: cram information; prioritize clarity and scanability.

## Implementation Notes

- All primitives live in `app/globals.css` (`.panel`, `.btn`, `.badge`, `.divider`, etc.).
- Prefer Tailwind utility classes for spacing and layout; combine with the custom primitives.
- Always compare to live design tokens — no ad‑hoc colors.

## Accessibility

- Contrast ≥ 4.5 for text; small meta text may be slightly lower only when accompanied by a clear label.
- Focus states must be keyboard visible.
- ARIA labels on interactive mono content (e.g., copy hash buttons).

