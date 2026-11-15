import * as stylex from "@stylexjs/stylex"
import { scene } from "@taiyomoe/ui/styles/scene.stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

const progress = stylex.keyframes({
  from: { transform: "translateX(-100%)" },
  to: { transform: "translateX(0)" },
})
const styles = stylex.create({
  fill: {
    borderRadius: "inherit",
    backgroundColor: colors.foreground,
    display: "block",
    transform: "translateX(-100%)",
    height: "100%",
    width: "100%",
  },
  fillSun: {
    backgroundImage: `linear-gradient(90deg, ${scene.brand}, ${scene.gold})`,
  },
  fillComplete: {
    transform: "translateX(0)",
  },
  fillRunning: {
    animationDuration: "7s",
    animationFillMode: "both",
    animationName: progress,
    animationTimingFunction: "linear",
    willChange: "transform",
  },
  fillPaused: {
    animationPlayState: "paused",
  },
})

export function ProgressFill({
  running,
  paused,
  complete,
  sun,
  onComplete,
}: {
  running: boolean
  paused: boolean
  complete: boolean
  sun: boolean
  onComplete: () => void
}) {
  return (
    <span
      onAnimationEnd={onComplete}
      sx={[
        styles.fill,
        sun && styles.fillSun,
        complete && styles.fillComplete,
        running && styles.fillRunning,
        paused && styles.fillPaused,
      ]}
    />
  )
}
