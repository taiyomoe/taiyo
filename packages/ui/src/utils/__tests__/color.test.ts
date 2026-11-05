import { describe, expect, it } from "vitest"
import { hexToHsv, hsvToHex, parseHex } from "../color"

describe("parseHex", () => {
  it("normalises short and long hex, with or without #", () => {
    expect(parseHex("#ABC")).toBe("#aabbcc")
    expect(parseHex("f4f1ea")).toBe("#f4f1ea")
    expect(parseHex(" #000000 ")).toBe("#000000")
  })

  it("rejects anything else", () => {
    expect(parseHex("#12")).toBeNull()
    expect(parseHex("red")).toBeNull()
    expect(parseHex("#1234567")).toBeNull()
  })
})

describe("hexToHsv / hsvToHex", () => {
  it("round-trips colors", () => {
    for (const hex of ["#000000", "#ffffff", "#f2452d", "#3a3a3a", "#f4f1ea", "#1e90ff"]) {
      expect(hsvToHex(hexToHsv(hex))).toBe(hex)
    }
  })

  it("reads primaries", () => {
    expect(hexToHsv("#ff0000")).toEqual({ h: 0, s: 100, v: 100 })
    expect(hexToHsv("#00ff00")).toEqual({ h: 120, s: 100, v: 100 })
    expect(hsvToHex({ h: 240, s: 100, v: 100 })).toBe("#0000ff")
  })
})
