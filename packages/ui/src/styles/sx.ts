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

/**
 * Teaches TypeScript about the `sx` prop on host elements.
 *
 * The StyleX compiler rewrites `<div sx={styles.x} />` into
 * `<div {...stylex.props(styles.x)} />` for any lowercase JSX element — that
 * is the `sxPropName` option, which defaults to `"sx"`. It ships no types for
 * it, so without this augmentation every such element is a type error.
 *
 * `DOMAttributes` is the narrowest shared ancestor of both `HTMLAttributes`
 * and `SVGAttributes`, so one declaration covers `<div>` and `<svg>` alike.
 * Our own components declare `sx` on their own props; this is only for the
 * host elements underneath them.
 */
declare module "react" {
  interface DOMAttributes<T> {
    sx?: Sx
  }
}
