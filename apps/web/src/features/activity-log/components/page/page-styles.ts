import * as stylex from "@stylexjs/stylex"
import { motion } from "@taiyomoe/ui/styles/tokens.stylex"

export const pageStyles = stylex.create({
  stale: {
    opacity: {
      '[aria-busy="true"]': 0.6,
      default: 1,
    },
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
  },
})
