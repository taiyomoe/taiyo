import type { MediaSimilarityItem, MediaTags } from "@taiyomoe/db"
import { config } from "@taiyomoe/config"
import {
  CONTENT_RATINGS,
  type ContentRating,
  type MediaCountryOfOrigin,
  type MediaDemography,
  type MediaType,
} from "@taiyomoe/db/constants"

export type EngineMedia = {
  id: string
  tags: readonly MediaTags[]
  type: MediaType
  demography: MediaDemography
  countryOfOrigin: MediaCountryOfOrigin
  contentRating: ContentRating
  staffIds: readonly string[]
}

export type EngineInteraction = { userId: string; mediaId: string; weight: number }

export type EngineInput = {
  medias: readonly EngineMedia[]
  interactions: readonly EngineInteraction[]
  relations: ReadonlyArray<readonly [string, string]>
}

export const DEFAULT_ENGINE_OPTIONS = {
  limit: 30,
  candidatePool: 80,
  minScore: 0.05,
  tagWeight: 0.75,
  tagOverlapShrinkage: 1,
  metaWeight: 0.1,
  staffBoost: 0.3,
  readersWeight: 0.6,
  readersShrinkage: 4,
  ratingPenalty: 0.2,
  popularityWeight: 0.3,
  diversity: 0.3,
  maxItemsPerUser: 300,
  maxReasonTags: 3,
}

export type EngineOptions = typeof DEFAULT_ENGINE_OPTIONS

type Sparse = { indices: Int32Array; values: Float64Array }

type Candidate = { media: number; score: number; fromReaders: boolean }

const CATEGORY_WEIGHTS: ReadonlyArray<readonly [prefix: string, weight: number]> = [
  ["Genre", 1],
  ["Theme", 1],
  ["Sexual Content", 0.8],
  ["Setting", 0.7],
  ["Cast", 0.6],
  ["Demographic", 0.5],
  ["Technical", 0.15],
]
const TAG_CATEGORIES = new Map<string, string>(
  Object.entries(config.tags).map(([key, tag]) => [key, tag.category]),
)
const RATING_RANKS = new Map(CONTENT_RATINGS.map((rating, index) => [rating, index]))
const EMPTY: Sparse = { indices: new Int32Array(0), values: new Float64Array(0) }
const getTagWeight = (key: string) => {
  const category = TAG_CATEGORIES.get(key) ?? ""

  return CATEGORY_WEIGHTS.find(([prefix]) => category.startsWith(prefix))?.[1] ?? 0.5
}
const toSparse = (entries: ReadonlyArray<readonly [index: number, value: number]>) => ({
  indices: Int32Array.from(entries, ([index]) => index),
  values: Float64Array.from(entries, ([, value]) => value),
})
const encode = (values: readonly string[]) => {
  const codes = new Map<string, number>()

  return Int32Array.from(values, (value) => {
    const code = codes.get(value) ?? codes.size

    codes.set(value, code)

    return code
  })
}
const createTopK = (capacity: number) => {
  const heap: Candidate[] = []
  const scoreAt = (index: number) => heap[index]?.score ?? Number.POSITIVE_INFINITY
  const swap = (i: number, j: number) => {
    const left = heap[i]
    const right = heap[j]

    if (left !== undefined && right !== undefined) {
      heap[i] = right
      heap[j] = left
    }
  }

  return {
    accepts: (score: number) => heap.length < capacity || score > scoreAt(0),
    offer: (candidate: Candidate) => {
      if (heap.length < capacity) {
        heap.push(candidate)

        for (let i = heap.length - 1; i > 0 && scoreAt(i) < scoreAt((i - 1) >> 1);) {
          swap(i, (i - 1) >> 1)
          i = (i - 1) >> 1
        }

        return
      }

      heap[0] = candidate

      for (let i = 0; ;) {
        const left = 2 * i + 1
        const right = left + 1
        let smallest = i

        if (left < heap.length && scoreAt(left) < scoreAt(smallest)) {
          smallest = left
        }

        if (right < heap.length && scoreAt(right) < scoreAt(smallest)) {
          smallest = right
        }

        if (smallest === i) {
          return
        }

        swap(i, smallest)
        i = smallest
      }
    },
    size: () => heap.length,
    sorted: () => [...heap].sort((x, y) => y.score - x.score || x.media - y.media),
  }
}
const indexTags = (medias: readonly EngineMedia[]) => {
  const tagIds = new Map<string, number>()
  const frequencies: number[] = []
  const uniqueTags = medias.map((media) => [...new Set(media.tags.map((tag) => tag.key))])

  for (const keys of uniqueTags) {
    for (const key of keys) {
      const id = tagIds.get(key) ?? tagIds.size

      tagIds.set(key, id)
      frequencies[id] = (frequencies[id] ?? 0) + 1
    }
  }

  const weights = new Float64Array(tagIds.size)

  for (const [key, id] of tagIds) {
    weights[id] = Math.log(1 + medias.length / (frequencies[id] ?? 1)) * getTagWeight(key)
  }

  const vectors = uniqueTags.map((keys) => {
    const ids = keys.map((key) => tagIds.get(key) ?? 0).sort((a, b) => a - b)
    const norm = Math.sqrt(ids.reduce((total, id) => total + (weights[id] ?? 0) ** 2, 0))

    return toSparse(ids.map((id) => [id, norm === 0 ? 0 : (weights[id] ?? 0) / norm] as const))
  })
  const postingEntries = Array.from(
    { length: tagIds.size },
    () => [] as Array<readonly [media: number, value: number]>,
  )

  for (const [media, vector] of vectors.entries()) {
    for (const [k, id] of vector.indices.entries()) {
      postingEntries[id]?.push([media, vector.values[k] ?? 0])
    }
  }

  return { tagIds, weights, vectors, postings: postingEntries.map(toSparse) }
}
const indexReaders = (
  medias: readonly EngineMedia[],
  interactions: readonly EngineInteraction[],
  maxItemsPerUser: number,
) => {
  const indexById = new Map(medias.map((media, index) => [media.id, index]))
  const byUser = new Map<string, Map<number, number>>()

  for (const { userId, mediaId, weight } of interactions) {
    const media = indexById.get(mediaId)

    if (media === undefined || weight <= 0) {
      continue
    }

    const items = byUser.get(userId) ?? new Map<number, number>()

    items.set(media, Math.max(items.get(media) ?? 0, weight))
    byUser.set(userId, items)
  }

  const readerEntries = medias.map(() => [] as Array<readonly [user: number, value: number]>)
  const userItems = [...byUser.values()].map((items, user) => {
    const kept = [...items.entries()].sort(([, a], [, b]) => b - a).slice(0, maxItemsPerUser)
    const factor = 1 / Math.log2(2 + kept.length)

    return toSparse(
      kept.map(([media, weight]) => {
        readerEntries[media]?.push([user, weight * factor])

        return [media, weight * factor] as const
      }),
    )
  })
  const readers = readerEntries.map(toSparse)
  const norms = Float64Array.from(readers, (entries) =>
    Math.sqrt(entries.values.reduce((total, value) => total + value * value, 0)),
  )
  const mostRead = readers.reduce((max, entries) => Math.max(max, entries.indices.length), 0)
  const popularity = Float64Array.from(readers, (entries) =>
    mostRead === 0 ? 0 : Math.log1p(entries.indices.length) / Math.log1p(mostRead),
  )

  return { readers, userItems, norms, popularity }
}

