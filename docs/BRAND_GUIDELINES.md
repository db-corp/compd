# Comp'd Brand Guidelines

> **Brand identity, visual system, and design language for Comp'd.**
> Version 1.0 — February 2026

---

## 1. Brand Name

**Comp'd** (pronounced "comped") — uses industry language that businesses and creators already know. Restaurants and spas say "I'll comp that." Creators will naturally say "I got comp'd at that brunch spot."

- **App name:** Comp'd
- **Stylized:** COMP'D in logo and marketing contexts
- **Handles:** `@compd` or `@getcompd`
- **Domain candidates:** `compd.app`, `getcompd.com`, `compd.co`

---

## 2. Brand Voice

### Tone

Confident but not corporate. Warm but not saccharine. Direct. Local and grounded. Slightly editorial.

### Writing Rules

- Use contractions ("you're" not "you are")
- Keep push notifications under 100 characters
- No exclamation marks on errors or warnings
- Use "you" not "the user"
- Digits not words for numbers (3 deals, not three deals)
- Relative time when possible ("2 hours ago" not "at 3:42 PM")
- Active voice over passive voice

### Examples

| Context | Good | Bad |
|---------|------|-----|
| Empty state | "No offers near you yet. Check back soon." | "There are currently no offers available in your area!" |
| Success | "Deal completed. Both ratings submitted." | "Congratulations! Your deal has been successfully completed!" |
| Error | "Couldn't verify the post. Check the URL and try again." | "Error! Post verification has failed. Please try again." |
| Push notification | "Bida Manda approved your application" | "Great news! Your application to Bida Manda has been approved!" |
| CTA | "Browse offers" | "Explore available opportunities" |

---

## 3. Color Palette

Warm/cool contrast inspired by CMYK halftone (coral + teal on cream). The palette communicates energy (coral), trust (teal), and achievement (gold).

### Core Brand Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Coral | `#E8573D` | Logo, CTAs, brand moments |
| **Secondary** | Deep Teal | `#1A7A6D` | Trust elements, business-side accents |
| **Accent** | Amber Gold | `#E8A917` | Highlights, achievements, badges |

### Primary Scale

| Token | Hex | Swatch |
|-------|-----|--------|
| `primary.50` | `#FEF2F0` | Tinted backgrounds |
| `primary.100` | `#FCDDD8` | Hover states |
| `primary.200` | `#F8AFA4` | Light accents |
| `primary.300` | `#F28172` | Illustrations |
| `primary.400` | `#ED6A54` | Secondary buttons |
| `primary.500` | `#E8573D` | **Brand primary** |
| `primary.600` | `#C94832` | Pressed states |
| `primary.700` | `#A33928` | Dark accents |
| `primary.800` | `#7D2B1E` | High-contrast text on light bg |
| `primary.900` | `#571E14` | Darkest |

### Secondary Scale

| Token | Hex | Swatch |
|-------|-----|--------|
| `secondary.50` | `#EEF8F6` | Tinted backgrounds |
| `secondary.100` | `#D0EDEA` | Hover states |
| `secondary.200` | `#93D4CC` | Light accents |
| `secondary.300` | `#56BBAF` | Illustrations |
| `secondary.400` | `#2E9A8D` | Secondary buttons |
| `secondary.500` | `#1A7A6D` | **Brand secondary** |
| `secondary.600` | `#15655A` | Pressed states |
| `secondary.700` | `#104F46` | Dark accents |
| `secondary.800` | `#0B3A33` | High-contrast text |
| `secondary.900` | `#072520` | Darkest |

### Accent Scale

| Token | Hex | Swatch |
|-------|-----|--------|
| `accent.50` | `#FEF7E7` | Tinted backgrounds |
| `accent.100` | `#FCECC4` | Hover states |
| `accent.200` | `#F5D47B` | Light accents |
| `accent.300` | `#EFBE3F` | Illustrations |
| `accent.400` | `#E8A917` | **Brand accent** |
| `accent.500` | `#C99013` | Pressed states |
| `accent.600` | `#A4750F` | Dark accents |

### Neutral Scale (Warm-Tinted)

