import type { ReaderSettings } from "@taiyomoe/schemas/reader-settings"

export const getImageFilter = ({
  brightness,
  contrast,
  saturation,
  warmth,
  grayscale,
  invert,
}: Pick<
  ReaderSettings,
  "brightness" | "contrast" | "saturation" | "warmth" | "grayscale" | "invert"
>) => {
  const parts = [
    brightness === 100 ? null : `brightness(${brightness}%)`,
    contrast === 100 ? null : `contrast(${contrast}%)`,
    saturation === 100 ? null : `saturate(${saturation}%)`,
    warmth === 0 ? null : `sepia(${warmth}%)`,
    grayscale ? "grayscale(1)" : null,
    invert ? "invert(1) hue-rotate(180deg)" : null,
  ].filter((part) => part !== null)

  return parts.length === 0 ? "none" : parts.join(" ")
}

export const isLightColor = (hex: string) => {
  const value = Number.parseInt(hex.slice(1), 16)
  const [red, green, blue] = [(value >> 16) & 255, (value >> 8) & 255, value & 255]

  return red * 0.299 + green * 0.587 + blue * 0.114 > 150
}
