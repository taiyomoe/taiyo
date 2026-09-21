import * as stylex from "@stylexjs/stylex"

/**
 * The "scene" palette — the fixed dark world shared by the auth screen and the
 * landing page: a night-brown ground, warm paper text, and the sunrise ramp
 * from brand red through ember and gold to a pale core.
 *
 * Deliberately NOT part of @taiyomoe/ui's semantic tokens. Those flip with the
 * theme; the scene is always night, in both themes, on purpose — it is brand
 * artwork, not a surface. Layout, radii and type still come from the real
 * tokens, so only colour lives here.
 */
export const scene = stylex.defineVars({
  /** Page ground. Matches the `theme-color` meta in __root.tsx. */
  night: "#120a07",
  /** One step down — footer, scrollbar track. */
  nightDeep: "#0d0705",
  /** One step up — banded sections that need to separate from the ground. */
  nightRaised: "#1a0d08",
  /** Warm off-white. Pure white reads cold against the sun. */
  paper: "#fffcf8",
  /** Text colour ON the sun gradient — a dark brown, not black. */
  ink: "#2a1208",
  brand: "#f2452d",
  ember: "#fb6e54",
  gold: "#ffb820",
  goldLight: "#ffc94d",
  goldPale: "#ffe3a0",
})

/**
 * The scene's display face. The design system is Inter everywhere on purpose;
 * the landing page is the one surface that pairs it with a serif, the way the
 * mockup stages it. Loaded in apps/web/src/styles.css.
 */
export const sceneFont = stylex.defineVars({
  display: '"PT Serif", Georgia, "Times New Roman", serif',
})
