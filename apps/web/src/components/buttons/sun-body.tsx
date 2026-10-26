import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"

const sheenSweep = stylex.keyframes({
  "0%": { transform: "translateX(-130%) skewX(-18deg)" },
  "26%, 100%": { transform: "translateX(330%) skewX(-18deg)" },
})
const styles = stylex.create({
  label: {
    gap: "0.5rem",
    alignItems: "center",
    display: "inline-flex",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
  },
  labelLoading: {
    opacity: 0,
  },
  loader: {
    inset: 0,
    alignItems: "center",
    display: "inline-flex",
    justifyContent: "center",
    position: "absolute",
    zIndex: 2,
  },
  sheen: {
    animationDuration: "5s",
    animationFillMode: "backwards",
    animationIterationCount: "infinite",
    animationName: sheenSweep,
    animationTimingFunction: "ease-in-out",
    backgroundImage: "linear-gradient(90deg, transparent, rgba(255,249,236,0.55), transparent)",
    pointerEvents: "none",
    position: "absolute",
    zIndex: 1,
    bottom: 0,
    left: 0,
    top: 0,
    width: "33.3333%",
  },
})

type SunBodyProps = {
  children: ReactNode
  loading?: boolean
}

export const SunBody = ({ children, loading }: SunBodyProps) => (
  <>
    <span sx={[styles.label, loading === true && styles.labelLoading]}>{children}</span>
    {loading === true ? (
      <span sx={styles.loader}>
        <Spinner />
      </span>
    ) : null}
    <span aria-hidden sx={styles.sheen} />
  </>
)
