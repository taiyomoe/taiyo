import * as stylex from "@stylexjs/stylex"
import { type CSSProperties, useMemo } from "react"
import { Animated } from "./animated"
import { lerp, rand, round } from "./deterministic"
import { scene } from "./scene.stylex"

const build = (
  count: number,
  minReach: number,
  maxReach: number,
  minWidth: number,
  maxWidth: number,
) =>
  Array.from({ length: count }).map((_, i) => {
    const seed = i * 8

    return {
      id: i,
      deg: round((360 / count) * i),
      width: lerp(minWidth, maxWidth, rand(seed + 1)),
      reach: lerp(minReach, maxReach, rand(seed + 2)),
      rest: lerp(0.72, 0.92, rand(seed + 3)),
      peak: lerp(1.04, 1.28, rand(seed + 4)),
      duration: lerp(2.8, 7.2, rand(seed + 5)),
      delay: lerp(0, 6, rand(seed + 6)),
      gold: rand(seed + 7) > 0.38,
    }
  })
const OVERLAP = 20
const styles = stylex.create({
  field: {
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
  },
  spinner: {
    inset: 0,
    position: "absolute",
  },
  spoke: {
    position: "absolute",
    transformOrigin: "top center",
    height: 0,
    left: "50%",
    top: "50%",
  },
  band: {
    position: "absolute",
    transformOrigin: "top center",
    borderBottomLeftRadius: "99px",
    borderBottomRightRadius: "99px",
    borderTopLeftRadius: "0",
    borderTopRightRadius: "0",
    left: 0,
    width: "100%",
  },
})

type SunRaysProps = {
  count?: number
  innerRadius?: string
  minReach?: number
  maxReach?: number
  minWidth?: number
  maxWidth?: number
  spinSeconds?: number
}

export const SunRays = ({
  count = 40,
  innerRadius = "13.75rem",
  minReach = 0.7,
  maxReach = 1.35,
  minWidth = 4,
  maxWidth = 9,
  spinSeconds = 120,
}: SunRaysProps) => {
  const rays = useMemo(
    () => build(count, minReach, maxReach, minWidth, maxWidth),
    [count, minReach, maxReach, minWidth, maxWidth],
  )

  return (
    <div sx={styles.field}>
      <Animated sx={styles.spinner} animation={`scene-spin ${spinSeconds}s linear infinite`}>
        {rays.map((ray) => {
          const peak = ray.gold
            ? `color-mix(in srgb, ${scene.goldLight} 70%, transparent)`
            : `color-mix(in srgb, ${scene.ember} 60%, transparent)`
          const tail = ray.gold
            ? `color-mix(in srgb, ${scene.gold} 22%, transparent)`
            : `color-mix(in srgb, ${scene.brand} 20%, transparent)`

          return (
            <Animated
              key={ray.id}
              sx={styles.spoke}
              style={{
                width: ray.width,
                marginLeft: -ray.width / 2,
                transform: `rotate(${ray.deg}deg)`,
              }}
            >
              <Animated
                sx={styles.band}
                animation={`scene-ray-pulse ${ray.duration}s ease-in-out ${ray.delay}s infinite backwards`}
                style={
                  {
                    top: `calc(${innerRadius} - ${OVERLAP}px)`,
                    height: `calc(${innerRadius} * ${ray.reach} + ${OVERLAP}px)`,
                    background: `linear-gradient(to bottom, transparent 0%, ${peak} 16%, ${tail} 62%, transparent 100%)`,
                    "--ray-rest": ray.rest,
                    "--ray-peak": ray.peak,
                  } as CSSProperties
                }
              />
            </Animated>
          )
        })}
      </Animated>
    </div>
  )
}
