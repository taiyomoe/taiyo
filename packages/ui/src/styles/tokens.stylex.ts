import * as stylex from "@stylexjs/stylex"

/**
 * StyleX port of the design tokens in ./globals.css.
 *
 * The Tailwind theme derives its semantic colours from Tailwind's built-in
 * palette (`var(--color-neutral-800)` and friends). StyleX has no access to
 * that palette, so the raw values are inlined here from tailwindcss/theme.css
 * (v4.3.0) and kept in one place so the relationship stays visible.
 *
 * `--alpha(var(--color-black) / 4%)` and `color-mix(...)` are emitted as plain
 * CSS: StyleX passes value strings through untouched.
 */
const palette = {
  black: "#000",
  white: "#fff",
  neutral50: "oklch(98.5% 0 0)",
  neutral100: "oklch(97% 0 0)",
  neutral400: "oklch(70.8% 0 0)",
  neutral500: "oklch(55.6% 0 0)",
  neutral800: "oklch(26.9% 0 0)",
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
  orange600: "oklch(64.6% 0.222 41.116)",
  teal600: "oklch(60% 0.118 184.704)",
  cyan900: "oklch(39.8% 0.07 227.392)",
  purple500: "oklch(62.7% 0.265 303.9)",
  rose500: "oklch(64.5% 0.246 16.439)",
}
const lightBackground = palette.white
const darkBackground = `color-mix(in srgb, ${palette.neutral950} 95%, ${palette.white})`
const darkSidebar = `color-mix(in srgb, ${palette.neutral950} 97%, ${palette.white})`
const lightSidebar = palette.neutral50

/** Semantic colours. Defaults are the light theme (`:root` in globals.css). */
export const colors = stylex.defineVars({
  background: lightBackground,
  foreground: palette.neutral800,
  card: palette.white,
  cardForeground: palette.neutral800,
  popover: palette.white,
  popoverForeground: palette.neutral800,
  primary: palette.neutral800,
  primaryForeground: palette.neutral50,
  secondary: `rgb(0 0 0 / 4%)`,
  secondaryForeground: palette.neutral800,
  muted: `rgb(0 0 0 / 4%)`,
  mutedForeground: `color-mix(in srgb, ${palette.neutral500} 90%, ${palette.black})`,
  accent: `rgb(0 0 0 / 4%)`,
  accentForeground: palette.neutral800,
  border: `rgb(0 0 0 / 8%)`,
  input: `rgb(0 0 0 / 10%)`,
  ring: palette.neutral400,
  destructive: palette.red500,
  destructiveForeground: palette.red700,
  info: palette.blue500,
  infoForeground: palette.blue700,
  success: palette.emerald500,
  successForeground: palette.emerald700,
  warning: palette.amber500,
  warningForeground: palette.amber700,
  code: palette.white,
  codeForeground: palette.neutral800,
  codeHighlight: `rgb(0 0 0 / 4%)`,
  chart1: palette.orange600,
  chart2: palette.teal600,
  chart3: palette.cyan900,
  chart4: palette.amber400,
  chart5: palette.amber500,
  sidebar: lightSidebar,
  sidebarForeground: `color-mix(in srgb, ${palette.neutral800} 64%, ${lightSidebar})`,
  sidebarPrimary: palette.neutral800,
  sidebarPrimaryForeground: palette.neutral50,
  sidebarAccent: `rgb(0 0 0 / 4%)`,
  sidebarAccentForeground: palette.neutral800,
  sidebarBorder: `rgb(0 0 0 / 6%)`,
  sidebarRing: palette.neutral400,
  skeletonHighlight: `rgb(255 255 255 / 64%)`,
})

/** Dark theme (`.dark` in globals.css). Apply via `stylex.props(darkTheme)`. */
export const darkTheme = stylex.createTheme(colors, {
  background: darkBackground,
  foreground: palette.neutral100,
  card: `color-mix(in srgb, ${darkBackground} 98%, ${palette.white})`,
  cardForeground: palette.neutral100,
  popover: `color-mix(in srgb, ${darkBackground} 98%, ${palette.white})`,
  popoverForeground: palette.neutral100,
  primary: palette.neutral100,
  primaryForeground: palette.neutral800,
  secondary: `rgb(255 255 255 / 4%)`,
  secondaryForeground: palette.neutral100,
  muted: `rgb(255 255 255 / 4%)`,
  mutedForeground: `color-mix(in srgb, ${palette.neutral500} 90%, ${palette.white})`,
  accent: `rgb(255 255 255 / 4%)`,
  accentForeground: palette.neutral100,
  border: `rgb(255 255 255 / 6%)`,
  input: `rgb(255 255 255 / 8%)`,
  ring: palette.neutral500,
  destructive: `color-mix(in srgb, ${palette.red500} 90%, ${palette.white})`,
  destructiveForeground: palette.red400,
  info: palette.blue500,
  infoForeground: palette.blue400,
  success: palette.emerald500,
  successForeground: palette.emerald400,
  warning: palette.amber500,
  warningForeground: palette.amber400,
  code: `color-mix(in srgb, ${darkBackground} 98%, ${palette.white})`,
  codeForeground: palette.neutral100,
  codeHighlight: `rgb(255 255 255 / 4%)`,
  chart1: palette.blue700,
  chart2: palette.emerald500,
  chart3: palette.amber500,
  chart4: palette.purple500,
  chart5: palette.rose500,
  sidebar: darkSidebar,
  sidebarForeground: `color-mix(in srgb, ${palette.neutral100} 64%, ${darkSidebar})`,
  sidebarPrimary: palette.neutral100,
  sidebarPrimaryForeground: palette.neutral800,
  sidebarAccent: `rgb(255 255 255 / 4%)`,
  sidebarAccentForeground: palette.neutral100,
  sidebarBorder: `rgb(255 255 255 / 5%)`,
  sidebarRing: palette.neutral400,
  skeletonHighlight: `rgb(255 255 255 / 4%)`,
})

/** Corner radii. globals.css derives every step from `--radius: 0.8rem`. */
export const radius = stylex.defineVars({
  sm: "0.48rem",
  md: "0.64rem",
  lg: "0.8rem",
  xl: "1.12rem",
  xxl: "1.44rem",
  xxxl: "1.76rem",
  xxxxl: "2.08rem",
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

export const font = stylex.defineVars({
  heading: '"PT Serif", serif',
  mono: '"JetBrains Mono", monospace',
  sans: '"Plus Jakarta Sans", sans-serif',
  weightBold: "700",
  weightNormal: "400",
})
