import { describe, expect, it } from "vitest"
import { buildSpreads, findSpreadIndex } from "../reader-spreads"

const none = new Set<number>()

describe("buildSpreads", () => {
  it("shows one page per spread outside double mode", () => {
    expect(buildSpreads(3, { double: false, firstPageAlone: true, widePages: none })).toEqual([
      [0],
      [1],
      [2],
    ])
  })

  it("pairs pages, keeping the cover and a trailing page alone", () => {
    expect(buildSpreads(6, { double: true, firstPageAlone: true, widePages: none })).toEqual([
      [0],
      [1, 2],
      [3, 4],
      [5],
    ])
    expect(buildSpreads(4, { double: true, firstPageAlone: false, widePages: none })).toEqual([
      [0, 1],
      [2, 3],
    ])
  })

  it("never pairs a wide page", () => {
    expect(
      buildSpreads(6, { double: true, firstPageAlone: false, widePages: new Set([2]) }),
    ).toEqual([[0, 1], [2], [3, 4], [5]])
  })
})

describe("findSpreadIndex", () => {
  it("finds the spread holding a page", () => {
    const spreads = [[0], [1, 2], [3]]

    expect(findSpreadIndex(spreads, 2)).toBe(1)
    expect(findSpreadIndex(spreads, 9)).toBe(0)
  })
})