export function* generateSimilarities(
  input: EngineInput,
  options: EngineOptions = DEFAULT_ENGINE_OPTIONS,
): Generator<[mediaId: string, items: MediaSimilarityItem[]]> {
  const { medias } = input
  const count = medias.length
  const indexById = new Map(medias.map((media, index) => [media.id, index]))
  const { tagIds, weights, vectors, postings } = indexTags(medias)
  const { readers, userItems, norms, popularity } = indexReaders(
    medias,
    input.interactions,
    options.maxItemsPerUser,
  )
  const demographies = encode(medias.map((media) => media.demography))
  const types = encode(medias.map((media) => media.type))
  const countries = encode(medias.map((media) => media.countryOfOrigin))
  const ratings = Int32Array.from(medias, (media) => RATING_RANKS.get(media.contentRating) ?? 0)
  const staffCodes = new Map<string, number>()
  const staffs = medias.map((media) =>
    Int32Array.from(
      new Set(
        media.staffIds.map((staffId) => {
          const code = staffCodes.get(staffId) ?? staffCodes.size

          staffCodes.set(staffId, code)

          return code
        }),
      ),
    ).sort(),
  )
  const staffMedias = staffs.reduce<number[][]>((byStaff, codes, media) => {
    for (const code of codes) {
      byStaff[code] = [...(byStaff[code] ?? []), media]
    }

    return byStaff
  }, [])
  const related = medias.map(() => [] as number[])
  const visibleTags = medias.map(
    (media) => new Set(media.tags.filter((tag) => !tag.isSpoiler).map((tag) => tag.key)),
  )

  for (const [a, b] of input.relations) {
    const left = indexById.get(a)
    const right = indexById.get(b)

    if (left !== undefined && right !== undefined) {
      related[left]?.push(right)
      related[right]?.push(left)
    }
  }

  const tagDot = new Float64Array(count)
  const sharedTags = new Int32Array(count)
  const readerDot = new Float64Array(count)
  const coReaders = new Int32Array(count)
  const sharedStaff = new Uint8Array(count)
  const blocked = new Uint8Array(count)
  const seen = new Uint8Array(count)
  const touched = new Int32Array(count)
  let touchedCount = 0
  const touch = (media: number) => {
    if (seen[media] === 0) {
      seen[media] = 1
      touched[touchedCount++] = media
    }
  }
  const noStaff = new Int32Array(0)
  const chosenTags = new Float64Array(weights.length)
  const chosenStaff = new Uint8Array(staffCodes.size)
  const diversify = (candidates: Candidate[]) => {
    const selected: Candidate[] = []
    const penalties = new Float64Array(candidates.length)
    const picked = new Uint8Array(candidates.length)
    const topScore = candidates[0]?.score ?? 1

    while (selected.length < options.limit && selected.length < candidates.length) {
      let best = -1
      let bestValue = Number.NEGATIVE_INFINITY

      for (let index = 0; index < candidates.length; index++) {
        const value =
          (1 - options.diversity) * ((candidates[index]?.score ?? 0) / topScore) -
          options.diversity * (penalties[index] ?? 0)

        if (picked[index] === 0 && value > bestValue) {
          best = index
          bestValue = value
        }
      }

      const choice = candidates[best]

      if (choice === undefined) {
        break
      }

      picked[best] = 1
      selected.push(choice)

      const chosen = vectors[choice.media] ?? EMPTY
      const chosenCodes = staffs[choice.media] ?? noStaff

      for (const [k, id] of chosen.indices.entries()) {
        chosenTags[id] = chosen.values[k] ?? 0
      }

      for (const code of chosenCodes) {
        chosenStaff[code] = 1
      }

      for (let index = 0; index < candidates.length; index++) {
        if (picked[index] === 1) {
          continue
        }

        const media = candidates[index]?.media ?? 0
        const vector = vectors[media] ?? EMPTY
        const codes = staffs[media] ?? noStaff
        let similarity = 0
        let sharesStaff = false

        for (let k = 0; k < vector.indices.length; k++) {
          similarity += (chosenTags[vector.indices[k] ?? 0] ?? 0) * (vector.values[k] ?? 0)
        }

        for (let k = 0; k < codes.length && !sharesStaff; k++) {
          sharesStaff = chosenStaff[codes[k] ?? 0] === 1
        }

        penalties[index] = Math.max(
          penalties[index] ?? 0,
          Math.min(1, similarity + (sharesStaff ? options.staffBoost : 0)),
        )
      }

      for (const id of chosen.indices) {
        chosenTags[id] = 0
      }

      for (const code of chosenCodes) {
        chosenStaff[code] = 0
      }
    }

    return selected
  }

  for (let a = 0; a < count; a++) {
    const vector = vectors[a] ?? EMPTY

    for (let k = 0; k < vector.indices.length; k++) {
      const posting = postings[vector.indices[k] ?? 0] ?? EMPTY
      const value = vector.values[k] ?? 0

      for (let p = 0; p < posting.indices.length; p++) {
        const b = posting.indices[p] ?? 0

        tagDot[b] = (tagDot[b] ?? 0) + value * (posting.values[p] ?? 0)
        sharedTags[b] = (sharedTags[b] ?? 0) + 1
        touch(b)
      }
    }

    for (const code of staffs[a] ?? noStaff) {
      for (const b of staffMedias[code] ?? []) {
        sharedStaff[b] = 1
        touch(b)
      }
    }

    const ownReaders = readers[a] ?? EMPTY

    for (let r = 0; r < ownReaders.indices.length; r++) {
      const items = userItems[ownReaders.indices[r] ?? 0] ?? EMPTY
      const value = ownReaders.values[r] ?? 0

      for (let i = 0; i < items.indices.length; i++) {
        const b = items.indices[i] ?? 0

        readerDot[b] = (readerDot[b] ?? 0) + value * (items.values[i] ?? 0)
        coReaders[b] = (coReaders[b] ?? 0) + 1
        touch(b)
      }
    }

    blocked[a] = 1

    for (const b of related[a] ?? []) {
      blocked[b] = 1
    }

    const ownNorm = norms[a] ?? 0
    let maxReaders = 0

    for (let t = 0; t < touchedCount; t++) {
      const b = touched[t] ?? 0
      const denominator = ownNorm * (norms[b] ?? 0)

      if (blocked[b] === 0 && denominator > 0) {
        maxReaders = Math.max(maxReaders, (readerDot[b] ?? 0) / denominator)
      }
    }

    const tops = CONTENT_RATINGS.map(() => createTopK(options.candidatePool))

    for (let t = 0; t < touchedCount; t++) {
      const b = touched[t] ?? 0

      if (blocked[b] === 1) {
        continue
      }

      const meta =
        (Number(demographies[b] === demographies[a]) +
          Number(types[b] === types[a]) +
          Number(countries[b] === countries[a])) /
        3
      const overlap = sharedTags[b] ?? 0
      const tagConfidence = overlap === 0 ? 0 : overlap / (overlap + options.tagOverlapShrinkage)
      const content =
        options.tagWeight * tagConfidence * (tagDot[b] ?? 0) +
        options.metaWeight * meta +
        (sharedStaff[b] === 1 ? options.staffBoost : 0)
      const shared = coReaders[b] ?? 0
      const denominator = ownNorm * (norms[b] ?? 0)
      const readerCosine = denominator === 0 ? 0 : (readerDot[b] ?? 0) / denominator
      const confidence = shared === 0 ? 0 : shared / (shared + options.readersShrinkage)
      const alpha = options.readersWeight * confidence
      const readersPart = alpha * (maxReaders === 0 ? 0 : readerCosine / maxReaders)
      const raw = (1 - alpha) * content + readersPart
      const ratingGap = Math.abs((ratings[b] ?? 0) - (ratings[a] ?? 0))
      const score =
        raw *
        Math.max(0, 1 - options.ratingPenalty * ratingGap) *
        (1 - options.popularityWeight + options.popularityWeight * (popularity[b] ?? 0))

      if (score < options.minScore) {
        continue
      }

      const candidate = { media: b, score, fromReaders: shared >= 3 && readersPart >= 0.4 * raw }

      for (let tier = ratings[b] ?? 0; tier < tops.length; tier++) {
        const top = tops[tier]

        if (top?.accepts(score) === true) {
          top.offer(candidate)
        }
      }
    }

    const ownTags = [...(visibleTags[a] ?? [])].sort(
      (x, y) => (weights[tagIds.get(y) ?? 0] ?? 0) - (weights[tagIds.get(x) ?? 0] ?? 0),
    )
    const picks = diversify(tops.at(-1)?.sorted() ?? [])
    const pickedMedias = new Set(picks.map((candidate) => candidate.media))

    for (let tier = tops.length - 2; tier >= 0; tier--) {
      const within = picks.filter((candidate) => (ratings[candidate.media] ?? 0) <= tier).length
      const pool = tops[tier]

      if (pool === undefined || within >= options.limit || pool.size() <= within) {
        continue
      }

      const extra = diversify(pool.sorted())
        .filter((candidate) => !pickedMedias.has(candidate.media))
        .slice(0, options.limit - within)

      for (const candidate of extra) {
        picks.push(candidate)
        pickedMedias.add(candidate.media)
      }
    }

    const items = picks.map((candidate) => {
      const theirs = visibleTags[candidate.media] ?? new Set<string>()

      return {
        mediaId: medias[candidate.media]?.id ?? "",
        score: Math.round(candidate.score * 1000) / 1000,
        tags: ownTags.filter((key) => theirs.has(key)).slice(0, options.maxReasonTags),
        staff: sharedStaff[candidate.media] === 1,
        readers: candidate.fromReaders,
      } satisfies MediaSimilarityItem
    })

    for (let t = 0; t < touchedCount; t++) {
      const b = touched[t] ?? 0

      tagDot[b] = 0
      sharedTags[b] = 0
      readerDot[b] = 0
      coReaders[b] = 0
      sharedStaff[b] = 0
      seen[b] = 0
    }

    touchedCount = 0
    blocked[a] = 0

    for (const b of related[a] ?? []) {
      blocked[b] = 0
    }

    yield [medias[a]?.id ?? "", items]
  }
}

export const computeSimilarities = (
  input: EngineInput,
  options: EngineOptions = DEFAULT_ENGINE_OPTIONS,
) => new Map(generateSimilarities(input, options))

export type Seed = { mediaId: string; weight: number }

export const recommendFromSeeds = (
  seeds: readonly Seed[],
  similarities: ReadonlyMap<string, readonly MediaSimilarityItem[]>,
  limit: number,
) => {
  const excluded = new Set(seeds.map((seed) => seed.mediaId))
  const scores = new Map<string, { score: number; because: string; best: number }>()

  for (const seed of seeds) {
    if (seed.weight <= 0) {
      continue
    }

    for (const item of similarities.get(seed.mediaId) ?? []) {
      if (excluded.has(item.mediaId)) {
        continue
      }

      const contribution = seed.weight * item.score
      const current = scores.get(item.mediaId)

      if (current === undefined) {
        scores.set(item.mediaId, { score: contribution, because: seed.mediaId, best: contribution })
      } else {
        current.score += contribution

        if (contribution > current.best) {
          current.best = contribution
          current.because = seed.mediaId
        }
      }
    }
  }

  return [...scores.entries()]
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, limit)
    .map(([mediaId, { score, because }]) => ({ mediaId, score, because }))
}
