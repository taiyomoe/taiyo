import type { AchievementKey } from "./achievements"
import type { Role } from "./constants"

export const COSMETIC_KINDS = ["NAME_EFFECT", "TITLE", "AVATAR_BORDER"] as const

export type CosmeticKind = (typeof COSMETIC_KINDS)[number]

export const COSMETIC_RARITIES = ["common", "rare", "epic", "legendary"] as const

export type CosmeticRarity = (typeof COSMETIC_RARITIES)[number]

export type CosmeticUnlock =
  | { type: "free" }
  | { type: "role"; roles: readonly Role[] }
  | { type: "achievement"; achievement: AchievementKey }
  | { type: "shop"; price: number }
  | { type: "lootBox" }

export type CosmeticDefinition = { rarity: CosmeticRarity; unlock: CosmeticUnlock }

const free = { type: "free" } as const
const roles = (...granted: Role[]) => ({ type: "role", roles: granted }) as const
const achievement = (key: AchievementKey) => ({ type: "achievement", achievement: key }) as const
const shop = (price: number) => ({ type: "shop", price }) as const
const lootBox = { type: "lootBox" } as const

export const NAME_EFFECT_KEYS = [
  "sunrise",
  "crimson",
  "azure",
  "jade",
  "ember",
  "tide",
  "sakura",
  "frost",
  "gold",
  "neon",
  "aurora",
  "void",
  "holo",
  "glitch",
  "inferno",
  "galaxy",
  "prism",
  "opal",
] as const

export type NameEffect = (typeof NAME_EFFECT_KEYS)[number]

export const NAME_EFFECTS: Record<NameEffect, CosmeticDefinition> = {
  sunrise: { rarity: "common", unlock: free },
  crimson: { rarity: "legendary", unlock: roles("ADMIN") },
  azure: { rarity: "epic", unlock: roles("MODERATOR", "ADMIN") },
  jade: { rarity: "epic", unlock: roles("UPLOADER", "UPLOADER_INTERN", "ADMIN") },
  ember: { rarity: "rare", unlock: achievement("chaptersRead100") },
  tide: { rarity: "rare", unlock: achievement("chaptersUploaded10") },
  sakura: { rarity: "rare", unlock: shop(300) },
  frost: { rarity: "rare", unlock: shop(400) },
  gold: { rarity: "epic", unlock: shop(500) },
  neon: { rarity: "epic", unlock: shop(600) },
  aurora: { rarity: "epic", unlock: shop(800) },
  void: { rarity: "epic", unlock: shop(900) },
  holo: { rarity: "legendary", unlock: shop(1000) },
  glitch: { rarity: "legendary", unlock: shop(1200) },
  inferno: { rarity: "legendary", unlock: shop(1200) },
  galaxy: { rarity: "legendary", unlock: shop(1500) },
  prism: { rarity: "legendary", unlock: shop(2000) },
  opal: { rarity: "epic", unlock: lootBox },
}

export const USER_TITLE_KEYS = [
  "reader",
  "newcomer",
  "administrator",
  "moderator",
  "uploader",
  "bookworm",
  "bingeReader",
  "livingLibrary",
  "contributor",
  "scanlationHero",
  "socialite",
  "chatterbox",
  "nightOwl",
  "sunChaser",
  "sensei",
  "legend",
  "treasureHunter",
  "fortunesFavorite",
  "champion",
  "monarch",
  "unstoppable",
  "sovereign",
  "grandArchivist",
] as const

export type UserTitle = (typeof USER_TITLE_KEYS)[number]

