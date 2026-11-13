import { describe, expect, it } from "vitest"
import {
  computeSimilarities,
  DEFAULT_ENGINE_OPTIONS,
  type EngineInput,
  type EngineMedia,
  recommendFromSeeds,
} from "../engine"

const media = (id: string, tags: string[], overrides: Partial<EngineMedia> = {}) =>
  ({
    id,
    tags: tags.map((key) => ({ key, isSpoiler: false })),
    type: "MANGA",
    demography: "SHOUNEN",
    countryOfOrigin: "JAPAN",
    contentRating: "NORMAL",
    staffIds: [],
    ...overrides,
  }) satisfies EngineMedia
const input = (overrides: Partial<EngineInput>) =>
  ({ medias: [], interactions: [], relations: [], ...overrides }) satisfies EngineInput
const idsOf = (items: ReadonlyArray<{ mediaId: string }> | undefined) =>
  (items ?? []).map((item) => item.mediaId)

describe("computeSimilarities", () => {
  it("ranks a rare shared tag above a common one", () => {
    const result = computeSimilarities(
      input({
        medias: [
          media("seed", ["ACTION", "FOOD"]),
          media("food", ["FOOD"]),
          media("action", ["ACTION"]),
          media("filler-1", ["ACTION"]),
          media("filler-2", ["ACTION"]),
        ],
      }),
    )

    expect(idsOf(result.get("seed"))[0]).toBe("food")
  })

  it("never lists the media itself or a related media", () => {
    const result = computeSimilarities(
      input({
        medias: [media("a", ["ROMANCE"]), media("sequel", ["ROMANCE"]), media("b", ["ROMANCE"])],
        relations: [["a", "sequel"]],
      }),
    )

    expect(idsOf(result.get("a"))).toEqual(["b"])
    expect(idsOf(result.get("sequel"))).toEqual(["b"])
  })

  it("finds other works of the same author without shared tags", () => {
    const result = computeSimilarities(
      input({
        medias: [
          media("a", ["ROMANCE"], { staffIds: ["author"] }),
          media("b", ["HORROR"], { staffIds: ["author"] }),
        ],
      }),
    )
    const [item] = result.get("a") ?? []

    expect(item).toMatchObject({ mediaId: "b", staff: true, tags: [] })
  })

  it("uses co-readers once there are enough of them", () => {
    const readers = Array.from({ length: 12 }, (_, index) => `user-${index}`)
    const result = computeSimilarities(
      input({
        medias: [media("a", ["ACTION"]), media("b", []), media("c", ["ACTION"])],
        interactions: readers.flatMap((userId) => [
          { userId, mediaId: "a", weight: 1 },
          { userId, mediaId: "b", weight: 1 },
        ]),
      }),
    )
    const items = result.get("a") ?? []

    expect(idsOf(items)[0]).toBe("b")
    expect(items[0]?.readers).toBe(true)
  })

  it("leaves tags alone when a pair has only one co-reader", () => {
    const result = computeSimilarities(
      input({
        medias: [media("a", ["ACTION", "MAGIC"]), media("b", []), media("c", ["ACTION", "MAGIC"])],
        interactions: [
          { userId: "u", mediaId: "a", weight: 1 },
          { userId: "u", mediaId: "b", weight: 1 },
        ],
      }),
    )

    expect(idsOf(result.get("a"))[0]).toBe("c")
  })

  it("keeps spoiler tags out of the reasons but in the score", () => {
    const result = computeSimilarities(
      input({
        medias: [
          media("a", ["ACTION"], { tags: [{ key: "TRAGEDY", isSpoiler: true }] }),
          media("b", [], { tags: [{ key: "TRAGEDY", isSpoiler: false }] }),
        ],
      }),
    )

    expect(result.get("a")).toEqual([expect.objectContaining({ mediaId: "b", tags: [] })])
  })

  it("penalizes a jump in content rating", () => {
    const result = computeSimilarities(
      input({
        medias: [
          media("a", ["ROMANCE"]),
          media("safe", ["ROMANCE"]),
          media("explicit", ["ROMANCE"], { contentRating: "NSFW" }),
        ],
      }),
    )

    expect(idsOf(result.get("a"))).toEqual(["safe", "explicit"])
  })

  it("keeps a full list for readers who hide explicit titles", () => {
    const explicit = ["x-1", "x-2", "x-3", "x-4", "x-5", "x-6"]
    const safe = ["safe-1", "safe-2", "safe-3"]
    const result = computeSimilarities(
      input({
        medias: [
          media("a", ["VAMPIRE", "ZOMBIE", "SURVIVAL"]),
          ...explicit.map((id) =>
            media(id, ["VAMPIRE", "ZOMBIE", "SURVIVAL"], { contentRating: "NSFW" }),
          ),
          ...safe.map((id) => media(id, ["VAMPIRE"])),
        ],
      }),
      { ...DEFAULT_ENGINE_OPTIONS, limit: 3 },
    )
    const ids = idsOf(result.get("a"))

    expect(ids.slice(0, 3).every((id) => explicit.includes(id))).toBe(true)
    expect(ids.filter((id) => safe.includes(id)).sort()).toEqual(safe)
  })

  it("spreads the list over different kinds of titles", () => {
    const medias = [
      media("seed", ["ACTION", "MAGIC", "ISEKAI", "ROMANCE"]),
      ...Array.from({ length: 4 }, (_, index) =>
        media(`clone-${index}`, ["ACTION", "MAGIC", "ISEKAI"]),
      ),
      media("other", ["ACTION", "MAGIC", "ROMANCE"]),
      ...Array.from({ length: 8 }, (_, index) => media(`filler-${index}`, ["ROMANCE"])),
    ]
    const top = (diversity: number) =>
      idsOf(
        computeSimilarities(input({ medias }), {
          ...DEFAULT_ENGINE_OPTIONS,
          limit: 3,
          diversity,
        }).get("seed"),
      )

    expect(top(0)).toEqual(["clone-0", "clone-1", "clone-2"])
    expect(top(DEFAULT_ENGINE_OPTIONS.diversity)).toContain("other")
  })
})

describe("recommendFromSeeds", () => {
  it("adds up evidence, skips what the reader already has and names the strongest seed", () => {
    const similarities = new Map([
      [
        "a",
        [
          { mediaId: "x", score: 0.5, tags: [], staff: false, readers: false },
          { mediaId: "b", score: 0.9, tags: [], staff: false, readers: false },
        ],
      ],
      [
        "b",
        [
          { mediaId: "x", score: 0.6, tags: [], staff: false, readers: false },
          { mediaId: "y", score: 0.7, tags: [], staff: false, readers: false },
        ],
      ],
    ])

    expect(
      recommendFromSeeds(
        [
          { mediaId: "a", weight: 1 },
          { mediaId: "b", weight: 1 },
        ],
        similarities,
        10,
      ),
    ).toEqual([
      { mediaId: "x", score: 1.1, because: "b" },
      { mediaId: "y", score: 0.7, because: "b" },
    ])
  })
})
