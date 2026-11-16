import * as stylex from "@stylexjs/stylex"

/** Exclusive width ranges of a filter toolbar, so its rules never compete. */
export const filterContainers = stylex.defineConsts({
  narrow: "@container (width < 36rem)",
  medium: "@container (36rem <= width < 42rem)",
  wide: "@container (width >= 42rem)",
})
