import * as stylex from "@stylexjs/stylex"

/**
 * StyleX port of the design tokens in ./globals.css.
 *
 * The Tailwind theme derives its semantic colours from Tailwind's built-in
 * palette (`var(--color-neutral-900)` and friends). StyleX has no access to
 * that palette, so the raw values are inlined here from tailwindcss/theme.css
 * (v4.3.0) and kept in one place so the relationship stays visible.
 *
 * `--alpha(var(--color-black) / 4%)` and `color-mix(...)` are emitted as plain
 * CSS: StyleX passes value strings through untouched.
 *
 * The visual language is a soft dark "charcoal stack": layered surfaces that
 * step up in lightness (background -> card -> popover), hairline borders at
 * white/8%, wide soft drop shadows, and the Taiyo brand red as the single
 * accent for actions, controls, focus and charts.
 */
const palette = {
  black: "#000",
  white: "#fff",
  brand: "#f2452d",
  neutral50: "oklch(98.5% 0 0)",
  neutral100: "oklch(97% 0 0)",
  neutral400: "oklch(70.8% 0 0)",
  neutral450: "oklch(64% 0 0)",
  neutral500: "oklch(55.6% 0 0)",
  neutral900: "oklch(20.5% 0 0)",
  neutral950: "oklch(14.5% 0 0)",
  red400: "oklch(70.4% 0.191 22.216)",
  red500: "oklch(63.7% 0.237 25.331)",
  red700: "oklch(50.5% 0.213 27.518)",
  blue400: "oklch(70.7% 0.165 254.624)",
  blue500: "oklch(62.3% 0.214 259.815)",
  blue700: "oklch(48.8% 0.243 264.376)",
  emerald400: "oklch(76.5% 0.177 163.223)",
  emerald500: "oklch(69.6% 0.17 162.48)",
  emerald700: "oklch(50.8% 0.118 165.612)",
  amber400: "oklch(82.8% 0.189 84.429)",
  amber500: "oklch(76.9% 0.188 70.08)",
  amber700: "oklch(55.5% 0.163 48.998)",
  violet400: "oklch(70.2% 0.183 293.541)",
  violet500: "oklch(60.6% 0.25 292.717)",
  pink500: "oklch(65.6% 0.241 354.308)",
}
/**
 * Light surfaces, calibrated against the dark stack rather than guessed.
 * Dark stacks UP from a near-black page toward the viewer
 * (bg 12 -> well 25 -> field 27 -> card 30 -> popover 32 -> keycap 49, in
 * 8-bit grey); light mirrors that ordering, stacking up from a soft grey page
 * toward white (236 -> field 250 -> card 253 -> popover 255). The page has to
 * leave headroom below white, otherwise a white card cannot read as raised —
 * that is why the background is no longer neutral100.
 */
const lightBackground = "oklch(94.2% 0 0)"
const lightCard = "oklch(99.3% 0 0)"
const lightField = "oklch(98.4% 0 0)"
// Sunken tracks (switch/slider rails, tabs list, progress) are an OPAQUE step
// in light, exactly as in dark. As a black alpha they changed value with the
// surface underneath — barely visible on a white popover, heavy on the page —
// which is the one place the two themes stopped behaving alike.
const lightWell = "oklch(92.7% 0 0)"
// Raised in light means lighter, so the keycap is white and its separation is
// carried by a DARKER hairline — the mirror image of the dark theme, where the
// cap is lighter than the field and the hairline lighter still.
const lightKeycapBorder = "oklch(88.7% 0 0)"
// Matched to the dark muted grey by contrast ratio against its own background
// (5.8:1), not by picking a palette step.
const lightMutedForeground = "oklch(47.7% 0 0)"
const darkBackground = `color-mix(in srgb, ${palette.neutral950} 99%, ${palette.white})`
const darkCard = `color-mix(in srgb, ${palette.neutral950} 92%, ${palette.white})`
const darkPopover = `color-mix(in srgb, ${palette.neutral950} 91%, ${palette.white})`
const darkWell = `color-mix(in srgb, ${palette.neutral950} 94%, ${palette.white})`
const darkField = `color-mix(in srgb, ${palette.neutral950} 93%, ${palette.white})`
// Keycap chips read as a lighter fill with an even lighter hairline border:
// measured off the reference, the fill sits ~22 luminance above the field and
// the border ~28 above the fill.
const darkKeycap = `color-mix(in srgb, ${palette.neutral950} 84%, ${palette.white})`
const darkKeycapBorder = `color-mix(in srgb, ${palette.neutral950} 72%, ${palette.white})`
const darkChipHover = `color-mix(in srgb, ${palette.neutral950} 89%, ${palette.white})`
const darkSidebar = `color-mix(in srgb, ${palette.neutral950} 98%, ${palette.white})`
const lightSidebar = "oklch(95.7% 0 0)"

