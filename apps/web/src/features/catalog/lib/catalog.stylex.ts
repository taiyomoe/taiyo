import * as stylex from "@stylexjs/stylex"

/** Exclusive width ranges of the catalog tables, so their rules never compete. */
export const catalogContainers = stylex.defineConsts({
  narrow: "@container (width < 36rem)",
  medium: "@container (36rem <= width < 42rem)",
  wide: "@container (width >= 42rem)",
})