Neutrals use warm undertones, not blue-grey. This keeps the palette cohesive with the coral/teal brand colors.

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral.0` | `#FFFFFF` | Pure white |
| `neutral.25` | `#FDFCFA` | Page background |
| `neutral.50` | `#FAF8F5` | Card backgrounds (alt) |
| `neutral.100` | `#F0EDE8` | Borders, dividers |
| `neutral.200` | `#E0DBD4` | Disabled backgrounds |
| `neutral.300` | `#C5BFB6` | Placeholder text |
| `neutral.400` | `#A39D94` | Decorative icons |
| `neutral.500` | `#827B72` | Secondary text |
| `neutral.600` | `#615B53` | Body text |
| `neutral.700` | `#423D37` | Headings |
| `neutral.800` | `#2A2622` | Primary text |
| `neutral.900` | `#181614` | High emphasis |

### Semantic Colors

| Role | Light Mode | Dark Mode |
|------|-----------|-----------|
| **Success** | `#2D8F5F` | `#4ADE80` |
| **Warning** | `#D4870B` | `#FBBF24` |
| **Error** | `#C93B3B` | `#F87171` |
| **Info** | `#2B7CB5` | `#60A5FA` |

### Dark Mode

Dark mode lifts brand colors for readability and inverts neutrals with warm undertones.

| Adjustment | Light | Dark |
|-----------|-------|------|
| Primary | `#E8573D` | `#F28172` |
| Secondary | `#1A7A6D` | `#56BBAF` |
| Accent | `#E8A917` | `#EFBE3F` |
| Background | `#FDFCFA` | `#1C1A18` |
| Card bg | `#FFFFFF` | `#2A2724` |
| Border | `#F0EDE8` | `#454240` |
| Primary text | `#2A2622` | `#F0EDE8` |
| Secondary text | `#827B72` | `#A39D94` |

**Dark mode shadows:** Replace drop shadows with border emphasis (`neutral.700` borders at 1px). Shadows don't read well on dark backgrounds.

---

## 4. Typography

Both fonts from the DM family (shared DNA, natural pairing). Available via `@expo-google-fonts`.

### Font Families

| Role | Font | Weights | Source |
|------|------|---------|--------|
| **Headings / Brand** | DM Serif Display | 400 (Regular) | `@expo-google-fonts/dm-serif-display` |
| **Body / UI** | DM Sans | 400, 500, 700 | `@expo-google-fonts/dm-sans` |

### Type Scale

| Token | Size | Line Height | Weight | Font | Usage |
|-------|------|-------------|--------|------|-------|
| `display` | 36px | 1.1 | 400 | DM Serif Display | Hero sections, splash |
| `h1` | 28px | 1.2 | 400 | DM Serif Display | Page titles |
| `h2` | 22px | 1.25 | 400 | DM Serif Display | Section headings |
| `h3` | 18px | 1.3 | 700 | DM Sans | Subsection headings |
| `h4` | 16px | 1.35 | 700 | DM Sans | Card titles |
| `body.lg` | 16px | 1.5 | 400 | DM Sans | Large body text |
| `body.md` | 14px | 1.5 | 400 | DM Sans | Default body text |
| `body.sm` | 12px | 1.5 | 400 | DM Sans | Secondary text |
| `label` | 14px | 1.3 | 500 | DM Sans | Form labels, tags |
| `button` | 15px | 1.0 | 700 | DM Sans | Button text |
| `overline` | 11px | 1.4 | 700 | DM Sans | Overlines (uppercase, tracked) |
| `caption` | 11px | 1.4 | 400 | DM Sans | Captions, timestamps |

### Letter Spacing

- `overline`: 1.5px tracking (uppercase)
- All others: default (0)

---

## 5. Spacing & Layout

### Spacing Scale (4px base)