/** Semantic colours. Defaults are the light theme (`:root` in globals.css). */
export const colors = stylex.defineVars({
  background: lightBackground,
  foreground: palette.neutral900,
  card: lightCard,
  cardForeground: palette.neutral900,
  popover: palette.white,
  popoverForeground: palette.neutral900,
  primary: palette.brand,
  primaryForeground: palette.white,
  secondary: `rgb(0 0 0 / 8%)`,
  secondaryForeground: palette.neutral900,
  muted: `rgb(0 0 0 / 6%)`,
  mutedForeground: lightMutedForeground,
  accent: `rgb(0 0 0 / 8%)`,
  accentForeground: palette.neutral900,
  well: lightWell,
  chip: palette.white,
  chipHover: `rgb(0 0 0 / 6%)`,
  wellRaised: palette.white,
  field: lightField,
  keycap: palette.white,
  keycapBorder: lightKeycapBorder,
  border: `rgb(0 0 0 / 9%)`,
  input: `rgb(0 0 0 / 12%)`,
  ring: palette.brand,
  destructive: palette.red500,
  destructiveForeground: palette.red700,
  info: palette.blue500,
  infoForeground: palette.blue700,
  success: palette.emerald500,
  successForeground: palette.emerald700,
  warning: palette.amber500,
  warningForeground: palette.amber700,
  code: palette.white,
  codeForeground: palette.neutral900,
  codeHighlight: `rgb(0 0 0 / 6%)`,
  chart1: palette.brand,
  chart2: palette.emerald500,
  chart3: palette.violet500,
  chart4: palette.pink500,
  chart5: palette.amber500,
  sidebar: lightSidebar,
  sidebarForeground: `color-mix(in srgb, ${palette.neutral900} 64%, ${lightSidebar})`,
  sidebarPrimary: palette.brand,
  sidebarPrimaryForeground: palette.white,
  sidebarAccent: `rgb(0 0 0 / 8%)`,
  sidebarAccentForeground: palette.neutral900,
  sidebarBorder: `rgb(0 0 0 / 6%)`,
  sidebarRing: palette.brand,
  skeletonHighlight: `rgb(255 255 255 / 64%)`,
})

/** Dark theme (`.dark` in globals.css). Apply via `stylex.props(darkTheme)`. */
export const darkTheme = stylex.createTheme(colors, {
  background: darkBackground,
  foreground: palette.neutral100,
  card: darkCard,
  cardForeground: palette.neutral100,
  popover: darkPopover,
  popoverForeground: palette.neutral100,
  primary: palette.brand,
  primaryForeground: palette.white,
  secondary: `rgb(255 255 255 / 6%)`,
  secondaryForeground: palette.neutral100,
  muted: `rgb(255 255 255 / 5%)`,
  mutedForeground: palette.neutral450,
  accent: `rgb(255 255 255 / 6%)`,
  accentForeground: palette.neutral100,
  well: darkWell,
  chip: darkField,
  chipHover: darkChipHover,
  wellRaised: `rgb(255 255 255 / 10%)`,
  field: darkField,
  keycap: darkKeycap,
  keycapBorder: darkKeycapBorder,
  border: `rgb(255 255 255 / 8%)`,
  input: `rgb(255 255 255 / 9%)`,
  ring: palette.brand,
  destructive: `color-mix(in srgb, ${palette.red500} 90%, ${palette.white})`,
  destructiveForeground: palette.red400,
  info: palette.blue500,
  infoForeground: palette.blue400,
  success: palette.emerald500,
  successForeground: palette.emerald400,
  warning: palette.amber500,
  warningForeground: palette.amber400,
  code: darkPopover,
  codeForeground: palette.neutral100,
  codeHighlight: `rgb(255 255 255 / 5%)`,
  chart1: palette.brand,
  chart2: palette.emerald400,
  chart3: palette.violet400,
  chart4: palette.pink500,
  chart5: palette.amber400,
  sidebar: darkSidebar,
  sidebarForeground: `color-mix(in srgb, ${palette.neutral100} 70%, ${darkSidebar})`,
  sidebarPrimary: palette.brand,
  sidebarPrimaryForeground: palette.white,
  sidebarAccent: `rgb(255 255 255 / 6%)`,
  sidebarAccentForeground: palette.neutral100,
  sidebarBorder: `rgb(255 255 255 / 6%)`,
  sidebarRing: palette.brand,
  skeletonHighlight: `rgb(255 255 255 / 4%)`,
})

