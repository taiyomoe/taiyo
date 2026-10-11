import { describe, expect, it } from "vitest"
import { getPageCount, getPageItems } from "../page-items"

describe("getPageCount", () => {
  it("rounds up and never drops below one page", () => {
    expect(getPageCount(41, 20)).toBe(3)
    expect(getPageCount(40, 20)).toBe(2)
    expect(getPageCount(0, 20)).toBe(1)
  })
})

describe("getPageItems", () => {
  it("lists every page when there are few", () => {
    expect(getPageItems(1, 1)).toEqual([1])
    expect(getPageItems(2, 4)).toEqual([1, 2, 3, 4])
  })

  it("collapses both sides around the current page", () => {
    expect(getPageItems(6, 12)).toEqual([1, "ellipsis-start", 5, 6, 7, "ellipsis-end", 12])
  })

  it("collapses only the far side at either end", () => {
    expect(getPageItems(1, 12)).toEqual([1, 2, "ellipsis-end", 12])
    expect(getPageItems(12, 12)).toEqual([1, "ellipsis-start", 11, 12])
  })
})
