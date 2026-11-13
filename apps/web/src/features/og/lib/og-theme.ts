export const OG_WIDTH = 1200

export const OG_HEIGHT = 630

export const OG_PADDING = 64

// The landing page's night palette (src/components/scene/scene.stylex.ts):
// StyleX variables do not exist outside the browser, so the cards repeat them.
export const ogColors = {
  night: "#120a07",
  nightDeep: "#0d0705",
  nightRaised: "#1a0d08",
  paper: "#fffcf8",
  paperMuted: "rgba(255, 252, 248, 0.68)",
  paperFaint: "rgba(255, 252, 248, 0.46)",
  hairline: "rgba(255, 252, 248, 0.12)",
  brand: "#f2452d",
  ember: "#fb6e54",
  gold: "#ffb820",
  goldLight: "#ffc94d",
  goldPale: "#ffe3a0",
}

/**
 * Every family a card can draw text with. The display and body families cover
 * Latin, Greek and Cyrillic; the Noto families behind them catch titles and
 * names in other scripts, so a Japanese title or an Arabic username never
 * renders as boxes.
 */
export const OG_FONT_FAMILIES = [
  "PT Serif",
  "Inter",
  "Noto Sans JP",
  "Noto Sans KR",
  "Noto Sans SC",
  "Noto Sans Arabic",
  "Noto Sans Hebrew",
  "Noto Sans Thai",
] as const

export type OgFontFamily = (typeof OG_FONT_FAMILIES)[number]

const stack = (first: OgFontFamily) =>
  [first, ...OG_FONT_FAMILIES.filter((family) => family !== first)]
    .map((family) => `"${family}"`)
    .join(", ")

export const ogFonts = {
  display: stack("PT Serif"),
  body: stack("Inter"),
}
