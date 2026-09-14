import type * as stylex from "@stylexjs/stylex"

/**
 * Type of the `sx` prop every component in this package accepts.
 *
 * StyleX ships `stylex.StyleXStyles` for exactly this, but that type rejects
 * any compiled style whose pseudo-element layer carries conditions, e.g.
 *
 *     "::before": { boxShadow: { default: "none", ":first-child": edge } }
 *
 * The compiler emits that happily (`.cls:first-child::before { … }`) and the
 * joined toggle groups, cards and fields here depend on it, so `sx` is typed
 * with the same shape `stylex.props()` itself accepts instead. The trade-off
 * is that a malformed object reaches `stylex.props()` before it is rejected,
 * which is the lesser problem: the precise type rejects valid styles.
 */
export type Sx = stylex.StyleXArray<
  | null
  | undefined
  | boolean
  | stylex.CompiledStyles
  | Readonly<[stylex.CompiledStyles, stylex.InlineStyles]>
>