| Token | Value |
|-------|-------|
| `0` | 0px |
| `0.5` | 2px |
| `1` | 4px |
| `1.5` | 6px |
| `2` | 8px |
| `3` | 12px |
| `4` | 16px |
| `5` | 20px |
| `6` | 24px |
| `8` | 32px |
| `10` | 40px |
| `12` | 48px |
| `16` | 64px |
| `20` | 80px |
| `24` | 96px |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tags, pills |
| `sm` | 6px | Inputs, small elements |
| `md` | 8px | Buttons, cards (compact) |
| `lg` | 12px | Cards, modals |
| `xl` | 16px | Large cards, sheets |
| `2xl` | 24px | Feature cards |
| `full` | 9999px | Avatars, circular elements |

### Shadows (Warm-Tinted)

Shadow color base: `#181614` (neutral.900)

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `0 1px 3px rgba(24,22,20,0.08), 0 1px 2px rgba(24,22,20,0.06)` | Cards at rest |
| `md` | `0 4px 6px rgba(24,22,20,0.07), 0 2px 4px rgba(24,22,20,0.06)` | Hovered cards, dropdowns |
| `lg` | `0 10px 15px rgba(24,22,20,0.08), 0 4px 6px rgba(24,22,20,0.05)` | Modals, floating elements |

Dark mode: Use `1px solid neutral.700` borders instead of shadows.

### Motion

| Token | Duration | Usage |
|-------|----------|-------|
| `fast` | 150ms | Micro-interactions, toggles |
| `normal` | 250ms | Standard transitions |
| `slow` | 350ms | Page transitions, modals |

- **Easing:** `ease-out` for entrances, `ease-in` for exits
- **Spring easing:** Reserved for celebrations only (trust tier upgrades, deal completions)

---

## 6. Logo

### The Exchange Mark

Two overlapping abstract shapes — one coral, one teal — forming an "exchange" symbol. The overlap creates an amber-gold third color, representing the value created when businesses and creators come together.

### Usage Contexts

| Context | Format |
|---------|--------|
| **App icon** | Mark only on cream (`#FDFCFA`) background |
| **Navigation bar** | Mark + "Comp'd" wordmark in DM Serif Display |
| **Splash screen** | Large mark, "COMP'D" text below, halftone texture background |
| **Marketing / social** | Mark + wordmark, flexible layouts |

### Logo Rules

- Minimum clear space: 1x the width of the mark on all sides
- Minimum size: 24px height for the mark
- The mark always uses brand colors (coral + teal + amber overlap)
- Halftone texture is NEVER applied to the logo itself — it lives in the background only
- On dark backgrounds, use lifted color variants (same as dark mode palette)

---

## 7. Visual Elements

### Trust Tier Badges

| Tier | Icon | Background | Text Color | Description |
|------|------|------------|------------|-------------|
| **New** | Dot (filled circle) | `neutral.100` | `neutral.600` | Just joined, building reputation |
| **Established** | Half-circle | `secondary.50` | `secondary.600` | 3+ deals, proven reliability |
| **Trusted** | Circle | `accent.50` | `accent.600` | 10+ deals, consistent quality |
| **Verified** | Check-circle | `primary.50` | `primary.600` | 25+ deals, top performer |

Badge format: Icon + tier name + brief stat (e.g., "Trusted - 97% fulfillment - 22 deals")

### Content Tier Indicators

Bar indicator with 1-4 filled bars in teal (`secondary.500`):

| Tier | Bars | Label |
|------|------|-------|
| Light | 1 filled | Tier 1 |
| Standard | 2 filled | Tier 2 |
| Premium | 3 filled | Tier 3 |
| Campaign | 4 filled | Tier 4 |

Unfilled bars use `neutral.200`.

### Icons

**Library:** Lucide Icons via `lucide-react-native` (mobile) and `lucide-react` (web)

| Property | Value |
|----------|-------|
| Stroke width | 1.5px |
| Line cap | Round |
| Line join | Round |

| Context | Color |
|---------|-------|
| Decorative | `neutral.400` |
| Actionable | `neutral.700` |
| Brand emphasis | Brand colors (`primary.500`, `secondary.500`, `accent.400`) |
| Active/selected | `primary.500` |
| Disabled | `neutral.300` |

### Cards

| Property | Value |
|----------|-------|
| Background | `neutral.0` (white) |
| Border | 1px `neutral.100` |
| Border radius | `lg` (12px) |
| Padding | 20px |
| Shadow | `sm` at rest, `md` on interaction |

