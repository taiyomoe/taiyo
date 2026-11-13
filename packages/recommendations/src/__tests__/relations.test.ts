import { describe, expect, it } from "vitest"
import { parseMangaDexRelations, withInverses } from "../relations"

describe("parseMangaDexRelations", () => {
  it("maps MangaDex relation names and drops the ones we don't keep", () => {
    expect(
      parseMangaDexRelations([
        {
          id: "re",
          relationships: [
            { id: "original", type: "manga", related: "prequel" },
            { id: "jack", type: "manga", related: "spin_off" },
            { id: "fan-work", type: "manga", related: "doujinshi" },
            { id: "author", type: "author" },
          ],
        },
      ]),
    ).toEqual([
      { from: "re", to: "original", type: "PREQUEL" },
      { from: "re", to: "jack", type: "SIDE_STORY" },
    ])
  })
})

describe("withInverses", () => {
  it("stores both directions once per pair and ignores self relations", () => {
    expect(
      withInverses([
        { mediaId: "a", relatedMediaId: "b", type: "SEQUEL" },
        { mediaId: "b", relatedMediaId: "a", type: "PREQUEL" },
        { mediaId: "a", relatedMediaId: "a", type: "SAME_FRANCHISE" },
        { mediaId: "c", relatedMediaId: "a", type: "ORIGINAL" },
      ]),
    ).toEqual([
      { mediaId: "a", relatedMediaId: "b", type: "SEQUEL" },
      { mediaId: "b", relatedMediaId: "a", type: "PREQUEL" },
      { mediaId: "c", relatedMediaId: "a", type: "ORIGINAL" },
      { mediaId: "a", relatedMediaId: "c", type: "ADAPTATION" },
    ])
  })
})
