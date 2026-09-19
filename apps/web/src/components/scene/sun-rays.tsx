import * as stylex from "@stylexjs/stylex"
import { type CSSProperties, useMemo } from "react"

import { scene } from "./scene.stylex"

// Deterministic pseudo-random, seeded off the ray index, so the server and the
// browser generate the same cluster (Math.random would diverge and React would
// flag a hydration mismatch). Rounded to 2 decimals for the same reason: the
// browser re-serialises long floats and the strings stop matching.
const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453

  return x - Math.floor(x)
}
const round = (n: number) => Math.round(n * 100) / 100
const lerp = (from: number, to: number, t: number) => round(from + (to - from) * t)
// Individual rays so each can breathe on its own clock at its own amplitude — a
// conic gradient, or one shared keyframe, can't do that.
//
// The geometry is anchored to the DISK, not to the ray: every band starts at
// the disk's edge and is sized as a multiple of its radius. Measuring a ray
// from the sun's centre instead (a length, with the colour starting at some
// percentage of it) makes the start point depend on the ray's own length and
// on its current breath — long rays then begin their colour outside the disk
// and visibly detach from it.
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
      // Angles stay evenly spaced — it is the lengths and the breathing that
      // are irregular, not the radial rhythm.
      deg: round((360 / count) * i),
      width: lerp(minWidth, maxWidth, rand(seed + 1)),
      /** How far past the disk's edge this ray reaches, as a multiple of the radius. */
      reach: lerp(minReach, maxReach, rand(seed + 2)),
      /** Scale at the bottom of the breath. */
      rest: lerp(0.72, 0.92, rand(seed + 3)),
      /** Scale at the top of it — drawn independently, so the travel varies too. */
      peak: lerp(1.04, 1.28, rand(seed + 4)),
      duration: lerp(2.8, 7.2, rand(seed + 5)),
      delay: lerp(0, 6, rand(seed + 6)),
      gold: rand(seed + 7) > 0.38,
    }
  })
/** Px the band is tucked back behind the disk so its base is never a visible edge. */
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
  // A zero-height rotation anchor pinned to the sun's centre. The band hangs
  // off it, so scaling the band never moves where the ray starts.
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
    // Rounded only at the far end: the base is hidden behind the disk.
    borderTopLeftRadius: "0",
    borderTopRightRadius: "0",
    left: 0,
    width: "100%",
  },
})

type SunRaysProps = {
  count?: number
  /**
   * Radius of the disk the rays sit behind, as a CSS length. Every ray starts
   * here, so this has to track the disk — pass a calc() when the disk is fluid.
   */
  innerRadius?: string
  /** Shortest reach past the disk's edge, as a multiple of `innerRadius`. */
  minReach?: number
  /** Longest one. Every ray lands somewhere between the two, independently. */
  maxReach?: number
  minWidth?: number
  maxWidth?: number
  /** One full rotation of the whole cluster, in seconds. */
  spinSeconds?: number
}

/**
 * The rotating, breathing ray cluster behind a sun disk. Renders `inset: 0`, so
 * the caller only has to make its own box concentric with the disk.
 *
 * Defaults are the auth screen's calibration; the landing hero passes a denser,
 * slower, wider set because its sun is several times the size.
 */
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
  const spinnerProps = stylex.props(styles.spinner)
  const spokeProps = stylex.props(styles.spoke)
  const bandProps = stylex.props(styles.band)

  return (
    <div sx={styles.field}>
      <div
        className={spinnerProps.className}
        style={{
          ...spinnerProps.style,
          animation: `scene-spin ${spinSeconds}s linear infinite`,
        }}
      >
        {rays.map((ray, i) => {
          const peak = ray.gold
            ? `color-mix(in srgb, ${scene.goldLight} 70%, transparent)`
            : `color-mix(in srgb, ${scene.ember} 60%, transparent)`
          const tail = ray.gold
            ? `color-mix(in srgb, ${scene.gold} 22%, transparent)`
            : `color-mix(in srgb, ${scene.brand} 20%, transparent)`

          return (
            <div
              key={i}
              className={spokeProps.className}
              style={{
                ...spokeProps.style,
                width: ray.width,
                marginLeft: -ray.width / 2,
                transform: `rotate(${ray.deg}deg)`,
              }}
            >
              <div
                className={bandProps.className}
                style={
                  {
                    ...bandProps.style,
                    top: `calc(${innerRadius} - ${OVERLAP}px)`,
                    height: `calc(${innerRadius} * ${ray.reach} + ${OVERLAP}px)`,
                    // Fully transparent at the disk's edge and ramping up just
                    // outside it, so a ray emerges from the sun rather than
                    // butting against it.
                    background: `linear-gradient(to bottom, transparent 0%, ${peak} 16%, ${tail} 62%, transparent 100%)`,
                    // Read by the scene-ray-pulse keyframe, which is why two
                    // rays never grow to the same length.
                    "--ray-rest": ray.rest,
                    "--ray-peak": ray.peak,
                    // `backwards` fill-mode: during each ray's start delay it
                    // shows the 0% keyframe (retracted) instead of its natural
                    // full state, so rays don't snap down one-by-one on load.
                    animation: `scene-ray-pulse ${ray.duration}s ease-in-out ${ray.delay}s infinite backwards`,
                  } as CSSProperties
                }
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
