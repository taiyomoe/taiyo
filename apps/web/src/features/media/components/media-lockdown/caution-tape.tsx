import * as stylex from "@stylexjs/stylex"
import { consts } from "@taiyomoe/ui/styles/tokens.stylex"
import type { TapePlacement, TapeSide } from "@/features/media/lib/lockdown-timeline"
import { hazard } from "@/features/media/components/media-lockdown/lockdown.stylex"

const DIAGONAL = "atan2(100cqh, 100cqw)"
const unrollFromLeft = stylex.keyframes({
  from: { clipPath: "inset(-3rem 100% -3rem 0)" },
  to: { clipPath: "inset(-3rem 0 -3rem 0)" },
})
const unrollFromRight = stylex.keyframes({
  from: { clipPath: "inset(-3rem 0 -3rem 100%)" },
  to: { clipPath: "inset(-3rem 0 -3rem 0)" },
})
const slap = stylex.keyframes({
  "0%": { scale: "1 1" },
  "35%": { scale: "1 1.16" },
  "70%": { scale: "1 0.95" },
  "100%": { scale: "1 1" },
})
const styles = stylex.create({
  tape: {
    animationFillMode: "both",
    animationName: { default: slap, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-out",
    position: "absolute",
    height: "clamp(2.5rem, 7cqmin, 4.25rem)",
    left: "50%",
    top: "50%",
    width: "calc(hypot(100cqw, 100cqh) + 10rem)",
  },
  strip: {
    animationFillMode: "both",
    animationTimingFunction: "cubic-bezier(0.32, 0.6, 0.2, 1)",
    backgroundColor: hazard.yellow,
    backgroundImage: `linear-gradient(180deg, rgb(255 255 255 / 0.34) 0%, rgb(255 255 255 / 0.08) 24%, transparent 52%, rgb(0 0 0 / 0.22) 100%), repeating-linear-gradient(90deg, transparent 0 9rem, rgb(0 0 0 / 0.09) 9.4rem, transparent 10rem), ${hazard.stripes}`,
    boxShadow:
      "inset 0 1px 0 rgb(255 255 255 / 0.4), inset 0 -1px 0 rgb(0 0 0 / 0.45), 0 0.85rem 1.25rem -0.25rem rgb(0 0 0 / 0.55), 0 0.15rem 0.25rem rgb(0 0 0 / 0.4)",
    height: "100%",
    width: "100%",
  },
  left: {
    animationName: { default: unrollFromLeft, [consts.reducedMotion]: "none" },
  },
  right: {
    animationName: { default: unrollFromRight, [consts.reducedMotion]: "none" },
  },
  // Two strips cross corner to corner, two flatter ones bind the top and bottom.
  falling: {
    rotate: DIAGONAL,
    translate: "-50% -50%",
  },
  rising: {
    rotate: `calc(-1 * ${DIAGONAL})`,
    translate: "-50% -50%",
  },
  upper: {
    rotate: "-7deg",
    translate: "-50% calc(-50% - 27cqh)",
  },
  lower: {
    rotate: "5deg",
    translate: "-50% calc(-50% + 29cqh)",
  },
  timing: (delay: string, duration: string) => ({
    animationDelay: delay,
    animationDuration: duration,
  }),
})

export function CautionTape({
  placement,
  side,
  delay,
  duration,
}: {
  placement: TapePlacement
  side: TapeSide
  delay: number
  duration: number
}) {
  return (
    <div sx={[styles.tape, styles[placement], styles.timing(`${delay + duration}ms`, "260ms")]}>
      <div
        sx={[
          styles.strip,
          side === "left" ? styles.left : styles.right,
          styles.timing(`${delay}ms`, `${duration}ms`),
        ]}
      />
    </div>
  )
}
