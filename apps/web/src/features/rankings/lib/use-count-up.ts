import { useEffect, useState } from "react"

const DURATION_MS = 1600
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

/**
 * How far the board's numbers have counted up since it mounted: 0 to 1 on an exponential ease-out
 * over 1.6s. It stays at 1 with reduced motion and on the server. The board remounts for each
 * category and period, so every switch counts up again.
 */
export function useCountUp() {
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    const animate = !window.matchMedia(REDUCED_MOTION).matches
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS)

      setProgress(t >= 1 ? 1 : 1 - 2 ** (-10 * t))

      if (t < 1) {
        frame = requestAnimationFrame(step)
      }
    }
    let frame = animate ? requestAnimationFrame(step) : 0

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [])

  return progress
}