/**
 * Elevation shadows (`--shadow-raised` / `--shadow-overlay` in globals.css).
 * `raised` is for resting surfaces (cards), `overlay` for floating ones
 * (dialogs, popovers, menus). Both pair with the 1px top light inset the
 * components draw via their `::before` layer.
 */
export const shadows = stylex.defineVars({
  raised: "0 1px 2px rgb(0 0 0 / 6%), 0 12px 32px -12px rgb(0 0 0 / 14%)",
  overlay: "0 4px 12px rgb(0 0 0 / 8%), 0 32px 64px -16px rgb(0 0 0 / 20%)",
  sunken: "inset 0 1px 2px rgb(0 0 0 / 10%), inset 0 0 0 1px rgb(0 0 0 / 3%)",
  /**
   * 1px light edge drawn on a surface's ::before layer. Light theme lights
   * the bottom edge (shadow below), dark theme lights the top edge (light
   * from above) — the signature soft-emboss cue of the design language.
   */
  edge: "0 1px rgb(0 0 0 / 5%)",
  /** Inset highlight for solid (primary/destructive) raised controls. */
  emboss: "inset 0 1px rgb(255 255 255 / 16%)",
  /** Pressed-in replacement for `emboss`. */
  pressed: "inset 0 1px rgb(0 0 0 / 8%)",
  /**
   * Raised knob sitting in a sunken track (switch thumb). The knob is white in
   * both themes, so in dark it separates from the track by lightness alone and
   * barely needs a shadow; in light it is white-on-light-grey and the shadow is
   * the only thing holding it off the track.
   */
  thumb: "0 1px 2px rgb(0 0 0 / 18%), 0 0 0 1px rgb(0 0 0 / 5%)",
})

/** Dark elevation. Apply alongside `darkTheme`. */
export const darkShadows = stylex.createTheme(shadows, {
  raised: "0 1px 2px rgb(0 0 0 / 32%), 0 16px 40px -16px rgb(0 0 0 / 48%)",
  overlay: "0 4px 12px rgb(0 0 0 / 40%), 0 32px 64px -16px rgb(0 0 0 / 56%)",
  sunken: "inset 0 1px 2px rgb(0 0 0 / 48%), inset 0 0 0 1px rgb(255 255 255 / 2%)",
  edge: "0 -1px rgb(255 255 255 / 8%)",
  emboss: "inset 0 1px rgb(255 255 255 / 16%)",
  pressed: "inset 0 1px rgb(0 0 0 / 8%)",
  thumb: "0 1px 2px rgb(0 0 0 / 40%)",
})

/** Corner radii. globals.css derives every step from `--radius: 0.875rem`. */
export const radius = stylex.defineVars({
  sm: "0.525rem",
  md: "0.7rem",
  lg: "0.875rem",
  xl: "1.225rem",
  xxl: "1.575rem",
  xxxl: "1.925rem",
  xxxxl: "2.275rem",
  full: "9999px",
})

/** Spacing scale. */
export const spacing = stylex.defineVars({
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
})

/** Type scale. */
export const text = stylex.defineVars({
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  xxxl: "2.25rem",
})

/**
 * Compile-time constants (inlined, not CSS variables). `sm` matches
 * Tailwind v4's `sm:` breakpoint; the components are authored mobile-first
 * and tighten up at `sm` and above.
 */
export const consts = stylex.defineConsts({
  sm: "@media (width >= 40rem)",
  pointerCoarse: "@media (pointer: coarse)",
  pointerFine: "@media (pointer: fine)",
})

export const font = stylex.defineVars({
  heading: '"Inter Variable", system-ui, sans-serif',
  mono: '"JetBrains Mono Variable", monospace',
  sans: '"Inter Variable", system-ui, sans-serif',
  weightBold: "700",
  weightNormal: "400",
})
