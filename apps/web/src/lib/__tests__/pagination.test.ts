import { describe, expect, it } from "vitest"
import { getPageItems, parsePage } from "../pagination"

const render = (page: number, pageCount: number) =>
  getPageItems(page, pageCount).map((item) => (typeof item === "number" ? item : "…"))

describe("getPageItems", () => {
  it("lists every page when they all fit", () => {
    expect(render(1, 1)).toEqual([1])
    expect(render(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("keeps the same number of items on every page", () => {
    for (let page = 1; page <= 40; page++) {
      expect(getPageItems(page, 40)).toHaveLength(7)
    }
  })

  it("collapses the far side near the edges", () => {
    expect(render(1, 14)).toEqual([1, 2, 3, 4, 5, "…", 14])
    expect(render(4, 14)).toEqual([1, 2, 3, 4, 5, "…", 14])
    expect(render(11, 14)).toEqual([1, "…", 10, 11, 12, 13, 14])
    expect(render(14, 14)).toEqual([1, "…", 10, 11, 12, 13, 14])
  })

  it("shows the current page with its neighbours in the middle", () => {
    expect(render(5, 14)).toEqual([1, "…", 4, 5, 6, "…", 14])
    expect(render(10, 14)).toEqual([1, "…", 9, 10, 11, "…", 14])
  })

  it("never hides a single page behind an ellipsis", () => {
    const runs: number[] = []

    for (let pageCount = 1; pageCount <= 30; pageCount++) {
      for (let page = 1; page <= pageCount; page++) {
        const items = getPageItems(page, pageCount)

        runs.push(
          ...items.flatMap((item, index) =>
            typeof item === "number"
              ? []
              : [Number(items[index + 1]) - Number(items[index - 1]) - 1],
          ),
        )
      }
    }

    expect(runs.length).toBeGreaterThan(0)
    expect(runs.every((hidden) => hidden >= 2)).toBe(true)
  })
})

describe("parsePage", () => {
  it("accepts whole pages within range", () => {
    expect(parsePage("1", 14)).toBe(1)
    expect(parsePage("14", 14)).toBe(14)
    expect(parsePage("007", 14)).toBe(7)
  })

  it.each([
    "",
    "0",
    "15",
    "-1",
    "2.5",
    "1e1",
    "abc",
    " 3",
    "3 ",
    "+3",
    "0x5",
    "99999999999999999999",
  ])("rejects %j", (input) => {
    expect(parsePage(input, 14)).toBeNull()
  })
})
