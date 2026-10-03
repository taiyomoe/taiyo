import * as stylex from "@stylexjs/stylex"
import { type CSSProperties, useMemo } from "react"

import { rand, round } from "./deterministic"
import { scene } from "./scene.stylex"
const build = (count: number) =>
  Array.from({ length: count }).map((_, i) => {
    const size = round(2 + rand(i + 100) * 4)

    return {
      left: round(rand(i) * 100),
      size,
      delay: round(rand(i + 200) * 9),
      dur: round(9 + rand(i + 300) * 9),
      drift: `${round(rand(i + 400) * 120 - 60)}px`,
      glow: round(size * 3),
      gold: rand(i + 500) > 0.5,
    }
  })
const styles = stylex.create({
  field: {
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
  },
  ember: {
    borderRadius: "50%",
    position: "absolute",
    bottom: "-10px",
  },
})

type EmbersProps = {
  count?: number
}

/**
 * Sparks drifting up off the sun. Shared by the auth scene and the landing
 * hero — the per-spark size/drift/clock is what keeps them from reading as a
 * single looping sprite, so each one carries its own inline style.
 */
export const Embers = ({ count = 26 }: EmbersProps) => {
  const embers = useMemo(() => build(count), [count])
  const emberProps = stylex.props(styles.ember)

  return (
    <div sx={styles.field}>
      {embers.map((ember, i) => (
        <span
          key={i}
          className={emberProps.className}
          style={
            {
              ...emberProps.style,
              left: `${ember.left}%`,
              width: ember.size,
              height: ember.size,
              background: ember.gold ? scene.goldLight : scene.ember,
              boxShadow: `0 0 ${ember.glow}px ${ember.gold ? scene.gold : scene.brand}`,
              "--drift": ember.drift,
              animation: `scene-ember-rise ${ember.dur}s linear ${ember.delay}s infinite`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