**Card Variants:**

| Variant | Tint | Usage |
|---------|------|-------|
| Standard | White (`neutral.0`) | Default cards |
| Featured | `primary.50` bg, `primary.100` border | Highlighted offers, promotions |
| Active | `secondary.50` bg, `secondary.100` border | In-progress deals |
| Alert | Semantic color `.50` bg, matching border | Warnings, time-sensitive items |

### Buttons

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| **Primary** | `primary.500` | White | None | Main CTAs |
| **Secondary** | Transparent | `primary.500` | 1px `primary.500` | Secondary actions |
| **Tertiary** | Transparent | `neutral.600` | None | Low-emphasis actions |
| **Success** | `success` | White | None | Confirmations |
| **Destructive** | `error` | White | None | Delete, cancel actions |

All buttons:
- Border radius: `md` (8px)
- Min height: 44px (touch target)
- Font: `button` token (15px, 700 weight, DM Sans)
- Pressed state: darken 10%
- Disabled: 50% opacity

---

## 8. Halftone Texture

The halftone dot pattern is a distinctive brand element inspired by CMYK print. It should feel energetic and editorial.

### Where to Use

**Yes:**
- Splash screen background
- App icon background
- Onboarding illustrations
- Marketing materials and social assets
- Empty states (subtle)
- Section backgrounds in marketing pages

**No:**
- Interactive UI elements
- Navigation bars
- Forms and inputs
- Chat interface
- Dashboards and data views
- Settings screens
- Any context where it competes with content

### Rules

- Use in coral or teal, never both simultaneously in the same element
- Opacity: 5-15% over backgrounds (subtle texture, not dominant)
- Never apply halftone directly to the logo mark
- Scale dots proportionally — smaller on mobile, larger on print/marketing

---

## 9. Accessibility

### Color Contrast Requirements

All text must meet WCAG AA minimum contrast ratios:
- **Body text:** 4.5:1 against background
- **Large text (18px+ or 14px+ bold):** 3:1 against background
- **UI components and graphics:** 3:1 against adjacent colors

### Key Contrast Pairs (Light Mode)

| Foreground | Background | Ratio | Pass |
|-----------|------------|-------|------|
| `neutral.800` on `neutral.25` | `#2A2622` / `#FDFCFA` | ~13.5:1 | AA |
| `neutral.600` on `neutral.25` | `#615B53` / `#FDFCFA` | ~6.2:1 | AA |
| White on `primary.500` | `#FFFFFF` / `#E8573D` | ~3.8:1 | AA Large |
| White on `secondary.500` | `#FFFFFF` / `#1A7A6D` | ~4.6:1 | AA |
| White on `primary.600` | `#FFFFFF` / `#C94832` | ~4.8:1 | AA |

### Touch Targets

- Minimum 44x44px for all interactive elements (per Apple HIG and Material Design)
- Adequate spacing between touch targets (min 8px gap)

### Motion

- Respect `prefers-reduced-motion` system setting
- Provide static alternatives for all animated content
- Spring animations (celebrations) should be suppressible

---

## 10. Do's and Don'ts

### Do

- Use coral for primary actions and brand moments
- Use teal for trust and business-side elements
- Use warm neutrals (not blue-grey) for backgrounds and text
- Keep type hierarchy clear with the serif/sans pairing
- Use the halftone texture subtly in brand moments
- Maintain generous whitespace
- Use relative time for timestamps
- Write in a direct, confident tone

### Don't

- Don't use halftone texture on interactive elements
- Don't combine coral and teal in equal proportions in a single element (one should dominate)
- Don't use pure black (`#000000`) — use `neutral.900` (`#181614`)
- Don't use pure grey — all neutrals should have warm undertone
- Don't use drop shadows in dark mode (use border emphasis instead)
- Don't use exclamation marks in error messages
- Don't apply halftone to the logo mark itself
- Don't use spring animations outside of celebration moments
- Don't use the accent gold as a background color for large areas
- Don't mix DM Serif Display into body text — it's for headings only
