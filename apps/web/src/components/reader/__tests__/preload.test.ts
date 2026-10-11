import { describe, expect, it } from "vitest"
import { getPreloadIndices } from "../preload"

describe("getPreloadIndices", () => {
  it("preloads the next three pages", () => {
    expect(getPreloadIndices(4, 20)).toEqual([5, 6, 7])
  })

  it("starts right after the first page", () => {
    expect(getPreloadIndices(0, 20)).toEqual([1, 2, 3])
  })

  it("stops at the last page", () => {
    expect(getPreloadIndices(17, 20)).toEqual([18, 19])
    expect(getPreloadIndices(19, 20)).toEqual([])
  })

  it("clamps an out-of-range position", () => {
    expect(getPreloadIndices(-3, 5)).toEqual([1, 2, 3])
    expect(getPreloadIndices(50, 5)).toEqual([])
  })

  it("returns nothing for an empty chapter", () => {
    expect(getPreloadIndices(0, 0)).toEqual([])
  })

  it("honours a custom lookahead", () => {
    expect(getPreloadIndices(2, 10, 2)).toEqual([3, 4])
  })
})
