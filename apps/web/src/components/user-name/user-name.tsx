import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { isNameEffect, type NameEffect } from "@taiyomoe/db/cosmetics"
import { colors, consts } from "@taiyomoe/ui/styles/tokens.stylex"

const flow = stylex.keyframes({
  "0%": { backgroundPosition: "0% 50%" },
  "100%": { backgroundPosition: "200% 50%" },
})
const sweep = stylex.keyframes({
  "0%": { backgroundPosition: "180% 0" },
  "55%": { backgroundPosition: "-80% 0" },
  "100%": { backgroundPosition: "-80% 0" },
})
const rise = stylex.keyframes({
  "0%": { backgroundPosition: "50% 100%" },
  "100%": { backgroundPosition: "50% 0%" },
})
const drift = stylex.keyframes({
  "0%": { backgroundPosition: "0 0, 0 0, 0 0, 0% 50%" },
  "100%": { backgroundPosition: "-48px 12px, 36px -18px, -24px -30px, 200% 50%" },
})
const pulse = stylex.keyframes({
  "0%, 100%": {
    textShadow: "0 0 6px rgb(244 63 94 / 35%), 0 0 18px rgb(225 29 72 / 15%)",
  },
  "50%": {
    textShadow: "0 0 10px rgb(244 63 94 / 65%), 0 0 26px rgb(225 29 72 / 40%)",
  },
})
const flicker = stylex.keyframes({
  "0%, 18%, 22%, 25%, 53%, 57%, 100%": {
    opacity: 1,
    textShadow:
      "0 0 2px rgb(255 255 255 / 70%), 0 0 8px rgb(217 70 239 / 90%), 0 0 18px rgb(217 70 239 / 60%), 0 0 32px rgb(162 28 175 / 50%)",
  },
  "20%, 24%, 55%": { opacity: 0.55, textShadow: "none" },
})
const glitch = stylex.keyframes({
  "0%, 86%, 100%": {
    textShadow: "-1px 0 rgb(255 0 76 / 70%), 1px 0 rgb(0 229 255 / 70%)",
    transform: "translate(0)",
  },
  "88%": {
    textShadow: "-3px 0 rgb(255 0 76 / 90%), 3px 0 rgb(0 229 255 / 90%)",
    transform: "translate(1px, -1px) skewX(-8deg)",
  },
  "90%": {
    textShadow: "3px 0 rgb(255 0 76 / 90%), -3px 0 rgb(0 229 255 / 90%)",
    transform: "translate(-2px, 1px) skewX(6deg)",
  },
  "92%": {
    textShadow: "-2px 1px rgb(255 0 76 / 90%), 2px -1px rgb(0 229 255 / 90%)",
    transform: "translate(1px, 0)",
  },
  "94%": {
    textShadow: "-1px 0 rgb(255 0 76 / 70%), 1px 0 rgb(0 229 255 / 70%)",
    transform: "translate(0)",
  },
})
const ember = stylex.keyframes({
  "0%, 100%": { filter: "drop-shadow(0 0 3px rgb(249 115 22 / 45%))" },
  "40%": { filter: "drop-shadow(0 0 6px rgb(249 115 22 / 70%))" },
  "70%": { filter: "drop-shadow(0 0 2px rgb(249 115 22 / 35%))" },
})
const opal = stylex.keyframes({
  "0%": {
    backgroundPosition: "0% 50%",
    filter: "hue-rotate(0deg) drop-shadow(0 0 6px rgb(167 243 208 / 35%))",
  },
  "50%": {
    backgroundPosition: "100% 50%",
    filter: "hue-rotate(40deg) drop-shadow(0 0 9px rgb(196 181 253 / 45%))",
  },
  "100%": {
    backgroundPosition: "0% 50%",
    filter: "hue-rotate(0deg) drop-shadow(0 0 6px rgb(167 243 208 / 35%))",
  },
})
const gradientText = {
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  // Keeps the clipped background painting across wrapped lines.
  WebkitBoxDecorationBreak: "clone",
  boxDecorationBreak: "clone",
} as const
const styles = stylex.create({
  base: {
    fontWeight: "inherit",
  },
  styled: {
    fontWeight: 650,
  },
  sunrise: {
    ...gradientText,
    backgroundImage: "linear-gradient(90deg, #f59e0b, #f97316 45%, #f43f5e)",
  },
  crimson: {
    animationDuration: "2.8s",
    animationIterationCount: "infinite",
    animationName: { default: pulse, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-in-out",
    color: "#e11d48",
  },
  azure: {
    ...gradientText,
    backgroundImage: "linear-gradient(90deg, #2563eb, #0ea5e9 55%, #06b6d4)",
    filter: "drop-shadow(0 0 6px rgb(14 165 233 / 35%))",
  },
  jade: {
    ...gradientText,
    backgroundImage: "linear-gradient(90deg, #059669, #10b981 50%, #65a30d)",
    filter: "drop-shadow(0 0 6px rgb(16 185 129 / 30%))",
  },
  ember: {
    ...gradientText,
    animationDuration: "1.6s",
    animationIterationCount: "infinite",
    animationName: { default: ember, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-in-out",
    backgroundImage: "linear-gradient(90deg, #ea580c, #f59e0b 50%, #dc2626)",
  },
  tide: {
    ...gradientText,
    animationDuration: "5s",
    animationIterationCount: "infinite",
    animationName: { default: flow, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    backgroundImage: "linear-gradient(90deg, #0d9488, #0284c7, #14b8a6, #0d9488)",
    backgroundSize: "200% 100%",
  },
  sakura: {
    ...gradientText,
    backgroundImage: "linear-gradient(90deg, #db2777, #f472b6 40%, #fb7185 70%, #ec4899)",
    filter: "drop-shadow(0 0 6px rgb(244 114 182 / 40%))",
  },
  frost: {
    ...gradientText,
    animationDuration: "3.6s",
    animationIterationCount: "infinite",
    animationName: { default: sweep, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-in-out",
    backgroundColor: "#0ea5e9",
    backgroundImage:
      "linear-gradient(105deg, transparent 30%, rgb(255 255 255 / 85%) 48%, transparent 66%), linear-gradient(90deg, #0284c7, #38bdf8 50%, #0891b2)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "250% 100%, 100% 100%",
    filter: "drop-shadow(0 0 5px rgb(56 189 248 / 45%))",
  },
  gold: {
    ...gradientText,
    animationDuration: "3.2s",
    animationIterationCount: "infinite",
    animationName: { default: flow, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    backgroundImage:
      "linear-gradient(100deg, #92400e 0%, #d97706 20%, #fcd34d 38%, #fffbeb 46%, #fbbf24 54%, #b45309 75%, #d97706 100%)",
    backgroundSize: "200% 100%",
    filter: "drop-shadow(0 1px 0 rgb(120 53 15 / 35%))",
  },
  neon: {
    animationDuration: "4s",
    animationIterationCount: "infinite",
    animationName: { default: flicker, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    color: "#d946ef",
  },
  aurora: {
    ...gradientText,
    animationDuration: "8s",
    animationIterationCount: "infinite",
    animationName: { default: flow, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    backgroundImage: "linear-gradient(90deg, #06b6d4, #8b5cf6, #10b981, #3b82f6, #06b6d4)",
    backgroundSize: "300% 100%",
    filter: "drop-shadow(0 0 8px rgb(139 92 246 / 35%))",
  },
  void: {
    ...gradientText,
    animationDuration: "6s",
    animationIterationCount: "infinite",
    animationName: { default: flow, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    backgroundImage: "linear-gradient(90deg, #6d28d9, #a855f7 45%, #4c1d95 80%, #7c3aed)",
    backgroundSize: "200% 100%",
    filter: "drop-shadow(0 0 4px rgb(124 58 237 / 70%)) drop-shadow(0 0 12px rgb(76 29 149 / 50%))",
  },
  holo: {
    ...gradientText,
    animationDuration: "4s",
    animationIterationCount: "infinite",
    animationName: { default: flow, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    backgroundImage:
      "linear-gradient(110deg, #e879f9, #818cf8, #22d3ee, #4ade80, #facc15, #f472b6, #e879f9)",
    backgroundSize: "300% 100%",
    filter: "saturate(1.2) drop-shadow(0 0 6px rgb(129 140 248 / 40%))",
  },
  glitch: {
    animationDuration: "3.5s",
    animationIterationCount: "infinite",
    animationName: { default: glitch, [consts.reducedMotion]: "none" },
    animationTimingFunction: "steps(1, end)",
    color: colors.foreground,
    display: "inline-block",
  },
  inferno: {
    ...gradientText,
    animationDuration: "1.8s",
    animationIterationCount: "infinite",
    animationName: { default: rise, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    backgroundImage:
      "linear-gradient(0deg, #7f1d1d, #dc2626 20%, #f97316 40%, #facc15 50%, #f97316 60%, #dc2626 80%, #7f1d1d)",
    backgroundSize: "100% 200%",
  },
  galaxy: {
    ...gradientText,
    animationDuration: "9s",
    animationIterationCount: "infinite",
    animationName: { default: drift, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    backgroundImage:
      "radial-gradient(1.2px 1.2px at 12px 6px, #fff 50%, transparent 51%), radial-gradient(1px 1px at 30px 14px, #fff 50%, transparent 51%), radial-gradient(1.4px 1.4px at 44px 4px, #fde68a 50%, transparent 51%), linear-gradient(90deg, #4338ca, #9333ea, #db2777, #6366f1, #4338ca)",
    backgroundSize: "48px 18px, 36px 18px, 56px 18px, 300% 100%",
    filter: "drop-shadow(0 0 6px rgb(147 51 234 / 45%))",
  },
  prism: {
    ...gradientText,
    animationDuration: "3s",
    animationIterationCount: "infinite",
    animationName: { default: flow, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    backgroundImage:
      "linear-gradient(90deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)",
    backgroundSize: "200% 100%",
  },
  opal: {
    ...gradientText,
    animationDuration: "7s",
    animationIterationCount: "infinite",
    animationName: { default: opal, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-in-out",
    backgroundImage:
      "linear-gradient(115deg, #e0f2fe, #a7f3d0 20%, #fbcfe8 40%, #ddd6fe 60%, #fef3c7 80%, #bae6fd)",
    backgroundSize: "250% 100%",
  },
})

export type NameEffectProp = string | null | undefined

const getNameEffect = (effect: NameEffectProp): NameEffect | null =>
  isNameEffect(effect) ? effect : null

/**
 * A user's display name, painted with their equipped name effect. Every place
 * that shows a user's name renders it through here, so an effect is visible
 * everywhere at once.
 */
export function UserName({
  name,
  effect,
  sx,
  title,
}: {
  name: string
  effect: NameEffectProp
  sx?: Sx
  title?: string
}) {
  const active = getNameEffect(effect)

  return (
    <span
      data-name-effect={active ?? undefined}
      sx={[styles.base, active === null ? null : [styles.styled, styles[active]], sx]}
      title={title}
    >
      {name}
    </span>
  )
}
