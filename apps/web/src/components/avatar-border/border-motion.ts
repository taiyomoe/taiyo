import * as stylex from "@stylexjs/stylex"
import { consts } from "@taiyomoe/ui/styles/tokens.stylex"

const spin = stylex.keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
})
const spinBack = stylex.keyframes({
  "0%": { transform: "rotate(360deg)" },
  "100%": { transform: "rotate(0deg)" },
})
const breathe = stylex.keyframes({
  "0%, 100%": { opacity: 0.45 },
  "50%": { opacity: 1 },
})
const twinkle = stylex.keyframes({
  "0%, 100%": { opacity: 0.1, transform: "scale(0.4)" },
  "50%": { opacity: 1, transform: "scale(1)" },
})
const flicker = stylex.keyframes({
  "0%, 100%": { transform: "scale(1, 1)" },
  "30%": { transform: "scale(0.9, 1.22)" },
  "55%": { transform: "scale(1.06, 0.86)" },
  "80%": { transform: "scale(0.95, 1.1)" },
})
const sway = stylex.keyframes({
  "0%, 100%": { transform: "rotate(-14deg)" },
  "50%": { transform: "rotate(14deg)" },
})
const travel = stylex.keyframes({
  "0%": { strokeDashoffset: 0 },
  "100%": { strokeDashoffset: -333 },
})
const rise = stylex.keyframes({
  "0%": { opacity: 0, transform: "translateY(0)" },
  "25%": { opacity: 1 },
  "100%": { opacity: 0, transform: "translateY(-14px)" },
})
const loop = {
  animationIterationCount: "infinite",
} as const

export const borderMotion = stylex.create({
  spin: (duration: string) => ({
    ...loop,
    animationDuration: duration,
    animationName: { default: spin, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    transformBox: "view-box",
    transformOrigin: "68px 68px",
  }),
  spinBack: (duration: string) => ({
    ...loop,
    animationDuration: duration,
    animationName: { default: spinBack, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    transformBox: "view-box",
    transformOrigin: "68px 68px",
  }),
  breathe: (duration: string, delay: string) => ({
    ...loop,
    animationDelay: delay,
    animationDuration: duration,
    animationName: { default: breathe, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-in-out",
  }),
  twinkle: (duration: string, delay: string) => ({
    ...loop,
    animationDelay: delay,
    animationDuration: duration,
    animationName: { default: twinkle, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-in-out",
    transformBox: "fill-box",
    transformOrigin: "center",
  }),
  flicker: (duration: string, delay: string) => ({
    ...loop,
    animationDelay: delay,
    animationDuration: duration,
    animationName: { default: flicker, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-in-out",
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
  }),
  sway: (duration: string, delay: string) => ({
    ...loop,
    animationDelay: delay,
    animationDuration: duration,
    animationName: { default: sway, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-in-out",
    transformBox: "fill-box",
    transformOrigin: "center",
  }),
  travel: (duration: string) => ({
    ...loop,
    animationDuration: duration,
    animationName: { default: travel, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
  }),
  rise: (duration: string, delay: string) => ({
    ...loop,
    animationDelay: delay,
    animationDuration: duration,
    animationName: { default: rise, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-out",
  }),
})
