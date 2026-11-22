import { describe, expect, it } from "vitest"
import { buildFormDataObject } from "../build-form-data-object"

describe("buildFormDataObject", () => {
  it("nests dotted and bracketed paths into objects and arrays", () => {
    const flat = {
      name: "One Punch Man",
      "titles.0.title": "OPM",
      "titles.0.main": true,
      "titles[1].title": "ワンパンマン",
      "covers.0.file": "cover.jpg",
      "links.mangadex": "https://mangadex.org",
    }

    expect(buildFormDataObject(Object.entries(flat))).toEqual({
      name: "One Punch Man",
      titles: [{ title: "OPM", main: true }, { title: "ワンパンマン" }],
      covers: [{ file: "cover.jpg" }],
      links: { mangadex: "https://mangadex.org" },
    })
  })

  it("keeps the last value of a repeated field", () => {
    expect(
      buildFormDataObject([
        ["a", 1],
        ["a", 2],
      ]),
    ).toEqual({ a: 2 })
  })

  it("ignores prototype keys and empty paths", () => {
    const built = buildFormDataObject([
      ["__proto__.polluted", true],
      ["a.constructor.prototype", true],
      ["", true],
      ["[]", true],
      ["ok", true],
    ])

    expect(built).toEqual({ ok: true })
    expect(Reflect.get({}, "polluted")).toBeUndefined()
  })

  it("stays linear in the number of fields", () => {
    const entries = Array.from({ length: 50_000 }, (_, index): [string, string] => [
      `k${index}`,
      "",
    ])
    const start = performance.now()

    buildFormDataObject(entries)

    expect(performance.now() - start).toBeLessThan(1000)
  })
})
