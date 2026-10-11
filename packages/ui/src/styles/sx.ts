import type * as stylex from "@stylexjs/stylex"

export type Sx = stylex.StyleXArray<
  | null
  | undefined
  | boolean
  | stylex.CompiledStyles
  | Readonly<[stylex.CompiledStyles, stylex.InlineStyles]>
>

declare module "react" {
  interface DOMAttributes<T> {
    sx?: Sx
  }
}
