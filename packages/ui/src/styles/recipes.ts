import * as stylex from "@stylexjs/stylex"

import { colors, consts, motion, shadows } from "./tokens.stylex"

export const surface = stylex.create({
  raisedEdge: {
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
})

export const tap = stylex.create({
  target: {
    "::after": {
      content: {
        default: "none",
        [consts.pointerCoarse]: '""',
      },
      position: "absolute",
      height: "100%",
      minHeight: "2.75rem",
      minWidth: "2.75rem",
      width: "100%",
    },
  },
})

export const focus = stylex.create({
  control: {
    outlineColor: colors.ring,
    outlineOffset: 1,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
  },
  field: {
    outlineColor: `color-mix(in srgb, ${colors.ring} 24%, transparent)`,
    outlineStyle: {
      default: "none",
      ":focus-within": "solid",
    },
    outlineWidth: 3,
  },
})

export const a11y = stylex.create({
  srOnly: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: "1px",
    width: "1px",
  },
})

export const transitions = stylex.create({
  popup: {
    opacity: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default: null,
    },
    scale: {
      "[data-ending-style]": "0.96",
      "[data-starting-style]": "0.96",
      default: null,
    },
    transformOrigin: "var(--transform-origin)",
    transitionDuration: {
      "[data-ending-style]": motion.exit,
      default: motion.enter,
    },
    transitionProperty: "opacity, scale",
    transitionTimingFunction: motion.easeOut,
  },
  chevronFlip: {
    rotate: {
      default: "0deg",
      [stylex.when.ancestor("[data-popup-open]")]: "180deg",
    },
    transitionDuration: motion.enter,
    transitionProperty: "rotate",
    transitionTimingFunction: motion.easeOut,
  },
  chevronTurn: {
    opacity: {
      default: 0.8,
      [stylex.when.ancestor("[data-popup-open]")]: 1,
    },
    rotate: {
      default: "0deg",
      [stylex.when.ancestor("[data-popup-open]")]: "90deg",
    },
    transitionDuration: motion.enter,
    transitionProperty: "rotate, opacity",
    transitionTimingFunction: motion.easeOut,
  },
})
