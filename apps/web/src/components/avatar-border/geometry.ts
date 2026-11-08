import { useId } from "react"

export const CENTER = 68

export const VIEW_BOX = "0 0 136 136"

const round = (value: number) => Math.round(value * 100) / 100

export const polar = (radius: number, degrees: number) => {
  const radians = ((degrees - 90) * Math.PI) / 180

  return {
    x: round(CENTER + radius * Math.cos(radians)),
    y: round(CENTER + radius * Math.sin(radians)),
  }
}

export const spread = (count: number, offset = 0) =>
  Array.from({ length: count }, (_, index) => offset + (360 / count) * index)

export const starPath = (size: number) =>
  `M0 ${-size} Q${size * 0.18} ${-size * 0.18} ${size} 0 Q${size * 0.18} ${size * 0.18} 0 ${size} Q${-size * 0.18} ${size * 0.18} ${-size} 0 Q${-size * 0.18} ${-size * 0.18} 0 ${-size}Z`

export const useSvgId = () => {
  const base = useId().replace(/[^a-zA-Z0-9]/g, "")

  return (name: string) => `b${base}${name}`
}
