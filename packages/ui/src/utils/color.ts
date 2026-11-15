export type Hsv = { h: number; s: number; v: number }

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

export const parseHex = (input: string) => {
  const match = HEX.exec(input.trim())

  if (match === null) {
    return null
  }

  const digits = match[1] ?? ""
  const full = digits.length === 3 ? digits.replace(/./g, (digit) => digit + digit) : digits

  return `#${full.toLowerCase()}`
}

export const hexToHsv = (hex: string): Hsv => {
  const value = Number.parseInt((parseHex(hex) ?? "#000000").slice(1), 16)
  const r = ((value >> 16) & 255) / 255
  const g = ((value >> 8) & 255) / 255
  const b = (value & 255) / 255
  const max = Math.max(r, g, b)
  const delta = max - Math.min(r, g, b)
  let h = 0

  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6
    } else if (max === g) {
      h = (b - r) / delta + 2
    } else {
      h = (r - g) / delta + 4
    }
  }

  return {
    h: (h * 60 + 360) % 360,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  }
}

export const hsvToHex = ({ h, s, v }: Hsv) => {
  const channel = (offset: number) => {
    const k = (offset + h / 60) % 6
    const value = (v / 100) * (1 - (s / 100) * Math.max(0, Math.min(k, 4 - k, 1)))

    return Math.round(value * 255)
      .toString(16)
      .padStart(2, "0")
  }

  return `#${channel(5)}${channel(3)}${channel(1)}`
}
