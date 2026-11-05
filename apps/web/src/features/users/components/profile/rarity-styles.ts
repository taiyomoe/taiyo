import * as stylex from "@stylexjs/stylex"
import { colors, consts } from "@taiyomoe/ui/styles/tokens.stylex"

const shine = stylex.keyframes({
  "0%": { backgroundPosition: "200% 0" },
  "100%": { backgroundPosition: "-200% 0" },
})

export const RARITY_STYLES = stylex.create({
  common: {
    borderColor: `color-mix(in srgb, ${colors.foreground} 14%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 6%, transparent)`,
    color: colors.mutedForeground,
  },
  rare: {
    borderColor: "color-mix(in srgb, #0ea5e9 38%, transparent)",
    backgroundColor: "color-mix(in srgb, #0ea5e9 14%, transparent)",
    color: `color-mix(in srgb, #0284c7 70%, ${colors.foreground})`,
  },
  epic: {
    borderColor: "color-mix(in srgb, #a855f7 40%, transparent)",
    backgroundColor: "color-mix(in srgb, #a855f7 14%, transparent)",
    color: `color-mix(in srgb, #9333ea 72%, ${colors.foreground})`,
  },
  legendary: {
    borderColor: "color-mix(in srgb, #f59e0b 55%, transparent)",
    animationDuration: "6s",
    animationIterationCount: "infinite",
    animationName: { default: shine, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    backgroundColor: "color-mix(in srgb, #f59e0b 16%, transparent)",
    backgroundImage:
      "linear-gradient(110deg, transparent 35%, rgb(255 255 255 / 28%) 50%, transparent 65%)",
    backgroundSize: "200% 100%",
    boxShadow: "0 0 12px -4px rgb(245 158 11 / 60%)",
    color: `color-mix(in srgb, #d97706 72%, ${colors.foreground})`,
  },
})
