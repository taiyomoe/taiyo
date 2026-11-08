import type { LootBoxKey } from "@taiyomoe/db/loot-boxes"

export type BodyFinish = "metal" | "wood" | "crystal" | "obsidian"

export type ChestPalette = {
  finish: BodyFinish
  body: string
  bodyAccent: string
  trim: string
  trimRoughness: number
  trimIridescence: number
  gem: string
  glow: string
  rune: string | null
  stage: string
}

export const CHEST_PALETTES: Record<LootBoxKey, ChestPalette> = {
  iron: {
    finish: "metal",
    body: "#3d4148",
    bodyAccent: "#5b6068",
    trim: "#c9cdd3",
    trimRoughness: 0.32,
    trimIridescence: 0,
    gem: "#cbd5e1",
    glow: "#e2e8f0",
    rune: null,
    stage: "#94a3b8",
  },
  gold: {
    finish: "wood",
    body: "#3a1a0b",
    bodyAccent: "#6b3416",
    trim: "#f5b942",
    trimRoughness: 0.18,
    trimIridescence: 0,
    gem: "#e11d48",
    glow: "#fbbf24",
    rune: null,
    stage: "#f59e0b",
  },
  diamond: {
    finish: "crystal",
    body: "#8fdcff",
    bodyAccent: "#0ea5e9",
    trim: "#eef6ff",
    trimRoughness: 0.12,
    trimIridescence: 0.35,
    gem: "#e0fbff",
    glow: "#67e8f9",
    rune: null,
    stage: "#38bdf8",
  },
  mythic: {
    finish: "obsidian",
    body: "#08060f",
    bodyAccent: "#1e1035",
    trim: "#7c5cc4",
    trimRoughness: 0.26,
    trimIridescence: 0.45,
    gem: "#f0abfc",
    glow: "#e879f9",
    rune: "#e879f9",
    stage: "#c026d3",
  },
}
