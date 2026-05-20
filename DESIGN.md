---
name: Ironclad Vanguard
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e3bfb4'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#aa8a80'
  outline-variant: '#5a4139'
  surface-tint: '#ffb59e'
  primary: '#ffb59e'
  on-primary: '#5d1800'
  primary-container: '#f85e27'
  on-primary-container: '#521400'
  inverse-primary: '#ad3300'
  secondary: '#c3c9ae'
  on-secondary: '#2d331f'
  secondary-container: '#484e38'
  on-secondary-container: '#b8bfa3'
  tertiary: '#c7c6c6'
  on-tertiary: '#303031'
  tertiary-container: '#919190'
  on-tertiary-container: '#292a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59e'
  on-primary-fixed: '#390b00'
  on-primary-fixed-variant: '#842500'
  secondary-fixed: '#dfe6c9'
  secondary-fixed-dim: '#c3c9ae'
  on-secondary-fixed: '#181e0c'
  on-secondary-fixed-variant: '#434934'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  tactical-black: '#0D0D0D'
  charcoal-field: '#1A1A1B'
  operator-green: '#2E3325'
  signal-orange: '#FF5F1F'
  stark-white: '#FFFFFF'
typography:
  display-xl:
    fontFamily: Archivo Narrow
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Archivo Narrow
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Archivo Narrow
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
spacing:
  unit: 8px
  gutter: 24px
  margin-edge: 32px
  section-gap: 80px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for high-performance tactical gear, where reliability is not an option but a requirement. The brand personality is **authoritative, rugged, and uncompromising**. It speaks to professionals who demand equipment that performs under pressure. 

The visual style is a fusion of **Brutalism** and **High-Contrast Modernism**. It utilizes sharp, unyielding corners, heavy-weight typography, and a "hardware-first" aesthetic. UI elements should feel like they were machined rather than designed, echoing the textures of matte polymers, anodized aluminum, and ballistic nylon. 

The emotional response should be one of "Operational Readiness"—clean, efficient, and devoid of unnecessary decoration. Every element serves a functional purpose, prioritizing clarity and speed of information retrieval.

## Colors

The color palette is rooted in a "Deep Dark" mode to reflect tactical environments and hardware. 

- **Primary (Signal Orange):** Reserved strictly for high-priority Calls to Action (CTAs) and critical status indicators. It provides maximum contrast against the dark background.
- **Secondary (Operator Green):** A muted, earth-toned olive used for subtle accents, success states, or categorization of specific gear lines.
- **Neutral (Tactical Black/Charcoal):** The foundation of the UI. Use `#0A0A0A` for the primary background and `#1A1A1B` for elevated surfaces like cards or input fields.
- **Stark White:** Used for primary headings and body text to ensure absolute legibility against the dark surfaces.

Avoid gradients. Use solid color blocking to maintain a rugged, utilitarian feel.

## Typography

The typography strategy emphasizes **industrial hierarchy**.

1.  **Headlines (Archivo Narrow):** A condensed, impactful sans-serif that allows for large-scale type without sacrificing horizontal space. All headlines must be in **uppercase** to project authority.
2.  **Body (Inter):** A clean, highly legible grotesque for long-form content, ensuring readability in low-light conditions.
3.  **Utility & Data (JetBrains Mono):** Used for serial numbers, technical specifications, and labels. The monospaced nature reinforces the "military hardware" and "technical tool" aesthetic.

Letter spacing should be tightened for large display type and opened up (0.1em) for small labels to improve clarity.

## Layout & Spacing

This design system uses a **fixed-fluid hybrid grid** based on an 8px base unit.

- **Desktop:** 12-column grid with a max-width of 1440px. Gutters are fixed at 24px to maintain a tight, structured feel.
- **Mobile:** 4-column fluid grid with 16px margins. 
- **Rhythm:** Use "stack" units for vertical spacing. For example, a 32px (`stack-lg`) gap between a headline and body text, and an 80px (`section-gap`) gap between major layout blocks.

Layouts should favor heavy, asymmetric blocks of content. Large high-quality product photography should be treated as structural elements, often spanning 50% or 100% of the grid width.

## Elevation & Depth

Depth is created through **Tonal Layering** and **Sharp Outlines**, avoiding soft shadows which feel too organic for this brand.

- **Surfaces:** Use `#0A0A0A` for the base floor. Elements that sit "on top" (cards, modals) should use `#1A1A1B`.
- **Borders:** Define hierarchy using low-contrast outlines (1px solid `#333333`) for secondary containers and high-contrast outlines (1px solid `#FFFFFF`) for active states.
- **Overlays:** When text is placed over imagery, use a 40-60% black scrim or a "tactical mesh" pattern overlay to maintain legibility. 
- **Interactive Depth:** On click or active state, elements should not "glow" but rather change their border color to the Primary Signal Orange or Stark White.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Curvature is avoided to maintain a rugged, machined aesthetic. This applies to buttons, input fields, cards, and container boundaries. The only exception to this rule is for iconography that represents physical, rounded objects (e.g., a magnifying glass), but the containers housing them must remain square.

Use 45-degree chamfered corners on decorative elements or specialty "tag" labels to mimic the look of military stencils or ID plates.

## Components

- **Buttons:** Primary buttons are solid `signal-orange` with `stark-white` or `tactical-black` text (depending on contrast needs), always uppercase, 0px radius. Secondary buttons are ghost-style with a white 1px border.
- **Input Fields:** Dark charcoal background (`#1A1A1B`) with a 1px border. Focus state changes the border to `signal-orange`. Use `data-mono` for placeholder text.
- **Chips/Badges:** Use a "Stencil" style—rectangular with high-contrast background and monospaced text. Excellent for indicating "In Stock" or "Battle Proven" status.
- **Cards:** No shadows. Use a 1px border or a slight tonal shift from the background. Images within cards should have a desaturated or high-contrast "tactical" treatment.
- **Lists:** Separated by 1px horizontal dividers (`#333333`). Items use `label-caps` for titles to maintain a technical manual feel.
- **Progress Bars/Indicators:** Utilize "segmented" bars rather than continuous ones, looking like a digital battery or signal meter.