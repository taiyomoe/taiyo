/**
 * Deterministic pseudo-randomness for the scene's generated geometry (embers,
 * sun rays). Math.random() would diverge between the server and the browser and
 * React would flag a hydration mismatch.
 *
 * `round` exists for the same reason: the browser re-serialises long floats
 * (5.721816935692914% -> 5.72182%) so the SSR string and the client's stop
 * matching unless both sides carry the same precision.
 */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453

  return x - Math.floor(x)
}

export const round = (n: number) => Math.round(n * 100) / 100

export const lerp = (from: number, to: number, t: number) => round(from + (to - from) * t)
