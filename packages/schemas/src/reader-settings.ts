import { z } from "zod"

export const READER_MODES = ["single", "double", "strip"] as const

const READER_FITS = ["screen", "height", "width", "original"] as const
const READER_DIRECTIONS = ["ltr", "rtl"] as const
const PROGRESS_STYLES = ["segments", "bar", "counter", "percent", "hidden"] as const
const CLICK_ZONES = ["sides", "thirds", "off"] as const

export type ReaderDirection = (typeof READER_DIRECTIONS)[number]

export type ProgressStyle = (typeof PROGRESS_STYLES)[number]

export type ClickZones = (typeof CLICK_ZONES)[number]

const percent = (min: number, max: number, fallback: number) =>
  z.number().int().min(min).max(max).catch(fallback)

export const readerSettingsSchema = z.object({
  mode: z.enum(READER_MODES).catch("single"),
  longStripMode: z.enum(READER_MODES).catch("strip"),
  direction: z.enum(READER_DIRECTIONS).catch("ltr"),
  fit: z.enum(READER_FITS).catch("screen"),
  stretchSmall: z.boolean().catch(true),
  firstPageAlone: z.boolean().catch(true),
  pageWidth: z.number().int().min(320).max(2400).catch(900),
  pageGap: z.number().int().min(0).max(64).catch(0),
  continuous: z.boolean().catch(true),
  brightness: percent(20, 150, 100),
  contrast: percent(50, 150, 100),
  saturation: percent(0, 200, 100),
  warmth: percent(0, 100, 0),
  grayscale: z.boolean().catch(false),
  invert: z.boolean().catch(false),
  background: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .catch("#000000"),
  progressStyle: z.enum(PROGRESS_STYLES).catch("segments"),
  clickZones: z.enum(CLICK_ZONES).catch("sides"),
  swipe: z.boolean().catch(true),
  doubleTapZoom: z.boolean().catch(true),
  cursorHints: z.boolean().catch(true),
  autoHideControls: z.boolean().catch(true),
  confirmChapterChange: z.boolean().catch(true),
  warnChapterGap: z.boolean().catch(true),
  resume: z.boolean().catch(true),
  preload: z.number().int().min(0).max(10).catch(3),
  autoScrollSpeed: z.number().int().min(10).max(600).catch(80),
})

export type ReaderSettings = z.infer<typeof readerSettingsSchema>
