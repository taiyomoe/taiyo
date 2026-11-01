import * as stylex from "@stylexjs/stylex"
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
  onComplete,
}: {
  running: boolean
  paused: boolean
  complete: boolean
  onComplete: () => void
}) {
  return (
    <span
      onAnimationEnd={onComplete}
      sx={[
        styles.fill,
        complete && styles.fillComplete,
        running && styles.fillRunning,
        paused && styles.fillPaused,
      ]}
    />
  )
}
