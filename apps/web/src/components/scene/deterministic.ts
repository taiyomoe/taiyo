export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453

  return x - Math.floor(x)
}

export const round = (n: number) => Math.round(n * 100) / 100

export const lerp = (from: number, to: number, t: number) => round(from + (to - from) * t)
