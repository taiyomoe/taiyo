import * as stylex from "@stylexjs/stylex"
import { palette, surface } from "./palette.stylex"

/**
 * The design system's semantic tokens: the variables every component reads.
 *
 * Raw values live in `./palette.stylex`, the dark overrides in `./themes`.
 * This file holds nothing but `defineVars`/`defineConsts` results, because
 * that is all a `*.stylex.ts` file may export — StyleX's own rule, enforced by
 * `@stylexjs/enforce-extension`.
 *
 * `./globals.css` mirrors the handful of these that `./structural.css` needs
 * to read from plain CSS — change a value here and change it there too.
 *
 * The visual language is a soft dark "charcoal stack": layered surfaces that
 * step up in lightness (background -> card -> popover), hairline borders at
 * white/8%, wide soft drop shadows, and the Taiyo brand red as the single
 * accent for actions, controls, focus and charts.
 */
/** Semantic colours. The defaults are the light theme. */
export const colors = stylex.defineVars({
  background: surface.lightBackground,
  foreground: palette.neutral900,
  card: surface.lightCard,
  cardForeground: palette.neutral900,
  popover: palette.white,
  popoverForeground: palette.neutral900,
  primary: palette.brand,
  primaryForeground: palette.white,
  secondary: `rgb(0 0 0 / 8%)`,
  secondaryForeground: palette.neutral900,
  muted: `rgb(0 0 0 / 6%)`,
  mutedForeground: surface.lightMutedForeground,
  accent: `rgb(0 0 0 / 8%)`,
  accentForeground: palette.neutral900,
  well: surface.lightWell,
  chip: palette.white,
  chipHover: `rgb(0 0 0 / 6%)`,
  wellRaised: palette.white,
  field: surface.lightField,
  keycap: palette.white,
  keycapBorder: surface.lightKeycapBorder,
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
  sidebar: surface.lightSidebar,
  sidebarForeground: `color-mix(in srgb, ${palette.neutral900} 64%, ${surface.lightSidebar})`,
  sidebarPrimary: palette.brand,
  sidebarPrimaryForeground: palette.white,
  sidebarAccent: `rgb(0 0 0 / 8%)`,
  sidebarAccentForeground: palette.neutral900,
  sidebarBorder: `rgb(0 0 0 / 6%)`,
  sidebarRing: palette.brand,
  skeletonHighlight: `rgb(255 255 255 / 64%)`,
})

/**
 * Elevation shadows. `raised` is for resting surfaces (cards), `overlay` for
 * floating ones
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

/** Corner radii. Every step is derived from a 0.875rem base. */
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
 * Compile-time constants (inlined, not CSS variables). Components are authored
 * mobile-first and tighten up at `sm` and above.
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
