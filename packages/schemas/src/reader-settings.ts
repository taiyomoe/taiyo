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
  mode: z
    .enum(READER_MODES)
    .catch("single")
    .meta({ description: "How pages are displayed.", example: "double" }),
  longStripMode: z.enum(READER_MODES).catch("strip").meta({
    description: "How pages are displayed for media read as a long strip, such as manhwa.",
    example: "strip",
  }),
  direction: z
    .enum(READER_DIRECTIONS)
    .catch("ltr")
    .meta({ description: "The reading direction.", example: "rtl" }),
  fit: z
    .enum(READER_FITS)
    .catch("screen")
    .meta({ description: "How pages fit the screen.", example: "width" }),
  stretchSmall: z
    .boolean()
    .catch(true)
    .meta({ description: "Whether pages smaller than the screen are enlarged to fit it." }),
  firstPageAlone: z.boolean().catch(true).meta({
    description: "Whether the first page is shown alone in double mode, to keep spreads aligned.",
  }),
  pageWidth: z.number().int().min(320).max(2400).catch(900).meta({
    description: "The width of a page in pixels, in long strip mode or when fitting the width.",
    example: 900,
  }),
  pageGap: z
    .number()
    .int()
    .min(0)
    .max(64)
    .catch(0)
    .meta({ description: "The gap between pages in long strip mode, in pixels.", example: 8 }),
  continuous: z.boolean().catch(true).meta({
    description: "Whether the next chapter loads right below the current one.",
  }),
  brightness: percent(20, 150, 100).meta({
    description: "The brightness of the pages, in percent.",
    example: 100,
  }),
  contrast: percent(50, 150, 100).meta({
    description: "The contrast of the pages, in percent.",
    example: 100,
  }),
  saturation: percent(0, 200, 100).meta({
    description: "The saturation of the pages, in percent.",
    example: 100,
  }),
  warmth: percent(0, 100, 0).meta({
    description: "How warm the colors of the pages are, in percent.",
    example: 20,
  }),
  grayscale: z
    .boolean()
    .catch(false)
    .meta({ description: "Whether pages are shown in grayscale." }),
  invert: z
    .boolean()
    .catch(false)
    .meta({ description: "Whether the colors of the pages are inverted, for night reading." }),
  background: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .catch("#000000")
    .meta({
      description: "The background color of the reader, as a hex color.",
      example: "#1a1a1a",
    }),
  progressStyle: z
    .enum(PROGRESS_STYLES)
    .catch("segments")
    .meta({ description: "How reading progress is shown.", example: "bar" }),
  clickZones: z.enum(CLICK_ZONES).catch("sides").meta({
    description:
      "How clicking the page turns it: on either half, on the outer thirds (the middle opens the menu), or not at all.",
    example: "thirds",
  }),
  swipe: z.boolean().catch(true).meta({ description: "Whether swiping turns pages." }),
  doubleTapZoom: z.boolean().catch(true).meta({ description: "Whether double-tapping zooms." }),
  cursorHints: z
    .boolean()
    .catch(true)
    .meta({ description: "Whether the cursor shows arrows over the click zones." }),
  autoHideControls: z
    .boolean()
    .catch(true)
    .meta({ description: "Whether the controls hide when idle." }),
  confirmChapterChange: z
    .boolean()
    .catch(true)
    .meta({ description: "Whether the reader asks before changing chapter." }),
  warnChapterGap: z
    .boolean()
    .catch(true)
    .meta({ description: "Whether the reader warns about missing chapters." }),
  resume: z
    .boolean()
    .catch(true)
    .meta({ description: "Whether chapters open on the last page you saw." }),
  preload: z
    .number()
    .int()
    .min(0)
    .max(10)
    .catch(3)
    .meta({ description: "The number of pages to preload ahead.", example: 3 }),
  autoScrollSpeed: z.number().int().min(10).max(600).catch(80).meta({
    description: "The auto-scroll speed, in pixels per second.",
    example: 80,
  }),
})

export type ReaderSettings = z.infer<typeof readerSettingsSchema>
