import * as stylex from "@stylexjs/stylex"

/**
 * StyleX design tokens.
 *
 * These mirror the scale packages/ui currently expresses through Tailwind
 * utilities, and are the target the Tailwind theme in
 * packages/ui/src/styles/globals.css migrates onto.
 *
 * The `.stylex.ts` extension is required: StyleX only resolves variables
 * across module boundaries from files with that suffix, and the
 * @stylexjs/enforce-extension lint rule enforces it.
 */
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

export const font = stylex.defineVars({
  weightNormal: "400",
  weightBold: "700",
})
