import { type ReaderSettings, readerSettingsSchema } from "@taiyomoe/schemas/reader-settings"

export const READER_BACKGROUNDS = [
  "#000000",
  "#161616",
  "#2b2b2b",
  "#3a3a3a",
  "#1c2230",
  "#2a2420",
  "#f4f1ea",
  "#ffffff",
] as const

export const DEFAULT_READER_SETTINGS = readerSettingsSchema.parse({})

export const IMAGE_SETTING_KEYS = [
  "brightness",
  "contrast",
  "saturation",
  "warmth",
  "grayscale",
  "invert",
  "background",
] as const satisfies ReadonlyArray<keyof ReaderSettings>
