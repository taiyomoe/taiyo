import * as stylex from "@stylexjs/stylex"
import { palette, surface } from "./palette.stylex"
import { colors, shadows } from "./tokens.stylex"

/**
 * The dark theme, as one `createTheme` override per variable group.
 *
 * Themes live outside `*.stylex.ts` files: those may only export variable and
 * constant definitions. Apply both of these together, on the same element:
 *
 *     stylex.props(darkTheme, darkShadows)
 *
 * Both apps put them on `<html>`, so components rendered into portals inherit
 * the dark tokens too, next to the `dark` class that drives the plain CSS
 * custom properties in `./globals.css`.
 *
 * Do NOT reach for `createTheme` to re-point a single token for a subtree: the
 * class it emits redeclares the whole group, so every value you did not
 * override is reset to its default — the light theme — under that element.
 */
/** Dark theme. Apply via `stylex.props(darkTheme)`, alongside `darkShadows`. */
export const darkTheme = stylex.createTheme(colors, {
  background: surface.darkBackground,
  foreground: palette.neutral100,
  card: surface.darkCard,
  cardForeground: palette.neutral100,
  popover: surface.darkPopover,
  popoverForeground: palette.neutral100,
  primary: palette.brand,
  primaryForeground: palette.white,
  secondary: `rgb(255 255 255 / 6%)`,
  secondaryForeground: palette.neutral100,
  muted: `rgb(255 255 255 / 5%)`,
  mutedForeground: palette.neutral450,
  accent: `rgb(255 255 255 / 6%)`,
  accentForeground: palette.neutral100,
  well: surface.darkWell,
  chip: surface.darkField,
  chipHover: surface.darkChipHover,
  wellRaised: `rgb(255 255 255 / 10%)`,
  field: surface.darkField,
  keycap: surface.darkKeycap,
  keycapBorder: surface.darkKeycapBorder,
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
  code: surface.darkPopover,
  codeForeground: palette.neutral100,
  codeHighlight: `rgb(255 255 255 / 5%)`,
  chart1: palette.brand,
  chart2: palette.emerald400,
  chart3: palette.violet400,
  chart4: palette.pink500,
  chart5: palette.amber400,
  sidebar: surface.darkSidebar,
  sidebarForeground: `color-mix(in srgb, ${palette.neutral100} 70%, ${surface.darkSidebar})`,
  sidebarPrimary: palette.brand,
  sidebarPrimaryForeground: palette.white,
  sidebarAccent: `rgb(255 255 255 / 6%)`,
  sidebarAccentForeground: palette.neutral100,
  sidebarBorder: `rgb(255 255 255 / 6%)`,
  sidebarRing: palette.brand,
  skeletonHighlight: `rgb(255 255 255 / 4%)`,
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
