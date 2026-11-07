import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

const TONES = [
  colors.chart1,
  colors.chart2,
  colors.chart3,
  colors.chart4,
  colors.chart5,
  colors.info,
]
const CATEGORY_TONES: Record<string, string> = {
  auth: colors.info,
  admin: colors.destructive,
  user: colors.chart2,
  media: colors.chart1,
  staff: colors.chart4,
  chapter: colors.chart5,
  group: colors.chart3,
  list: colors.chart4,
  library: colors.chart2,
  history: colors.info,
  comment: colors.chart3,
  audit: colors.mutedForeground,
}

export const getCategoryTone = (category: string) => CATEGORY_TONES[category] ?? colors.primary

export const getTone = (seed: string) => {
  let hash = 0

  for (const char of seed) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 2_147_483_647
  }

  return TONES[hash % TONES.length] ?? colors.primary
}

const graphemes = new Intl.Segmenter()

export const initialOf = (name: string) =>
  graphemes.segment(name.trim()).containing(0)?.segment.toUpperCase() ?? "?"
