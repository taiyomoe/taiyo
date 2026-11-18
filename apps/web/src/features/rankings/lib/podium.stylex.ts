import * as stylex from "@stylexjs/stylex"

/** The podium's metals, from highlight to shadow, and the glow each one casts. */
export const metal = stylex.defineConsts({
  gold1: "#fff1b8",
  gold2: "#ffd147",
  gold3: "#f5a623",
  gold4: "#a8650b",
  goldGlow: "#f5b62a",
  silver1: "#ffffff",
  silver2: "#dde2ea",
  silver3: "#a3abb8",
  silver4: "#5f6672",
  silverGlow: "#c3c7cf",
  bronze1: "#ffd8b5",
  bronze2: "#f19a5b",
  bronze3: "#c2642a",
  bronze4: "#6e3410",
  bronzeGlow: "#d4824a",
})

/** The flame the page is lit with: the brand red warming to orange and amber. */
export const flame = stylex.defineConsts({
  deep: "#c62813",
  red: "#e3391c",
  orange: "#ff7a3d",
  amber: "#ffb547",
  peach: "#ff9a7a",
  honey: "#ffd98a",
  violet: "oklch(60.6% 0.25 292.717)",
})
