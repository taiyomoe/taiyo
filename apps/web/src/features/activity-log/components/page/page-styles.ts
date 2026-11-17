import * as stylex from "@stylexjs/stylex"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"

export const pageStyles = stylex.create({
  stale: {
    opacity: {
      '[aria-busy="true"]': 0.6,
      default: 1,
    },
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
  },
  /** What fills the results frame instead of the table, like the empty state of a catalog table. */
  panel: {
    borderColor: colors.border,
    borderRadius: `calc(${radius.xxl} - 0.25rem)`,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: colors.card,
  },
})
