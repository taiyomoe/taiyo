import * as stylex from "@stylexjs/stylex"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { encode } from "uqr"

const styles = stylex.create({
  frame: {
    padding: "0.75rem",
    borderRadius: radius.xl,
    backgroundColor: "white",
    display: "inline-flex",
  },
  svg: {
    display: "block",
    height: "11rem",
    width: "11rem",
  },
})

export function QrCode({ value, label }: { value: string; label: string }) {
  const { data, size } = encode(value, { border: 0 })
  const path = data
    .flatMap((row, y) => row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : "")))
    .join("")

  return (
    <span sx={styles.frame}>
      <svg
        aria-label={label}
        role="img"
        shapeRendering="crispEdges"
        viewBox={`0 0 ${size} ${size}`}
        {...stylex.props(styles.svg)}
      >
        <path d={path} fill="black" />
      </svg>
    </span>
  )
}