export const USER_TITLES: Record<UserTitle, CosmeticDefinition> = {
  reader: { rarity: "common", unlock: free },
  newcomer: { rarity: "common", unlock: free },
  administrator: { rarity: "legendary", unlock: roles("ADMIN") },
  moderator: { rarity: "epic", unlock: roles("MODERATOR", "ADMIN") },
  uploader: { rarity: "epic", unlock: roles("UPLOADER", "UPLOADER_INTERN", "ADMIN") },
  bookworm: { rarity: "rare", unlock: achievement("chaptersRead100") },
  bingeReader: { rarity: "epic", unlock: achievement("chaptersRead1000") },
  livingLibrary: { rarity: "legendary", unlock: achievement("chaptersRead5000") },
  contributor: { rarity: "rare", unlock: achievement("chaptersUploaded10") },
  scanlationHero: { rarity: "epic", unlock: achievement("chaptersUploaded250") },
  socialite: { rarity: "rare", unlock: achievement("followers25") },
  chatterbox: { rarity: "rare", unlock: achievement("commentsWritten50") },
  nightOwl: { rarity: "common", unlock: shop(250) },
  sunChaser: { rarity: "rare", unlock: shop(500) },
  sensei: { rarity: "epic", unlock: shop(750) },
  legend: { rarity: "legendary", unlock: shop(2500) },
  treasureHunter: { rarity: "epic", unlock: lootBox },
  fortunesFavorite: { rarity: "legendary", unlock: lootBox },
  champion: { rarity: "epic", unlock: achievement("weeklyChampion") },
  monarch: { rarity: "legendary", unlock: achievement("monthlyChampion") },
  unstoppable: { rarity: "epic", unlock: achievement("unstoppable") },
  sovereign: { rarity: "legendary", unlock: achievement("sovereign") },
  grandArchivist: { rarity: "legendary", unlock: achievement("chaptersUploaded100000") },
}

export const AVATAR_BORDER_KEYS = [
  "halo",
  "dusk",
  "petals",
  "tidal",
  "circuit",
  "orbit",
  "frostbite",
  "thorns",
  "solar",
  "phoenix",
  "nebula",
  "eclipse",
  "enso",
] as const

export type AvatarBorder = (typeof AVATAR_BORDER_KEYS)[number]

export const AVATAR_BORDERS: Record<AvatarBorder, CosmeticDefinition> = {
  halo: { rarity: "common", unlock: shop(200) },
  dusk: { rarity: "common", unlock: shop(250) },
  petals: { rarity: "rare", unlock: shop(500) },
  tidal: { rarity: "rare", unlock: shop(600) },
  circuit: { rarity: "rare", unlock: shop(650) },
  orbit: { rarity: "epic", unlock: shop(900) },
  frostbite: { rarity: "epic", unlock: shop(1100) },
  thorns: { rarity: "epic", unlock: lootBox },
  solar: { rarity: "legendary", unlock: shop(1800) },
  phoenix: { rarity: "legendary", unlock: shop(2200) },
  nebula: { rarity: "legendary", unlock: lootBox },
  eclipse: { rarity: "legendary", unlock: lootBox },
  enso: { rarity: "legendary", unlock: achievement("chaptersUploaded100000") },
}

export const isNameEffect = (value: unknown): value is NameEffect =>
  NAME_EFFECT_KEYS.some((key) => key === value)

export const isUserTitle = (value: unknown): value is UserTitle =>
  USER_TITLE_KEYS.some((key) => key === value)

export const isAvatarBorder = (value: unknown): value is AvatarBorder =>
  AVATAR_BORDER_KEYS.some((key) => key === value)

export const COSMETIC_CATALOG = {
  NAME_EFFECT: NAME_EFFECTS,
  TITLE: USER_TITLES,
  AVATAR_BORDER: AVATAR_BORDERS,
} satisfies Record<CosmeticKind, Record<string, CosmeticDefinition>>

export const getCosmeticDefinition = (kind: CosmeticKind, key: string) => {
  const catalog: Record<string, CosmeticDefinition> = COSMETIC_CATALOG[kind]

  return Object.hasOwn(catalog, key) ? catalog[key] : undefined
}

export const isCosmeticUnlocked = (
  unlock: CosmeticUnlock,
  { role, owned, achievements }: { role: Role; owned: boolean; achievements: ReadonlySet<string> },
) => {
  if (owned) {
    return true
  }

  if (unlock.type === "role") {
    return unlock.roles.includes(role)
  }

  if (unlock.type === "achievement") {
    return achievements.has(unlock.achievement)
  }

  return unlock.type === "free"
}
