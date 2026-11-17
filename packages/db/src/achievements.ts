import type { CosmeticKind, CosmeticRarity } from "./cosmetics"
import type { RankingPeriodKind } from "./rankings"

export const ACHIEVEMENT_CATEGORIES = ["reading", "uploading", "community", "ranking"] as const

type AchievementCategory = (typeof ACHIEVEMENT_CATEGORIES)[number]

export const ACHIEVEMENT_METRICS = [
  "chaptersRead",
  "chaptersUploaded",
  "followers",
  "commentsWritten",
] as const

export type AchievementMetric = (typeof ACHIEVEMENT_METRICS)[number]

/** A user's current value for each metric. */
export type AchievementProgress = Record<AchievementMetric, number>

type AchievementCriteria =
  /** Reach `threshold` on `metric`. */
  | { type: "metric"; metric: AchievementMetric; threshold: number }
  /** Finish a closed readers ranking period of one of `periods` at `rank` or better. */
  | { type: "rank"; periods: readonly RankingPeriodKind[]; rank: number }
  /** Finish #1 of `days` consecutive closed days of the readers ranking. */
  | { type: "streak"; days: number }

export type AchievementDefinition = {
  category: AchievementCategory
  rarity: CosmeticRarity
  criteria: AchievementCriteria
  /** Whether earning it again counts up instead of being ignored. */
  repeatable: boolean
  rewards: { points?: number; cosmetics?: ReadonlyArray<{ kind: CosmeticKind; key: string }> }
}

export const ACHIEVEMENT_KEYS = [
  "chaptersRead100",
  "chaptersRead1000",
  "chaptersRead5000",
  "chaptersUploaded10",
  "chaptersUploaded250",
  "chaptersUploaded100000",
  "followers25",
  "commentsWritten50",
  "dailyChampion",
  "hatTrick",
  "unstoppable",
  "sovereign",
  "topTen",
  "weeklyPodium",
  "weeklyChampion",
  "monthlyPodium",
  "monthlyChampion",
] as const

export type AchievementKey = (typeof ACHIEVEMENT_KEYS)[number]

const metric = (name: AchievementMetric, threshold: number) =>
  ({ type: "metric", metric: name, threshold }) as const
const rank = (periods: readonly RankingPeriodKind[], best: number) =>
  ({ type: "rank", periods, rank: best }) as const
const streak = (days: number) => ({ type: "streak", days }) as const
const title = (key: string) => ({ kind: "TITLE", key }) as const
const nameEffect = (key: string) => ({ kind: "NAME_EFFECT", key }) as const
const avatarBorder = (key: string) => ({ kind: "AVATAR_BORDER", key }) as const

export const ACHIEVEMENTS: Record<AchievementKey, AchievementDefinition> = {
  chaptersRead100: {
    category: "reading",
    rarity: "rare",
    criteria: metric("chaptersRead", 100),
    repeatable: false,
    rewards: { cosmetics: [nameEffect("ember"), title("bookworm")] },
  },
  chaptersRead1000: {
    category: "reading",
    rarity: "epic",
    criteria: metric("chaptersRead", 1000),
    repeatable: false,
    rewards: { cosmetics: [title("bingeReader")] },
  },
  chaptersRead5000: {
    category: "reading",
    rarity: "legendary",
    criteria: metric("chaptersRead", 5000),
    repeatable: false,
    rewards: { cosmetics: [title("livingLibrary")] },
  },
  chaptersUploaded10: {
    category: "uploading",
    rarity: "rare",
    criteria: metric("chaptersUploaded", 10),
    repeatable: false,
    rewards: { cosmetics: [nameEffect("tide"), title("contributor")] },
  },
  chaptersUploaded250: {
    category: "uploading",
    rarity: "epic",
    criteria: metric("chaptersUploaded", 250),
    repeatable: false,
    rewards: { cosmetics: [title("scanlationHero")] },
  },
  chaptersUploaded100000: {
    category: "uploading",
    rarity: "legendary",
    criteria: metric("chaptersUploaded", 100_000),
    repeatable: false,
    rewards: { cosmetics: [title("grandArchivist"), avatarBorder("enso")] },
  },
  followers25: {
    category: "community",
    rarity: "rare",
    criteria: metric("followers", 25),
    repeatable: false,
    rewards: { cosmetics: [title("socialite")] },
  },
  commentsWritten50: {
    category: "community",
    rarity: "rare",
    criteria: metric("commentsWritten", 50),
    repeatable: false,
    rewards: { cosmetics: [title("chatterbox")] },
  },
  dailyChampion: {
    category: "ranking",
    rarity: "rare",
    criteria: rank(["DAY"], 1),
    repeatable: true,
    rewards: {},
  },
  hatTrick: {
    category: "ranking",
    rarity: "rare",
    criteria: streak(3),
    repeatable: false,
    rewards: { points: 100 },
  },
  unstoppable: {
    category: "ranking",
    rarity: "epic",
    criteria: streak(7),
    repeatable: false,
    rewards: { points: 300, cosmetics: [title("unstoppable")] },
  },
  sovereign: {
    category: "ranking",
    rarity: "legendary",
    criteria: streak(30),
    repeatable: false,
    rewards: { points: 1500, cosmetics: [title("sovereign")] },
  },
  topTen: {
    category: "ranking",
    rarity: "common",
    criteria: rank(["WEEK", "MONTH"], 10),
    repeatable: false,
    rewards: {},
  },
  weeklyPodium: {
    category: "ranking",
    rarity: "rare",
    criteria: rank(["WEEK"], 3),
    repeatable: true,
    rewards: {},
  },
  weeklyChampion: {
    category: "ranking",
    rarity: "epic",
    criteria: rank(["WEEK"], 1),
    repeatable: true,
    rewards: { cosmetics: [title("champion")] },
  },
  monthlyPodium: {
    category: "ranking",
    rarity: "epic",
    criteria: rank(["MONTH"], 3),
    repeatable: true,
    rewards: {},
  },
  monthlyChampion: {
    category: "ranking",
    rarity: "legendary",
    criteria: rank(["MONTH"], 1),
    repeatable: true,
    rewards: { cosmetics: [title("monarch")] },
  },
}

export const isAchievementKey = (value: unknown): value is AchievementKey =>
  ACHIEVEMENT_KEYS.some((key) => key === value)

/** The achievements earned by reaching a metric threshold, with their criteria narrowed. */
export const METRIC_ACHIEVEMENTS = ACHIEVEMENT_KEYS.flatMap((key) => {
  const { criteria, rewards } = ACHIEVEMENTS[key]

  return criteria.type === "metric"
    ? [{ key, metric: criteria.metric, threshold: criteria.threshold, points: rewards.points ?? 0 }]
    : []
})
