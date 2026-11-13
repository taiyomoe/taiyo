import {
  computeSimilarities,
  DEFAULT_ENGINE_OPTIONS,
  type EngineInput,
  type EngineOptions,
  recommendFromSeeds,
} from "./engine"

export type EvaluationVariant = { name: string; options: Partial<EngineOptions> }

export const DEFAULT_VARIANTS: EvaluationVariant[] = [
  { name: "tags and staff only", options: { readersWeight: 0, popularityWeight: 0 } },
  {
    name: "readers only",
    options: {
      tagWeight: 0,
      metaWeight: 0,
      staffBoost: 0,
      readersWeight: 1,
      readersShrinkage: 0,
      popularityWeight: 0,
    },
  },
  { name: "blend, no popularity", options: { popularityWeight: 0 } },
  { name: "blend (current)", options: {} },
  { name: "blend, popularity 0.6", options: { popularityWeight: 0.6 } },
  { name: "blend, readers 0.4", options: { readersWeight: 0.4 } },
  { name: "blend, readers 0.8", options: { readersWeight: 0.8 } },
]

const POSITIVE_WEIGHT = 0.6
const createRandom = (seed: number) => {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0

    let t = state

    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

export const evaluateRecommendations = (
  input: EngineInput,
  {
    k = 10,
    maxUsers = 2000,
    minItems = 3,
    seed = 1,
    variants = DEFAULT_VARIANTS,
  }: Partial<{
    k: number
    maxUsers: number
    minItems: number
    seed: number
    variants: EvaluationVariant[]
  }> = {},
) => {
  const random = createRandom(seed)
  const byUser = new Map<string, Map<string, number>>()

  for (const { userId, mediaId, weight } of input.interactions) {
    const items = byUser.get(userId) ?? new Map<string, number>()

    items.set(mediaId, Math.max(items.get(mediaId) ?? 0, weight))
    byUser.set(userId, items)
  }

  const holdouts = new Map<string, string>()
  const eligible = [...byUser.entries()]
    .map(([userId, items]) => ({
      userId,
      positives: [...items.entries()].filter(([, weight]) => weight >= POSITIVE_WEIGHT),
    }))
    .filter(({ positives }) => positives.length >= minItems)
    .map((user) => ({ user, order: random() }))
    .sort((a, b) => a.order - b.order)
    .slice(0, maxUsers)

  for (const { user } of eligible) {
    const [mediaId] = user.positives[Math.floor(random() * user.positives.length)] ?? []

    if (mediaId !== undefined) {
      holdouts.set(user.userId, mediaId)
    }
  }

  const training = input.interactions.filter(
    (interaction) => holdouts.get(interaction.userId) !== interaction.mediaId,
  )
  const seedsOf = (userId: string) =>
    [...(byUser.get(userId) ?? new Map<string, number>()).entries()]
      .filter(([mediaId, weight]) => mediaId !== holdouts.get(userId) && weight > 0)
      .map(([mediaId, weight]) => ({ mediaId, weight }))
  const readerCounts = new Map<string, number>()

  for (const { mediaId, weight } of training) {
    if (weight > 0) {
      readerCounts.set(mediaId, (readerCounts.get(mediaId) ?? 0) + 1)
    }
  }

  const popular = [...readerCounts.entries()].sort(([, a], [, b]) => b - a).map(([id]) => id)
  const score = (name: string, recommend: (userId: string) => string[]) => {
    const recommended = new Set<string>()
    let hits = 0

    for (const [userId, holdout] of holdouts) {
      const recommendations = recommend(userId)

      for (const mediaId of recommendations) {
        recommended.add(mediaId)
      }

      hits += Number(recommendations.includes(holdout))
    }

    return {
      name,
      hitRate: holdouts.size === 0 ? 0 : hits / holdouts.size,
      coverage: input.medias.length === 0 ? 0 : recommended.size / input.medias.length,
    }
  }
  const baseline = score("most read (baseline)", (userId) => {
    const seen = new Set(seedsOf(userId).map((item) => item.mediaId))

    return popular.filter((mediaId) => !seen.has(mediaId)).slice(0, k)
  })
  const results = variants.map((variant) => {
    const similarities = computeSimilarities(
      { ...input, interactions: training },
      { ...DEFAULT_ENGINE_OPTIONS, ...variant.options },
    )

    return score(variant.name, (userId) =>
      recommendFromSeeds(seedsOf(userId), similarities, k).map((item) => item.mediaId),
    )
  })

  return { users: holdouts.size, k, results: [baseline, ...results] }
}
