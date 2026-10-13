import * as stylex from "@stylexjs/stylex"
import { palette, surface } from "./palette.stylex"

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
  skeleton: `rgb(0 0 0 / 6%)`,
  skeletonHighlight: `rgb(255 255 255 / 64%)`,
})

export const shadows = stylex.defineVars({
  raised: "0 1px 2px rgb(0 0 0 / 6%), 0 12px 32px -12px rgb(0 0 0 / 14%)",
  overlay: "0 4px 12px rgb(0 0 0 / 8%), 0 32px 64px -16px rgb(0 0 0 / 20%)",
  sunken: "inset 0 1px 2px rgb(0 0 0 / 10%), inset 0 0 0 1px rgb(0 0 0 / 3%)",
  edge: "0 1px rgb(0 0 0 / 5%)",
  chip: "0 1px 2px 0 rgb(0 0 0 / 5%)",
  emboss: "inset 0 1px rgb(255 255 255 / 16%)",
  pressed: "inset 0 1px rgb(0 0 0 / 8%)",
  thumb: "0 1px 2px rgb(0 0 0 / 18%), 0 0 0 1px rgb(0 0 0 / 5%)",
})

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

export const spacing = stylex.defineVars({
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
})

export const text = stylex.defineVars({
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  xxxl: "2.25rem",
})

export const consts = stylex.defineConsts({
  sm: "@media (width >= 40rem)",
  pointerCoarse: "@media (pointer: coarse)",
  pointerFine: "@media (pointer: fine)",
})

export const motion = stylex.defineConsts({
  easeOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  enter: "180ms",
  exit: "120ms",
  enterLarge: "240ms",
  exitLarge: "160ms",
  slide: "300ms",
})

export const font = stylex.defineVars({
  heading: '"Inter Variable", system-ui, sans-serif',
  mono: '"JetBrains Mono Variable", monospace',
  sans: '"Inter Variable", system-ui, sans-serif',
  weightBold: "700",
  weightNormal: "400",
})
