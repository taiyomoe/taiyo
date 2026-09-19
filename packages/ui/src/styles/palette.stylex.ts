import * as stylex from "@stylexjs/stylex"

/**
 * The design system's raw colour values, and the single source of truth for
 * them. Nothing here is a token: these are the literals that `./tokens.stylex`
 * turns into semantic variables and `./themes` overrides for dark, kept in one
 * place so the two themes provably draw on the same palette.
 *
 * They are `defineConsts`, not `defineVars`: the compiler inlines them at
 * build time rather than emitting CSS custom properties, so the palette has no
 * runtime presence and cannot be re-themed — only the semantic tokens can.
 * That is also what lets them cross a module boundary at all; a plain exported
 * `const` is rejected with "Only static values are allowed".
 */
export const palette = stylex.defineConsts({
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
})

/**
 * The elevation stack, one entry per surface, for both themes.
 *
 * Light is derived from dark rather than designed separately, because the two
 * have to BEHAVE the same: elevation always moves toward the light source.
 * Dark stacks up from a near-black page (bg 12 -> well 25 -> field 27 ->
 * card 30 -> popover 32 -> keycap 49, in 8-bit grey); light mirrors that
 * ordering, stacking up from a soft grey page toward white (236 -> well 231 ->
 * field 250 -> card 253 -> popover 255). The light page therefore CANNOT be
 * near-white: without headroom below white, a white card has nothing to rise
 * above — which is why `lightBackground` is a soft grey, not neutral100.
 *
 * Surfaces stay OPAQUE in both themes. A black-alpha value looks different
 * depending on what it sits on — `well` as `rgb(0 0 0 / 8%)` was nearly
 * invisible on a white popover and heavy on the page. Alpha is fine for
 * `muted`/`accent`/`border`, which are deliberately surface-relative; it is
 * wrong for anything that is a step in this stack.
 */
export const surface = stylex.defineConsts({
  lightBackground: "oklch(94.2% 0 0)",
  lightCard: "oklch(99.3% 0 0)",
  lightField: "oklch(98.4% 0 0)",
  lightWell: "oklch(92.7% 0 0)",
  /**
   * Raised in light means lighter, so the keycap is white and its separation
   * is carried by a DARKER hairline — the mirror image of dark, where the cap
   * is lighter than the field and the hairline lighter still.
   */
  lightKeycapBorder: "oklch(88.7% 0 0)",
  /**
   * Matched to the dark muted grey by contrast ratio against its own
   * background (5.8:1), not by picking a palette step.
   */
  lightMutedForeground: "oklch(47.7% 0 0)",
  lightSidebar: "oklch(95.7% 0 0)",
  darkBackground: `color-mix(in srgb, ${palette.neutral950} 99%, ${palette.white})`,
  darkCard: `color-mix(in srgb, ${palette.neutral950} 92%, ${palette.white})`,
  darkPopover: `color-mix(in srgb, ${palette.neutral950} 91%, ${palette.white})`,
  darkWell: `color-mix(in srgb, ${palette.neutral950} 94%, ${palette.white})`,
  darkField: `color-mix(in srgb, ${palette.neutral950} 93%, ${palette.white})`,
  /**
   * Keycap chips read as a lighter fill with an even lighter hairline border:
   * measured off the reference, the fill sits ~22 luminance above the field
   * and the border ~28 above the fill.
   */
  darkKeycap: `color-mix(in srgb, ${palette.neutral950} 84%, ${palette.white})`,
  darkKeycapBorder: `color-mix(in srgb, ${palette.neutral950} 72%, ${palette.white})`,
  darkChipHover: `color-mix(in srgb, ${palette.neutral950} 89%, ${palette.white})`,
  darkSidebar: `color-mix(in srgb, ${palette.neutral950} 98%, ${palette.white})`,
})
